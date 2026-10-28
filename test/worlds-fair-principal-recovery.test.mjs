import test from 'node:test';
import assert from 'node:assert/strict';
import { ed25519 } from '@noble/curves/ed25519';
import { PublicKey } from '@solana/web3.js';
import { createMemoryWorkflowStore, createWorldFairWorkflow, walletBindingMessage, WorkflowError } from '../src/worlds-fair-workflow.mjs';
import { routeCrescoHttp } from '../src/http-api.mjs';
import { workflowOpenApi, workflowWriteScope } from '../src/worlds-fair-workflow-http.mjs';

const P = '/api/v0.4/worlds-fair';
const call = (wf, method, path, body, token) => routeCrescoHttp({
  method, path, body, headers: token ? { authorization: `Bearer ${token}` } : {},
  services: { worldFairWorkflow: wf }
});
const signer = () => {
  const secret = ed25519.utils.randomPrivateKey();
  const publicKey = new PublicKey(ed25519.getPublicKey(secret)).toBase58();
  return { publicKey, sign: (m) => Buffer.from(ed25519.sign(new TextEncoder().encode(m), secret)).toString('base64') };
};
async function setup(nowRef) {
  const store = createMemoryWorkflowStore();
  const wf = createWorldFairWorkflow({ store, clock: () => nowRef.now });
  const w = (await call(wf, 'POST', `${P}/workspaces`, { useCase: 'family' })).body;
  const wallet = signer();
  const issuedAt = new Date(nowRef.now).toISOString();
  const bind = { publicKey: wallet.publicKey, issuedAt,
    signature: wallet.sign(walletBindingMessage({ workspaceId: w.id, issuedAt })),
    recoveryEnrollmentCode: w.recoveryEnrollmentCode };
  return { store, wf, w, wallet, bind };
}
const wpath = (id, suffix) => `${P}/workspaces/${id}${suffix}`;

