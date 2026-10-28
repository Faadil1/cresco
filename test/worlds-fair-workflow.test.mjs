import test from 'node:test';
import assert from 'node:assert/strict';
import { ed25519 } from '@noble/curves/ed25519';
import { PublicKey } from '@solana/web3.js';

import {
  approvalMessage,
  createMemoryWorkflowStore,
  createWorldFairWorkflow,
  validateWorkspacePolicy,
  verifyWalletSignature,
  walletBindingMessage,
  WorkflowError
} from '../src/worlds-fair-workflow.mjs';

import { fakeChain } from './helpers/world-fair-fake-chain.mjs';

async function setup({ behaviour = {}, price = 1, now = () => Date.now(), webhook = null, options = {} } = {}) {
  const chain = fakeChain({ price, behaviour });
  const delivered = [];
  const wf = createWorldFairWorkflow({
    store: createMemoryWorkflowStore(),
    chainFactory: () => chain,
    clock: now,
    options,
    fetchImpl: async (url, init) => {
      delivered.push({ url, body: JSON.parse(init.body) });
      return { ok: true };
    }
  });
  const created = await wf.createWorkspace({ name: 'Desk A', webhookUrl: webhook ?? undefined });
  const id = created.body.id;
  const t = created.body.tokens;
  const bearer = (role) => `Bearer ${t[role]}`;
  await wf.bootstrap(id, bearer('principal'));
  return { wf, chain, id, t, bearer, delivered };
}

const rejectsWith = async (fn, status, code) => {
  await assert.rejects(fn, (error) => {
    assert.ok(error instanceof WorkflowError, `expected WorkflowError, got ${error}`);
    assert.equal(error.httpStatus, status);
    assert.equal(error.code, code);
    return true;
  });
};

test('workspace creation returns one-time role tokens and stores only hashes', async () => {
  const store = createMemoryWorkflowStore();
  const wf = createWorldFairWorkflow({ store, chainFactory: () => fakeChain() });
  const created = await wf.createWorkspace({ name: 'Desk', principalLabel: 'Allocator' });
  assert.equal(created.status, 201);
  for (const role of ['operator', 'principal', 'risk']) assert.match(created.body.tokens[role], new RegExp(`^wf_${role}_`));
  const raw = JSON.stringify(await store.get(`wf:ws:${created.body.id}`));
  for (const token of Object.values(created.body.tokens)) assert.equal(raw.includes(token), false);
  assert.equal(created.body.chain.status, 'NOT_BOOTSTRAPPED');
  assert.equal(created.body.truthBoundary.onChainGuardian, 'SERVER_HELD_DEVNET_KEY');
});

test('CAP-02: operator intent inside standing authority executes without the principal', async () => {
  const { wf, id, bearer, chain } = await setup();
  const res = await wf.submitIntent(id, bearer('operator'), { inputAmount: 200_000, maxSlippageBps: 50, idempotencyKey: 'intent-0001' });
  assert.equal(res.status, 200);
  assert.equal(res.body.decision, 'ALLOW');
  assert.equal(res.body.principalApprovalRequired, false);
  assert.match(res.body.receipt.explorer, /explorer\.solana\.com\/tx\//);
  assert.equal(chain.st.spent, 200_000);
});

test('CAP-03: soft boundary refuses, returns Policy Diff and a durable PENDING request', async () => {
  const { wf, id, bearer } = await setup();
  const res = await wf.submitIntent(id, bearer('operator'), { inputAmount: 750_000 });
  assert.equal(res.status, 202);
  assert.equal(res.body.decision, 'PENDING_PRINCIPAL');
  assert.deepEqual(res.body.policyDiff.violatedDimensions, ['MAX_ACTION_NOTIONAL']);
  assert.equal(res.body.refusal.evidence, 'PROGRAM_PREFLIGHT_SIMULATION');
  const list = await wf.listRequests(id, bearer('operator'), { status: 'PENDING' });
  assert.equal(list.body.requests.length, 1);
  assert.equal(list.body.requests[0].mandateNonce, 7);
});

test('hard boundaries refuse with no exception path', async () => {
  const { wf, id, bearer } = await setup();
  const res = await wf.submitIntent(id, bearer('operator'), { inputAmount: 6_000_000 });
  assert.equal(res.body.decision, 'REFUSE');
  assert.equal(res.body.boundary, 'HARD');
  assert.equal(res.body.exceptionAvailable, false);
  await rejectsWith(() => wf.submitIntent(id, bearer('operator'), { inputAmount: 10, action: 'BORROW' }), 400, 'ACTION_UNSUPPORTED');
});

test('CAP-04: principal approval executes the exact exception once; standing authority unchanged', async () => {
  const { wf, id, bearer, chain } = await setup();
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 750_000 });
  const rid = pending.body.request.id;
  const res = await wf.decide(id, rid, bearer('principal'), { decision: 'APPROVE', note: 'rebalance' });
  assert.equal(res.body.request.status, 'EXECUTED');
  assert.equal(res.body.request.execution.allowanceConsumed, true);
  assert.equal(res.body.request.execution.standingAuthorityChanged, false);
  assert.equal(chain.st.maxAction, 500_000);
  // Replay: the same request cannot be decided twice.
  await rejectsWith(() => wf.decide(id, rid, bearer('principal'), { decision: 'APPROVE' }), 409, 'REQUEST_ALREADY_DECIDED');
});

