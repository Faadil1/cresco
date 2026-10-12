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

// Fake chain adapter that mirrors the CRESCO program decisions used by the
// workflow: nonce staleness, mandate status, standing notional, single use.
function fakeChain({ price = 1, behaviour = {} } = {}) {
  const st = {
    nonce: 7,
    version: 7,
    status: 'ACTIVE',
    maxAction: 500_000,
    maxPeriod: 10_000_000,
    maxActionAmount: 5_000_000,
    maxPeriodAmount: 10_000_000,
    spent: 0,
    spentNotional: 0,
    enabled: true,
    sigs: 0,
    calls: [],
    usedAllowances: new Set()
  };
  const sig = (label) => `${label}Sig${++st.sigs}`.padEnd(64, 'x');
  const view = () => ({
    accounts: { mandate: 'MandatePda' },
    guardian: 'Guardian',
    delegate: 'Delegate',
    mandate: { stage: 3, status: st.status, version: st.version, nonce: st.nonce, maxActionNotionalMicroUsd: st.maxAction, maxPeriodNotionalMicroUsd: st.maxPeriod },
    assetRule: { enabled: st.enabled, maxActionAmount: st.maxActionAmount, maxPeriodAmount: st.maxPeriodAmount, periodSeconds: 86_400, periodStartedAt: Math.floor(Date.now() / 1000) - 60, spentThisPeriod: st.spent, spentThisPeriodNotionalMicroUsd: st.spentNotional }
  });
  const advance = () => { st.nonce += 1; st.version += 1; };
  const quote = (amount, bps) => ({ inputAmount: amount, slippageBps: bps, notionalMicroUsd: Math.floor(amount * price), estimatedOutput: amount, minOutput: Math.floor(amount * (1 - bps / 10_000)) });
  const chain = {
    st,
    async bootstrapWorkspace() {
      st.calls.push('bootstrap');
      if (behaviour.bootstrapThrows) throw new Error('blockhash expired');
      return { bootstrap: { initializeCharter: sig('charter'), initializeMandate: sig('mandate') }, ...view() };
    },
    async readMandate() {
      return view();
    },
    async executeIntent({ inputAmount, slippageBps }) {
      st.calls.push(['intent', inputAmount]);
      if (behaviour.busy) throw Object.assign(new Error('WORLD_FAIR_MANDATE_BUSY'), { worldFairBusy: true });
      if (behaviour.intentThrows) throw new Error('fetch failed: socket hang up');
      const q = quote(inputAmount, slippageBps);
      const before = view().mandate;
      if (st.status !== 'ACTIVE') return { decision: 'REFUSE', boundary: 'HARD', code: 'MandateNotActive', quote: q, mandateBefore: before };
      if (inputAmount > st.maxActionAmount) return { decision: 'REFUSE', boundary: 'HARD', code: 'ActionAmountExceeded', quote: q, mandateBefore: before, refusalEvidence: 'PROGRAM_PREFLIGHT_SIMULATION' };
      if (q.notionalMicroUsd > st.maxAction) {
        return { decision: 'REFUSE', boundary: 'SOFT', code: 'PythNotionalExceeded', refusalEvidence: 'PROGRAM_PREFLIGHT_SIMULATION', quote: q, standingMaxNotionalMicroUsd: st.maxAction, policyDiff: { perActionNotional: 'VIOLATED', violatedDimensions: ['MAX_ACTION_NOTIONAL'] }, mandateBefore: before };
      }
      st.spent += inputAmount;
      st.spentNotional += q.notionalMicroUsd;
      return { decision: 'ALLOW', boundary: 'STANDING', signature: sig('standing'), quote: q, standingMaxNotionalMicroUsd: st.maxAction, effectObserved: true, mandateBefore: before, mandateAfter: view().mandate, assetRuleAfter: view().assetRule };
    },
    async approveAndExecuteException({ inputAmount, slippageBps, expectedNonce }) {
      st.calls.push(['approve', inputAmount, expectedNonce]);
      if (behaviour.approveThrows) {
        const grant = { signature: sig('grant') };
        throw Object.assign(new Error(`SOLANA_CONFIRMATION_TIMEOUT:${'7'.repeat(88)}`), { worldFairGrant: grant, worldFairExecutionSignature: '7'.repeat(88) });
      }
      if (st.nonce !== expectedNonce) return { status: 'STALE', code: 'StaleNonce', currentNonce: st.nonce, requestNonce: expectedNonce };
      if (st.status !== 'ACTIVE') return { status: 'REFUSED', boundary: 'HARD', code: 'MandateNotActive' };
      const q = quote(inputAmount, slippageBps);
      if (q.notionalMicroUsd <= st.maxAction) return { status: 'NOT_REQUIRED', code: 'ExceptionNotRequired', quote: q };
      const grant = { signature: sig('grant'), allowance: `Allowance${st.sigs}`, requestHash: 'ab'.repeat(32), maxNotionalMicroUsd: q.notionalMicroUsd, mandateNonce: st.nonce };
      if (behaviour.rollback) return { status: 'ROLLED_BACK', code: 'AmountOutBelowMinimum', boundary: 'VENUE', grant, allowanceConsumed: false, quote: q };
      if (st.usedAllowances.has(grant.requestHash + expectedNonce + inputAmount)) return { status: 'EXECUTION_REFUSED', code: 'AllowanceAlreadyUsed', boundary: 'HARD', grant };
      st.usedAllowances.add(grant.requestHash + expectedNonce + inputAmount);
      const versionBefore = st.version;
      st.spent += inputAmount;
      st.spentNotional += q.notionalMicroUsd;
      return { status: 'EXECUTED', grant, executionSignature: sig('exec'), allowanceConsumed: true, quote: q, standingMandateVersionBefore: versionBefore, standingMandateVersionAfter: st.version, standingAuthorityChanged: false, assetRuleAfter: view().assetRule };
    },
    async setMandateStatus({ status, expectedNonce }) {
      if (expectedNonce !== st.nonce) return { status: 'REFUSED', code: 'StaleNonce' };
      if (st.status === 'REVOKED') return { status: 'REFUSED', code: 'MandateRevoked' };
      st.status = status;
      advance();
      return { status: 'CONFIRMED', signature: sig('status'), mandate: view().mandate };
    },
    async revisePolicy({ values, expectedNonce }) {
      if (expectedNonce !== st.nonce) return { status: 'REFUSED', code: 'StaleNonce' };
      st.maxAction = values.maxActionNotionalMicroUsd;
      st.maxPeriod = values.maxPeriodNotionalMicroUsd;
      advance();
      return { status: 'CONFIRMED', signature: sig('policy'), mandate: view().mandate };
    },
    async updateRule({ values, expectedNonce }) {
      if (expectedNonce !== st.nonce) return { status: 'REFUSED', code: 'StaleNonce' };
      st.maxActionAmount = values.maxActionAmount;
      st.maxPeriodAmount = values.maxPeriodAmount;
      st.enabled = values.enabled;
      st.spent = 0;
      st.spentNotional = 0;
      advance();
      return { status: 'CONFIRMED', signature: sig('rule'), mandate: view() };
    },
    async signatureStatus(signature) {
      return behaviour.signatureStatus?.(signature) ?? { status: 'CONFIRMED' };
    }
  };
  return chain;
}

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
  const list = await wf.listRequests(id, { status: 'PENDING' });
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
  const req = (await wf.listRequests(id)).body.requests.find((r) => r.id === pending.body.request.id);
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
  const h = (await wf.history(id)).body.events;
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