test('wallet-bound Family recovery: immutable wallet, one-time signature, complete bearer rekey and audit', async () => {
  const nowRef = { now: Date.parse('2026-10-28T13:00:00.000Z') };
  const { store, wf, w, wallet, bind } = await setup(nowRef);
  const notEnrolled = await call(wf, 'POST', wpath(w.id, '/principal/recovery/challenge'));
  assert.equal(notEnrolled.status, 409);
  assert.equal(notEnrolled.body.error, 'PARENT_RECOVERY_NOT_ENROLLED');
  const firstWithoutCode = await call(wf, 'POST', wpath(w.id, '/principal/wallet'), {
    ...bind, recoveryEnrollmentCode: undefined
  }, w.tokens.principal);
  assert.equal(firstWithoutCode.status, 403);
  assert.equal(firstWithoutCode.body.error, 'PARENT_ENROLLMENT_CODE_INVALID');
  const wrongProof = await call(wf, 'POST', wpath(w.id, '/principal/wallet'), {
    ...bind, recoveryEnrollmentCode: 'fec_compromised'
  }, w.tokens.principal);
  assert.equal(wrongProof.status, 403);
  assert.equal((await call(wf, 'POST', wpath(w.id, '/principal/wallet'), bind, w.tokens.principal)).status, 200);
  assert.ok(!(await store.get(`wf:ws:${w.id}`)).recoveryEnrollmentHash);
  assert.ok(!JSON.stringify(await store.get(`wf:ws:${w.id}`)).includes(w.recoveryEnrollmentCode));
  const attacker = signer();
  const stolenBearerRebind = await call(wf, 'POST', wpath(w.id, '/principal/wallet'), {
    publicKey: attacker.publicKey, issuedAt: bind.issuedAt,
    signature: attacker.sign(walletBindingMessage({ workspaceId: w.id, issuedAt: bind.issuedAt }))
  }, w.tokens.principal);
  assert.equal(stolenBearerRebind.status, 409);
  assert.equal(stolenBearerRebind.body.error, 'PRINCIPAL_WALLET_ALREADY_BOUND');
  const idempotent = await call(wf, 'POST', wpath(w.id, '/principal/wallet'), bind, w.tokens.principal);
  assert.equal(idempotent.status, 200);
  assert.equal(idempotent.body.alreadyBound, true);

  const challenge = await call(wf, 'POST', wpath(w.id, '/principal/recovery/challenge'));
  assert.equal(challenge.status, 201);
  assert.match(challenge.body.message, /onChainAuthorityEffect:NONE/);
  const stored = await store.get(`wf:ws:${w.id}:principal-recovery`);
  assert.equal(stored.nonce, challenge.body.nonce);
  // Public challenge material can be safely returned to another caller;
  // it cannot recover access without the bound Parent wallet signature.
  const concurrentRequest = await call(wf, 'POST', wpath(w.id, '/principal/recovery/challenge'));
  assert.equal(concurrentRequest.status, 200);
  assert.equal(concurrentRequest.body.challengeId, challenge.body.challengeId);
  assert.equal(concurrentRequest.body.nonce, challenge.body.nonce);
  assert.equal(concurrentRequest.body.message, challenge.body.message);
  const proof = { challengeId: challenge.body.challengeId, nonce: challenge.body.nonce, publicKey: wallet.publicKey,
    signature: wallet.sign(challenge.body.message) };
  assert.equal((await call(wf, 'POST', wpath(w.id, '/principal/recovery/complete'), {
    ...proof, signature: attacker.sign(challenge.body.message)
  })).status, 401);
  assert.equal((await call(wf, 'POST', wpath(w.id, '/principal/recovery/complete'), {
    ...proof, publicKey: attacker.publicKey
  })).status, 403);
  const completed = await call(wf, 'POST', wpath(w.id, '/principal/recovery/complete'), proof);
  assert.equal(completed.status, 200);
  assert.equal(completed.body.onChainAuthorityChanged, false);
  for (const role of ['principal','operator','risk']) {
    assert.notEqual(completed.body.tokens[role], w.tokens[role]);
    assert.equal((await call(wf, 'GET', wpath(w.id, '/whoami'), null, w.tokens[role])).status, 401);
    assert.equal((await call(wf, 'GET', wpath(w.id, '/whoami'), null, completed.body.tokens[role])).status, 200);
  }
  assert.equal((await call(wf, 'POST', wpath(w.id, '/principal/recovery/complete'), proof)).status, 410);
  const eventView = await call(wf, 'GET', wpath(w.id, '/history'), null, completed.body.tokens.principal);
  assert.equal(eventView.body.events[0].type, 'PARENT_API_ACCESS_RECOVERED');
  const saved = JSON.stringify(await store.get(`wf:ws:${w.id}`));
  const events = JSON.stringify(await store.get(`wf:ws:${w.id}:events`));
  for (const token of Object.values(completed.body.tokens)) {
    assert.equal(saved.includes(token), false);
    assert.equal(events.includes(token), false);
  }
  // Previous principal token cannot use rotation even if stolen before recovery.
  assert.equal((await call(wf,'POST',wpath(w.id,'/roles/operator/rotate'),{},w.tokens.principal)).status,401);
});
test('recovery workspace write failure does not consume the signed proof or revoke the old roles', async () => {
  const now = { now: Date.parse('2026-10-28T13:00:00.000Z') };
  const { wf, store, w, wallet, bind } = await setup(now);
  assert.equal((await call(wf,'POST',wpath(w.id,'/principal/wallet'),bind,w.tokens.principal)).status,200);
  const challenge = (await call(wf,'POST',wpath(w.id,'/principal/recovery/challenge'))).body;
  const proof = { challengeId: challenge.challengeId, nonce: challenge.nonce,
    publicKey: wallet.publicKey, signature: wallet.sign(challenge.message) };
  const put = store.put.bind(store);
  let failOnce = true;
  store.put = async (key, value) => {
    if (key === `wf:ws:${w.id}` && failOnce) {
      failOnce = false;
      throw new Error('INJECTED_WORKSPACE_WRITE_FAILURE');
    }
    return put(key, value);
  };
  assert.equal((await call(wf,'POST',wpath(w.id,'/principal/recovery/complete'),proof)).status,500);
  for (const role of ['principal','operator','risk']) {
    assert.equal((await call(wf,'GET',wpath(w.id,'/whoami'),null,w.tokens[role])).status,200);
  }
  const failedState = await store.get(`wf:ws:${w.id}`);
  assert.equal(failedState.lastPrincipalRecoveryChallengeId,undefined);
  const challengeState = await store.get(`wf:ws:${w.id}:principal-recovery`);
  assert.equal(challengeState.consumedAt,undefined);
  // Retrying is safe because the authority-changing write never happened.
  const retried = await call(wf,'POST',wpath(w.id,'/principal/recovery/complete'),proof);
  assert.equal(retried.status,200);
  assert.equal((await call(wf,'POST',wpath(w.id,'/principal/recovery/complete'),proof)).status,410);
});