test('risk owner can refuse; operator cannot decide', async () => {
  const { wf, id, bearer } = await setup();
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 900_000 });
  await rejectsWith(() => wf.decide(id, pending.body.request.id, bearer('operator'), { decision: 'APPROVE' }), 403, 'ROLE_FORBIDDEN');
  const res = await wf.decide(id, pending.body.request.id, bearer('risk'), { decision: 'REFUSE', note: 'too large' });
  assert.equal(res.body.request.status, 'REFUSED_BY_PRINCIPAL');
});

test('CAP-07: pausing the mandate refuses intents and makes pending exceptions stale', async () => {
  const { wf, id, bearer } = await setup();
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 800_000 });
  const paused = await wf.setStatus(id, bearer('principal'), { status: 'PAUSED' });
  assert.equal(paused.body.staleRequests, 1);
  const req = (await wf.listRequests(id, bearer('operator'))).body.requests.find((r) => r.id === pending.body.request.id);
  assert.equal(req.status, 'STALE');
  const refused = await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000 });
  assert.equal(refused.body.code, 'MandateNotActive');
  const resumed = await wf.setStatus(id, bearer('principal'), { status: 'ACTIVE' });
  assert.equal(resumed.body.mandate.status, 'ACTIVE');
  assert.equal((await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000 })).body.decision, 'ALLOW');
});

test('stale authority: a mandate change between request and approval refuses the grant', async () => {
  const { wf, id, bearer, chain } = await setup();
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 800_000 });
  chain.st.nonce += 1; // changed outside this workflow (e.g. another tool)
  const res = await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  assert.equal(res.body.request.status, 'STALE');
});

test('revocation needs explicit confirmation and is terminal', async () => {
  const { wf, id, bearer } = await setup();
  await rejectsWith(() => wf.setStatus(id, bearer('principal'), { status: 'REVOKED' }), 400, 'REVOKE_CONFIRMATION_REQUIRED');
  await rejectsWith(() => wf.setStatus(id, bearer('risk'), { status: 'PAUSED' }), 403, 'ROLE_FORBIDDEN');
  const revoked = await wf.setStatus(id, bearer('principal'), { status: 'REVOKED', confirm: 'REVOKE' });
  assert.equal(revoked.body.mandate.status, 'REVOKED');
  await rejectsWith(() => wf.submitIntent(id, bearer('operator'), { inputAmount: 1 }), 409, 'WORKSPACE_NOT_BOOTSTRAPPED');
});

test('policy revision changes standing limits on-chain and is bounded for Devnet safety', async () => {
  const { wf, id, bearer, chain } = await setup();
  await rejectsWith(() => wf.revisePolicy(id, bearer('principal'), { maxActionNotionalMicroUsd: 999_000_000 }), 400, 'POLICY_OUT_OF_BOUNDS');
  const res = await wf.revisePolicy(id, bearer('principal'), { maxActionNotionalMicroUsd: 1_000_000 });
  assert.equal(res.body.policy.maxActionNotionalMicroUsd, 1_000_000);
  assert.equal(chain.st.maxAction, 1_000_000);
  assert.equal((await wf.submitIntent(id, bearer('operator'), { inputAmount: 750_000 })).body.decision, 'ALLOW');
});

test('CAP-10: risk owner updates the asset rule and sees period consumption', async () => {
  const { wf, id, bearer } = await setup();
  await wf.submitIntent(id, bearer('operator'), { inputAmount: 400_000 });
  const before = await wf.mandate(id);
  assert.equal(before.body.consumption.spentAmount, 400_000);
  assert.equal(before.body.consumption.amountUsedPct, 4);
  const res = await wf.updateAssetRule(id, bearer('risk'), { maxActionAmount: 1_000_000, maxPeriodAmount: 2_000_000 });
  assert.equal(res.body.policy.maxActionAmount, 1_000_000);
  const after = await wf.mandate(id);
  assert.equal(after.body.consumption.spentAmount, 0);
  assert.equal(after.body.assetRule.maxPeriodAmount, 2_000_000);
});

test('CAP-08: history is durable, ordered and carries explorer receipts', async () => {
  const { wf, id, bearer } = await setup();
  await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000 });
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  const h = (await wf.history(id, bearer('operator'))).body.events;
  const types = h.map((e) => e.type);
  assert.deepEqual(types.slice(0, 3), ['EXCEPTION_EXECUTED', 'EXCEPTION_REQUESTED', 'INTENT_ALLOWED']);
  const executed = h[0];
  assert.deepEqual(executed.signatures.map((s) => s.label), ['exception.grant', 'exception.execute']);
  assert.ok(executed.signatures.every((s) => s.explorer.includes('cluster=devnet')));
  assert.ok(h.every((e, i) => i === 0 || e.seq < h[i - 1].seq));
});