test('robustness: BUSY mandate returns 409 with retryAfter and leaves the request PENDING', async () => {
  const { wf, id, bearer, chain } = await setup();
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  chain.approveAndExecuteException = async () => { throw Object.assign(new Error('busy'), { worldFairBusy: true }); };
  await rejectsWith(() => wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' }), 409, 'BUSY');
  const req = (await wf.listRequests(id)).body.requests[0];
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
  assert.equal((await wf.listRequests(id)).body.requests[0].status, 'REFUSED_BY_PROGRAM');
});

test('robustness: venue failure rolls back and consumes nothing', async () => {
  const { wf, id, bearer } = await setup({ behaviour: { rollback: true } });
  const pending = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  const res = await wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' });
  assert.equal(res.body.request.status, 'ROLLED_BACK');
  const h = (await wf.history(id)).body.events[0];
  assert.equal(h.type, 'EXCEPTION_ROLLED_BACK');
  assert.equal(h.data.allowanceConsumed, false);
});

test('robustness: pending requests expire and interrupted approvals become UNKNOWN', async () => {
  let t = Date.parse('2026-10-12T12:00:00Z');
  const { wf, id, bearer } = await setup({ now: () => t });
  const a = await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  t += 31 * 60 * 1000;
  await rejectsWith(() => wf.decide(id, a.body.request.id, bearer('principal'), { decision: 'APPROVE' }), 409, 'REQUEST_ALREADY_DECIDED');
  assert.equal((await wf.listRequests(id)).body.requests[0].status, 'EXPIRED');
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
  const unknown = (await wf.history(id)).body.events.find((e) => e.type === 'OUTCOME_UNKNOWN');
  assert.deepEqual(unknown.signatures.map((s) => s.label), ['exception.grant', 'exception.execute']);
  // It can never be decided a second time.
  await rejectsWith(() => wf.decide(id, pending.body.request.id, bearer('principal'), { decision: 'APPROVE' }), 409, 'REQUEST_ALREADY_DECIDED');
});

test('review fix: read endpoints never persist, so they cannot overwrite an in-flight approval', async () => {
  let t = Date.parse('2026-10-12T12:00:00Z');
  const { wf, id, bearer } = await setup({ now: () => t });
  await wf.submitIntent(id, bearer('operator'), { inputAmount: 700_000 });
  t += 31 * 60 * 1000;
  const before = (await wf.history(id)).body.events.length;
  assert.equal((await wf.listRequests(id)).body.requests[0].status, 'EXPIRED'); // computed view
  assert.equal((await wf.notifications(id, bearer('principal'))).body.pendingDecisions, 0);
  assert.equal((await wf.history(id)).body.events.length, before); // no write from GET
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
  assert.equal((await wf.listRequests(id)).body.requests[0].status, 'NOT_EXECUTED');
});