test('failure after workspace rekey cannot replay wallet proof or restore old access', async () => {
  const now = { now: Date.parse('2026-10-28T13:00:00.000Z') };
  const { wf, store, w, wallet, bind } = await setup(now);
  assert.equal((await call(wf,'POST',wpath(w.id,'/principal/wallet'),bind,w.tokens.principal)).status,200);
  const challenge = (await call(wf,'POST',wpath(w.id,'/principal/recovery/challenge'))).body;
  const proof = { challengeId: challenge.challengeId, nonce: challenge.nonce,
    publicKey: wallet.publicKey, signature: wallet.sign(challenge.message) };
  const put = store.put.bind(store);
  let failOnce = true;
  store.put = async (key, value) => {
    if (key === `wf:ws:${w.id}:principal-recovery` && value.consumedAt && failOnce) {
      failOnce = false;
      throw new Error('INJECTED_SECONDARY_WRITE_FAILURE');
    }
    return put(key, value);
  };
  const first = await call(wf,'POST',wpath(w.id,'/principal/recovery/complete'),proof);
  assert.equal(first.status,500); // lost response is UNKNOWN, not a safe retry
  const committed = await store.get(`wf:ws:${w.id}`);
  assert.equal(committed.lastPrincipalRecoveryChallengeId,challenge.challengeId);
  for (const role of ['principal','operator','risk']) {
    assert.equal((await call(wf,'GET',wpath(w.id,'/whoami'),null,w.tokens[role])).status,401);
  }
  // Reusing the exact signed message never creates a second credential set.
  assert.equal((await call(wf,'POST',wpath(w.id,'/principal/recovery/complete'),proof)).status,410);
  // The Parent may sign a FRESH challenge with the already-bound wallet.
  const fresh = await call(wf,'POST',wpath(w.id,'/principal/recovery/challenge'));
  assert.equal(fresh.status,201);
  assert.notEqual(fresh.body.challengeId,challenge.challengeId);
  const newProof = { challengeId:fresh.body.challengeId,nonce:fresh.body.nonce,
    publicKey: wallet.publicKey,signature:wallet.sign(fresh.body.message) };
  const completed = await call(wf,'POST',wpath(w.id,'/principal/recovery/complete'),newProof);
  assert.equal(completed.status,200);
  assert.equal((await call(wf,'GET',wpath(w.id,'/whoami'),null,completed.body.tokens.principal)).status,200);
});

test('Family initial wallet anchor requires creator proof, including capital isolation and legacy rejection', async () => {
  const nowRef = { now: Date.parse('2026-10-28T13:00:00Z') };
  const { wf, store, w, bind } = await setup(nowRef);
  assert.match(w.recoveryEnrollmentCode, /^fec_/);
  const original = await store.get(`wf:ws:${w.id}`);
  assert.ok(!JSON.stringify(original).includes(w.recoveryEnrollmentCode));
  const other = (await call(wf, 'POST', `${P}/workspaces`, { useCase: 'family' })).body;
  assert.notEqual(w.recoveryEnrollmentCode, other.recoveryEnrollmentCode);
  const capital = (await call(wf, 'POST', `${P}/workspaces`, { useCase: 'capital' })).body;
  assert.equal(capital.recoveryEnrollmentCode, undefined);
  const crossCode = await call(wf, 'POST', wpath(w.id, '/principal/wallet'), {
    ...bind, recoveryEnrollmentCode: other.recoveryEnrollmentCode
  }, w.tokens.principal);
  assert.equal(crossCode.status, 403);
  const legacy = { ...original };
  delete legacy.recoveryEnrollmentHash;
  await store.put(`wf:ws:${w.id}`, legacy);
  const declined = await call(wf, 'POST', wpath(w.id, '/principal/wallet'), bind, w.tokens.principal);
  assert.equal(declined.status, 409);
  assert.equal(declined.body.error, 'PARENT_ENROLLMENT_PROOF_UNAVAILABLE');
  assert.equal((await call(wf, 'POST', wpath(w.id, '/principal/recovery/challenge'))).status, 409);
});

test('Family recovery rejects expired, wrong workspace and non-Family challenges', async () => {
  const now = { now: Date.parse('2026-10-28T13:00:00Z') };
  const { wf, w, wallet, bind } = await setup(now);
  const other = (await call(wf, 'POST', `${P}/workspaces`, { useCase: 'family' })).body;
  const capital = (await call(wf, 'POST', `${P}/workspaces`, { useCase: 'capital' })).body;
  assert.equal((await call(wf,'POST',wpath(capital.id,'/principal/recovery/challenge'))).status,409);
  await call(wf,'POST',wpath(w.id,'/principal/wallet'),bind,w.tokens.principal);
  const challenge = (await call(wf,'POST',wpath(w.id,'/principal/recovery/challenge'))).body;
  const proof = { challengeId: challenge.challengeId, nonce: challenge.nonce, publicKey: wallet.publicKey, signature: wallet.sign(challenge.message) };
  assert.equal((await call(wf,'POST',wpath(other.id,'/principal/recovery/complete'),proof)).status,409);
  assert.equal((await call(wf,'POST',wpath(w.id,'/principal/recovery/complete'),{...proof,nonce:'different'})).status,401);
  now.now += 121000;
  assert.equal((await call(wf,'POST',wpath(w.id,'/principal/recovery/complete'),proof)).status,410);
  assert.equal((await call(wf,'GET',wpath(w.id,'/whoami'),null,w.tokens.principal)).status,200);
});
test('Recovery write paths are scoped by Cloudflare lease and contract makes their trust boundary explicit', () => {
  const base = `${P}/workspaces/ws-abc123`;
  assert.equal(workflowWriteScope('POST', `${base}/principal/recovery/challenge`), 'ws-abc123');
  assert.equal(workflowWriteScope('POST', `${base}/principal/recovery/complete`), 'ws-abc123');
  for(const action of ['challenge','complete']) {
    assert.deepEqual(workflowOpenApi().paths[`${P}/workspaces/{id}/principal/recovery/${action}`].post['x-cresco-roles'], []);
  }
});