test('CAP-11: principal is notified of pending requests (poll + webhook); operator of decisions', async () => {
  const { wf, id, bearer, delivered } = await setup({ webhook: 'https://hooks.example.com/cresco' });
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const p = await wf.notifications(id, bearer('principal'));
  assert.equal(p.body.pendingDecisions, 1);
  assert.ok(p.body.notifications.some((n) => n.type === 'EXCEPTION_REQUESTED'));
  assert.ok(delivered.some((d) => d.body.event.type === 'EXCEPTION_REQUESTED'));
  await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  const o = await wf.notifications(id, bearer('operator'), { since: 0 });
  assert.ok(o.body.notifications.some((n) => n.type === 'EXCEPTION_EXECUTED'));
  const next = await wf.notifications(id, bearer('operator'), { since: o.body.cursor });
  assert.equal(next.body.notifications.length, 0);
});

test('webhooks must be public https and never block outcomes', async () => {
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => fakeChain(), fetchImpl: async () => { throw new Error('down'); } });
  await rejectsWith(() => wf.createWorkspace({ webhookUrl: 'http://example.com' }), 400, 'WEBHOOK_INVALID');
  await rejectsWith(() => wf.createWorkspace({ webhookUrl: 'https://localhost/x' }), 400, 'WEBHOOK_INVALID');
  const ok = await wf.createWorkspace({ webhookUrl: 'https://hooks.example.com/x' });
  assert.equal(ok.status, 201);
});

test('robustness: idempotency key replays the stored decision instead of executing twice', async () => {
  const { wf, id, bearer, chain } = await setup();
  const first = await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000, idempotencyKey: 'order-42-abc' });
  const again = await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000, idempotencyKey: 'order-42-abc' });
  assert.equal(again.body.idempotentReplay, true);
  assert.equal(again.body.receipt.signature, first.body.receipt.signature);
  assert.equal(chain.st.calls.filter((c) => c[0] === 'intent').length, 1);
});

test('robustness: transport failure is UNKNOWN (never a fake success) and the key does not re-execute', async () => {
  const { wf, id, bearer, chain } = await setup({ behaviour: { intentThrows: true } });
  const res = await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000, idempotencyKey: 'order-99-xyz' });
  assert.equal(res.status, 503);
  assert.equal(res.body.decision, 'UNKNOWN');
  assert.equal(res.body.retryPolicy, 'REQUIRES_STATE_RECONCILIATION');
  await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000, idempotencyKey: 'order-99-xyz' });
  assert.equal(chain.st.calls.filter((c) => c[0] === 'intent').length, 1);
  const rec = await wf.reconcile(id, bearer('operator'));
  assert.equal(rec.body.reconciled[0].resolution, 'NO_SIGNATURE_RECORDED');
});

test('capital safety: UNKNOWN locks new idempotency keys through a no-signature reconcile', async () => {
  const { wf, id, bearer, chain } = await setup({ behaviour: { intentThrows: true } });
  const first = await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000, idempotencyKey: 'unknown-intent-001' });
  assert.equal(first.body.decision, 'UNKNOWN');
  const safety = await wf.intentSafety(id, bearer('operator'));
  assert.equal(safety.body.blocked, true);
  assert.equal(safety.body.idempotencyKey, 'unknown-intent-001');
  const afterFirst = chain.st.calls.filter((c) => c[0] === 'intent').length;
  await rejectsWith(() => wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000, idempotencyKey: 'new-intent-002' }), 409, 'INTENT_RECONCILIATION_REQUIRED');
  // Original idempotent response is replayed without any second chain attempt.
  const replay = await wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000, idempotencyKey: 'unknown-intent-001' });
  assert.equal(replay.body.decision, 'UNKNOWN');
  assert.equal(replay.body.idempotentReplay, true);
  assert.equal(chain.st.calls.filter((c) => c[0] === 'intent').length, afterFirst);
  const rec = await wf.reconcile(id, bearer('principal'));
  assert.equal(rec.body.reconciled[0].resolution, 'NO_SIGNATURE_RECORDED');
  assert.equal((await wf.intentSafety(id, bearer('operator'))).body.blocked, true);
  await rejectsWith(() => wf.submitIntent(id, bearer('operator'), { inputAmount: 100_000, idempotencyKey: 'third-intent-003' }), 409, 'INTENT_RECONCILIATION_REQUIRED');
});

test('capital safety: signed failed intent clears hold only after verified reconciliation', async () => {
  const { wf, id, bearer, chain } = await setup({ behaviour: { signatureStatus: () => ({ status: 'FAILED' }) } });
  const signature = '7'.repeat(88);
  chain.executeIntent = async (args) => {
    chain.st.calls.push(['intent', args.inputAmount]);
    throw new Error('SOLANA_CONFIRMATION_TIMEOUT:' + signature);
  };
  const first = await wf.submitIntent(id, bearer('operator'), { inputAmount: 110_000, idempotencyKey: 'signed-failed-001' });
  assert.equal(first.body.decision, 'UNKNOWN');
  await rejectsWith(() => wf.submitIntent(id, bearer('operator'), { inputAmount: 110_000, idempotencyKey: 'signed-failed-002' }), 409, 'INTENT_RECONCILIATION_REQUIRED');
  const rec = await wf.reconcile(id, bearer('principal'));
  assert.equal(rec.body.reconciled[0].resolution, 'EFFECTS_FAILED');
  assert.equal((await wf.intentSafety(id, bearer('operator'))).body.blocked, false);
  chain.executeIntent = async ({ inputAmount }) => {
    chain.st.calls.push(['intent', inputAmount]);
    chain.st.spent += inputAmount;
    return { decision: 'ALLOW', signature: '6'.repeat(88), quote: { notionalMicroUsd: inputAmount }, effectObserved: true };
  };
  const next = await wf.submitIntent(id, bearer('operator'), { inputAmount: 110_000, idempotencyKey: 'signed-failed-002' });
  assert.equal(next.body.decision, 'ALLOW');
  assert.equal(chain.st.spent, 110_000);
});

test('capital safety: pending signature and truncated event history do not release sticky hold', async () => {
  const { wf, id, bearer, chain } = await setup({
    behaviour: { signatureStatus: () => ({ status: 'PENDING' }) },
    options: { maxEvents: 2 }
  });
  chain.executeIntent = async () => { throw new Error('SOLANA_CONFIRMATION_TIMEOUT:' + '7'.repeat(88)); };
  await wf.submitIntent(id, bearer('operator'), { inputAmount: 110_000, idempotencyKey: 'signed-pending-001' });
  const rec = await wf.reconcile(id, bearer('principal'));
  assert.equal(rec.body.reconciled[0].resolution, 'STILL_UNKNOWN');
  for (let i = 0; i < 3; i++) {
    await wf.setStatus(id, bearer('principal'), { status: i % 2 ? 'ACTIVE' : 'PAUSED' });
  }
  const status = await wf.intentSafety(id, bearer('operator'));
  assert.equal(status.body.blocked, true);
  await rejectsWith(() => wf.submitIntent(id, bearer('operator'), { inputAmount: 110_000, idempotencyKey: 'signed-pending-002' }), 409, 'INTENT_RECONCILIATION_REQUIRED');
});

test('robustness: BUSY mandate returns 409 with retryAfter and leaves the request PENDING', async () => {
  const { wf, id, bearer, chain } = await setup();
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  chain.approveAndExecuteException = async () => { throw Object.assign(new Error('busy'), { worldFairBusy: true }); };
  await rejectsWith(() => wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' }), 409, 'BUSY');
  const req = (await wf.listRequests(id, bearer('operator'))).body.requests[0];
  assert.equal(req.status, 'PENDING');
});

test('robustness: unconfirmed approval becomes UNKNOWN and reconciles from the grant signature', async () => {
  const { wf, id, bearer } = await setup({ behaviour: { approveThrows: true, signatureStatus: () => ({ status: 'FAILED', err: '{}' }) } });
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const res = await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  assert.equal(res.status, 503);
  assert.equal(res.body.request.status, 'UNKNOWN');
  const rec = await wf.reconcile(id, bearer('principal'));
  assert.equal(rec.body.reconciled[0].resolution, 'EFFECTS_FAILED');
  assert.equal((await wf.listRequests(id, bearer('operator'))).body.requests[0].status, 'REFUSED_BY_PROGRAM');
});

test('robustness: venue failure rolls back and consumes nothing', async () => {
  const { wf, id, bearer } = await setup({ behaviour: { rollback: true } });
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const res = await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  assert.equal(res.body.request.status, 'ROLLED_BACK');
  const h = (await wf.history(id, bearer('operator'))).body.events[0];
  assert.equal(h.type, 'EXCEPTION_ROLLED_BACK');
  assert.equal(h.data.allowanceConsumed, false);
});

test('robustness: pending requests expire and interrupted approvals become UNKNOWN', async () => {
  let t = Date.parse('2026-10-12T12:00:00Z');
  const { wf, id, bearer } = await setup({ now: () => t });
  const a = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  t += 31 * 60 * 1000;
  await rejectsWith(() => wf.decide(id, a.body.request.id, bearer('principal'), { decision: 'APPROVE' }), 409, 'REQUEST_ALREADY_DECIDED');
  assert.equal((await wf.listRequests(id, bearer('operator'))).body.requests[0].status, 'EXPIRED');
});

test('robustness: price movement that makes the action fit standing does not auto-execute', async () => {
  const { wf, id, bearer, chain } = await setup();
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 600_000 });
  chain.st.maxAction = 700_000; // e.g. revised elsewhere without nonce change in this fake
  const res = await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  assert.equal(res.body.request.status, 'NOT_REQUIRED');
});

test('auth: missing, invalid and cross-workspace tokens are rejected', async () => {
  const a = await setup();
  const b = await setup();
  await rejectsWith(() => a.wf.submitIntent(a.id, '', { inputAmount: 1 }), 401, 'AUTH_REQUIRED');
  await rejectsWith(() => a.wf.submitIntent(a.id, 'Bearer wf_operator_nope', { inputAmount: 1 }), 401, 'AUTH_INVALID');
  await rejectsWith(() => a.wf.submitIntent(a.id, b.bearer('operator'), { inputAmount: 1 }), 401, 'AUTH_INVALID');
  await rejectsWith(() => a.wf.bootstrap(a.id, a.bearer('operator')), 403, 'ROLE_FORBIDDEN');
});

test('wallet-bound principal: approvals require a fresh signature from the bound wallet', async () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  const { wf, id, bearer } = await setup({ now: () => now });
  const secret = ed25519.utils.randomPrivateKey();
  const pub = new PublicKey(ed25519.getPublicKey(secret)).toBase58();
  const issuedAt = new Date(now).toISOString();
  const sign = (message) => Buffer.from(ed25519.sign(new TextEncoder().encode(message), secret)).toString('base64');

  await rejectsWith(() => wf.bindWallet(id, bearer('principal'), { publicKey: pub, issuedAt, signature: sign('wrong') }), 401, 'WALLET_SIGNATURE_INVALID');
  const bound = await wf.bindWallet(id, bearer('principal'), { publicKey: pub, issuedAt, signature: sign(walletBindingMessage({ workspaceId: id, issuedAt })) });
  assert.equal(bound.body.wallet.publicKey, pub);

  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const req = pending.body.request;
  await rejectsWith(() => wf.decide(id, req.id, bearer('principal'), { decision: 'APPROVE', issuedAt, walletSignature: sign('not the approval') }), 401, 'WALLET_SIGNATURE_INVALID');
  const stale = new Date(now - 10 * 60 * 1000).toISOString();
  await rejectsWith(() => wf.decide(id, req.id, bearer('principal'), { decision: 'APPROVE', issuedAt: stale, walletSignature: sign(approvalMessage({ workspaceId: id, request: req, issuedAt: stale })) }), 401, 'WALLET_SIGNATURE_EXPIRED');
  const ok = await wf.decide(id, req.id, bearer('principal'), { decision: 'APPROVE', issuedAt, walletSignature: sign(approvalMessage({ workspaceId: id, request: req, issuedAt })) });
  assert.equal(ok.body.request.status, 'EXECUTED');
  assert.equal(ok.body.request.decision.walletProof.publicKey, pub);
});

test('signature verification accepts hex/base64 and rejects malformed keys', () => {
  const secret = ed25519.utils.randomPrivateKey();
  const pub = new PublicKey(ed25519.getPublicKey(secret)).toBase58();
  const sig = ed25519.sign(new TextEncoder().encode('m'), secret);
  assert.equal(verifyWalletSignature({ publicKey: pub, message: 'm', signature: Buffer.from(sig).toString('hex') }), true);
  assert.equal(verifyWalletSignature({ publicKey: pub, message: 'm', signature: Buffer.from(sig).toString('base64') }), true);
  assert.equal(verifyWalletSignature({ publicKey: 'not-a-key', message: 'm', signature: 'x' }), false);
});

test('bootstrap failure is reported as safe-to-retry, not success', async () => {
  const chain = fakeChain({ behaviour: { bootstrapThrows: true } });
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => chain });
  const c = await wf.createWorkspace({});
  await rejectsWith(() => wf.bootstrap(c.body.id, `Bearer ${c.body.tokens.principal}`), 503, 'BOOTSTRAP_UNCONFIRMED');
  assert.equal((await wf.getWorkspace(c.body.id)).body.chain.status, 'NOT_BOOTSTRAPPED');
});

test('missing server secrets surface CHAIN_RUNTIME_UNAVAILABLE', async () => {
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: null });
  const c = await wf.createWorkspace({});
  await rejectsWith(() => wf.bootstrap(c.body.id, `Bearer ${c.body.tokens.principal}`), 503, 'CHAIN_RUNTIME_UNAVAILABLE');
});

test('workspace capacity protects the shared Devnet guardian', async () => {
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => fakeChain(), options: { maxWorkspaces: 1 } });
  await wf.createWorkspace({});
  await rejectsWith(() => wf.createWorkspace({}), 429, 'WORKSPACE_CAPACITY_REACHED');
});

test('policy validation keeps period limits consistent', () => {
  assert.throws(() => validateWorkspacePolicy({ maxActionNotionalMicroUsd: 2_000_000, maxPeriodNotionalMicroUsd: 1_000_000 }), /POLICY_INCONSISTENT|must be/);
  assert.equal(validateWorkspacePolicy({}).maxActionNotionalMicroUsd, 500_000);
});

test('review fix: an unconfirmed approval keeps the execution signature and is never recorded as refused', async () => {
  const { wf, id, bearer } = await setup({ behaviour: { approveThrows: true, signatureStatus: () => ({ status: 'PENDING' }) } });
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const res = await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  assert.equal(res.body.request.status, 'UNKNOWN');
  assert.equal(res.body.request.execution.signature, '7'.repeat(88));
  const unknown = (await wf.history(id, bearer('operator'))).body.events.find((e) => e.type === 'OUTCOME_UNKNOWN');
  assert.deepEqual(unknown.signatures.map((s) => s.label), ['exception.grant', 'exception.execute']);
  // It can never be decided a second time.
  await rejectsWith(() => wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' }), 409, 'REQUEST_ALREADY_DECIDED');
});

test('review fix: read endpoints never persist, so they cannot overwrite an in-flight approval', async () => {
  let t = Date.parse('2026-10-12T12:00:00Z');
  const { wf, id, bearer } = await setup({ now: () => t });
  await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  t += 31 * 60 * 1000;
  const before = (await wf.history(id, bearer('operator'))).body.events.length;
  assert.equal((await wf.listRequests(id, bearer('operator'))).body.requests[0].status, 'EXPIRED'); // computed view
  assert.equal((await wf.notifications(id, bearer('principal'))).body.pendingDecisions, 0);
  assert.equal((await wf.history(id, bearer('operator'))).body.events.length, before); // no write from GET
});

test('review fix: with a bound wallet only a wallet-signed principal can approve', async () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  const { wf, id, bearer } = await setup({ now: () => now });
  const secret = ed25519.utils.randomPrivateKey();
  const pub = new PublicKey(ed25519.getPublicKey(secret)).toBase58();
  const issuedAt = new Date(now).toISOString();
  const sign = (message) => Buffer.from(ed25519.sign(new TextEncoder().encode(message), secret)).toString('base64');
  await wf.bindWallet(id, bearer('principal'), { publicKey: pub, issuedAt, signature: sign(walletBindingMessage({ workspaceId: id, issuedAt })) });
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  await rejectsWith(() => wf.decide(id, pending.body.request.id, bearer('risk'), { decision: 'APPROVE' }), 403, 'PRINCIPAL_WALLET_APPROVAL_REQUIRED');
  const refused = await wf.decide(id, pending.body.request.id, bearer('risk'), { decision: 'REFUSE' });
  assert.equal(refused.body.request.status, 'REFUSED_BY_PRINCIPAL');
});

test('review fix: editing limits never silently re-enables a disabled asset rule', async () => {
  const { wf, id, bearer, chain } = await setup();
  await wf.updateAssetRule(id, bearer('risk'), { maxActionAmount: 4_000_000, maxPeriodAmount: 9_000_000, enabled: false });
  assert.equal(chain.st.enabled, false);
  await wf.updateAssetRule(id, bearer('risk'), { maxActionAmount: 3_000_000, maxPeriodAmount: 9_000_000 });
  assert.equal(chain.st.enabled, false);
});

test('review fix: optional create token and top-up cooldown protect the shared guardian', async () => {
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => fakeChain(), options: { createToken: 'lab-secret' } });
  await rejectsWith(() => wf.createWorkspace({}), 401, 'CREATE_TOKEN_REQUIRED');
  assert.equal((await wf.createWorkspace({}, 'lab-secret')).status, 201);

  let t = Date.parse('2026-10-12T12:00:00Z');
  const { wf: wf2, id, bearer } = await setup({ now: () => t });
  assert.equal((await wf2.topUpVault(id, bearer('principal'))).status, 200);
  await rejectsWith(() => wf2.topUpVault(id, bearer('principal')), 429, 'TOPUP_COOLDOWN');
  t += 11 * 60 * 1000;
  assert.equal((await wf2.topUpVault(id, bearer('principal'))).status, 200);
});

test('live fix: a confirmed grant without an execution transaction reconciles as NOT_EXECUTED, never as executed', async () => {
  const { wf, id, bearer, chain } = await setup({ behaviour: { signatureStatus: () => ({ status: 'CONFIRMED' }) } });
  chain.approveAndExecuteException = async () => {
    throw Object.assign(new Error('Simulation failed: Error processing Instruction 1: custom program error: 0x1'), { worldFairGrant: { signature: 'g'.repeat(64) } });
  };
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const res = await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  assert.equal(res.body.request.status, 'UNKNOWN');
  const rec = await wf.reconcile(id, bearer('principal'));
  assert.equal(rec.body.reconciled[0].resolution, 'GRANT_ONLY_EXECUTION_NOT_SENT');
  assert.equal((await wf.listRequests(id, bearer('operator'))).body.requests[0].status, 'NOT_EXECUTED');
});

test('wallet-bound approval forwards the exact signed message to the chain for on-chain verification', async () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  const { wf, id, bearer, chain } = await setup({ now: () => now });
  const secret = ed25519.utils.randomPrivateKey();
  const pub = new PublicKey(ed25519.getPublicKey(secret)).toBase58();
  const issuedAt = new Date(now).toISOString();
  const sign = (message) => Buffer.from(ed25519.sign(new TextEncoder().encode(message), secret)).toString('base64');
  await wf.bindWallet(id, bearer('principal'), { publicKey: pub, issuedAt, signature: sign(walletBindingMessage({ workspaceId: id, issuedAt })) });
  let seen = null;
  const original = chain.approveAndExecuteException;
  chain.approveAndExecuteException = async (args) => { seen = args.approvalProof; return original(args); };
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const req = pending.body.request;
  const message = approvalMessage({ workspaceId: id, request: req, issuedAt });
  await wf.decide(id, req.id, bearer('principal'), { decision: 'APPROVE', issuedAt, walletSignature: sign(message) });
  assert.equal(seen.publicKey, pub);
  assert.equal(seen.message, message);
  assert.equal(seen.signature.length, 64);
  assert.ok(ed25519.verify(seen.signature, new TextEncoder().encode(seen.message), new PublicKey(pub).toBytes()));
});

test('a workspace carries its presentation (family or delegated capital); the mechanism is identical', async () => {
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => fakeChain() });
  const family = await wf.createWorkspace({ useCase: 'family', principalLabel: 'Parent', operatorLabel: 'Maya (16)' });
  assert.equal(family.body.useCase, 'family');
  assert.equal(family.body.roles.operator.label, 'Maya (16)');
  assert.equal((await wf.createWorkspace({ useCase: 'anything-else' })).body.useCase, 'capital');
  assert.equal((await wf.createWorkspace({})).body.useCase, 'capital');
});

// Principal-wallet guardian: the fake chain asks for the wallet signature
// exactly where the real provider would, and only proceeds after submit.
function walletGuardianChain() {
  const chain = fakeChain();
  const prepared = new Map();
  let n = 0;
  const ask = (label, onConfirm, extra = {}) => {
    const message = `msg-${label}-${++n}`;
    prepared.set(message, onConfirm);
    return { status: 'NEEDS_GUARDIAN_SIGNATURE', guardianSignature: { label, guardian: 'PrincipalWallet', transaction: `tx-${message}`, message, lastValidBlockHeight: 1 }, ...extra };
  };
  let bootstrapped = false;
  const base = { ...chain };
  Object.assign(chain, {
    walletGuardian: true,
    async bootstrapWorkspace() {
      if (!bootstrapped) return ask('bootstrap_mandate', () => { bootstrapped = true; });
      return base.bootstrapWorkspace();
    },
    async approveAndExecuteException({ inputAmount, slippageBps, expectedNonce }) {
      const q = { inputAmount, slippageBps, notionalMicroUsd: inputAmount };
      if (q.notionalMicroUsd <= chain.st.maxAction) return { status: 'NOT_REQUIRED', code: 'ExceptionNotRequired', quote: q };
      return ask('grant_allowance_once', () => {}, { pendingException: { inputAmount, expectedNonce, allowance: 'AllowancePda', requestHash: 'ab'.repeat(32), quote: q } });
    },
    async setMandateStatus({ status }) {
      return ask('set_mandate_status', () => { chain.st.status = status; chain.st.nonce += 1; chain.st.version += 1; });
    },
    async submitGuardianTransaction({ signedTransaction, expectedMessage }) {
      if (signedTransaction !== `signed:tx-${expectedMessage}`) throw new Error('WORLD_FAIR_GUARDIAN_TRANSACTION_ALTERED');
      prepared.get(expectedMessage)();
      return { status: 'CONFIRMED', signature: `walletSig-${expectedMessage}`.padEnd(64, 'w') };
    },
    async executeGrantedException({ pending, grantSignature }) {
      chain.st.spent += pending.inputAmount;
      return { status: 'EXECUTED', grant: { signature: grantSignature, allowance: pending.allowance }, executionSignature: 'execSig'.padEnd(64, 'e'), allowanceConsumed: true, quote: pending.quote, standingMandateVersionBefore: chain.st.version, standingMandateVersionAfter: chain.st.version, standingAuthorityChanged: false };
    }
  });
  return chain;
}

test('principal-wallet guardian: bootstrap, approval and pause all wait for the wallet-signed transaction', async () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  const chain = walletGuardianChain();
  const factoryCalls = [];
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: (args) => { factoryCalls.push(args); return chain; }, clock: () => now });
  const created = await wf.createWorkspace({ name: 'Family', useCase: 'family', guardianMode: 'principal-wallet' });
  assert.equal(created.body.guardianMode, 'principal-wallet');
  assert.equal(created.body.truthBoundary.onChainGuardian, 'PRINCIPAL_WALLET_NON_CUSTODIAL');
  const id = created.body.id;
  const bearer = (role) => `Bearer ${created.body.tokens[role]}`;

  // No wallet yet: there is no guardian to sign.
  await rejectsWith(() => wf.bootstrap(id, bearer('principal')), 409, 'PRINCIPAL_WALLET_REQUIRED');
  const secret = ed25519.utils.randomPrivateKey();
  const pub = new PublicKey(ed25519.getPublicKey(secret)).toBase58();
  const issuedAt = new Date(now).toISOString();
  const sign = (message) => Buffer.from(ed25519.sign(new TextEncoder().encode(message), secret)).toString('base64');
  await wf.bindWallet(id, bearer('principal'), { publicKey: pub, issuedAt, signature: sign(walletBindingMessage({ workspaceId: id, issuedAt })) });

  const boot = await wf.bootstrap(id, bearer('principal'));
  assert.equal(boot.status, 202);
  assert.equal(factoryCalls.at(-1).guardianWallet, pub);
  const op = boot.body.needsGuardianSignature;
  await rejectsWith(() => wf.submitGuardian(id, bearer('operator'), { opId: op.opId, signedTransaction: 'x' }), 403, 'ROLE_FORBIDDEN');
  const ready = await wf.submitGuardian(id, bearer('principal'), { opId: op.opId, signedTransaction: `signed:${op.transaction}` });
  assert.equal(ready.status, 200);
  assert.equal(ready.body.chain.status, 'READY');
  // One submission per prepared transaction.
  await rejectsWith(() => wf.submitGuardian(id, bearer('principal'), { opId: op.opId, signedTransaction: `signed:${op.transaction}` }), 410, 'GUARDIAN_OP_EXPIRED');

  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const rid = pending.body.request.id;
  await rejectsWith(() => wf.decide(id, rid, bearer('risk'), { decision: 'APPROVE' }), 403, 'PRINCIPAL_WALLET_APPROVAL_REQUIRED');
  const grantOp = await wf.decide(id, rid, bearer('principal'), { decision: 'APPROVE' });
  assert.equal(grantOp.status, 202);
  assert.equal(grantOp.body.needsGuardianSignature.kind, 'GRANT');
  // Until the wallet signs, nothing is granted: the request is still pending.
  assert.equal((await wf.listRequests(id, bearer('operator'))).body.requests.find((r) => r.id === rid).status, 'PENDING');
  const g = grantOp.body.needsGuardianSignature;
  await rejectsWith(() => wf.submitGuardian(id, bearer('principal'), { opId: g.opId, signedTransaction: 'signed:tx-something-else' }), 400, 'GUARDIAN_TRANSACTION_ALTERED');

  const grantOp2 = await wf.decide(id, rid, bearer('principal'), { decision: 'APPROVE' });
  const g2 = grantOp2.body.needsGuardianSignature;
  const done = await wf.submitGuardian(id, bearer('principal'), { opId: g2.opId, signedTransaction: `signed:${g2.transaction}` });
  assert.equal(done.body.request.status, 'EXECUTED');
  assert.equal(done.body.request.grant.signature.startsWith('walletSig-'), true);
  assert.equal(done.body.request.decision.walletProof.grantTransactionSignedByGuardianWallet, true);

  const pause = await wf.setStatus(id, bearer('principal'), { status: 'PAUSED' });
  assert.equal(pause.status, 202);
  assert.equal(chain.st.status, 'ACTIVE', 'not paused until the wallet signs');
  const p = pause.body.needsGuardianSignature;
  await wf.submitGuardian(id, bearer('principal'), { opId: p.opId, signedTransaction: `signed:${p.transaction}` });
  assert.equal(chain.st.status, 'PAUSED');
  const history = (await wf.history(id, bearer('operator'))).body.events.map((e) => e.type);
  assert.ok(history.includes('MANDATE_STATUS_CHANGED'));
  assert.ok(history.includes('EXCEPTION_EXECUTED'));
});

test('principal-wallet guardian: the guardian wallet cannot be swapped after bootstrap', async () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  const chain = walletGuardianChain();
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => chain, clock: () => now });
  const created = await wf.createWorkspace({ guardianMode: 'principal-wallet' });
  const id = created.body.id;
  const bearer = (role) => `Bearer ${created.body.tokens[role]}`;
  const issuedAt = new Date(now).toISOString();
  const bind = async () => {
    const secret = ed25519.utils.randomPrivateKey();
    const pub = new PublicKey(ed25519.getPublicKey(secret)).toBase58();
    const signature = Buffer.from(ed25519.sign(new TextEncoder().encode(walletBindingMessage({ workspaceId: id, issuedAt })), secret)).toString('base64');
    return wf.bindWallet(id, bearer('principal'), { publicKey: pub, issuedAt, signature });
  };
  await bind();
  const op = (await wf.bootstrap(id, bearer('principal'))).body.needsGuardianSignature;
  await wf.submitGuardian(id, bearer('principal'), { opId: op.opId, signedTransaction: `signed:${op.transaction}` });
  await rejectsWith(bind, 409, 'GUARDIAN_WALLET_FIXED');
});
