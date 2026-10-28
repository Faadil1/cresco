import test from 'node:test';
import assert from 'node:assert/strict';

import { routeCrescoHttp } from '../src/http-api.mjs';
import { handleCrescoCloudflareRequest } from '../src/cloudflare-worker.mjs';
import { FamilyState } from '../src/cloudflare-family-state.mjs';
import { createMemoryWorkflowStore, createWorldFairWorkflow } from '../src/worlds-fair-workflow.mjs';
import { workflowOpenApi, workflowWriteScope } from '../src/worlds-fair-workflow-http.mjs';

function simpleChain() {
  const st = { nonce: 3, status: 'ACTIVE', max: 500_000, spent: 0, n: 0 };
  const view = () => ({
    accounts: { mandate: 'M' }, guardian: 'G', delegate: 'D',
    mandate: { stage: 3, status: st.status, version: st.nonce, nonce: st.nonce, maxActionNotionalMicroUsd: st.max, maxPeriodNotionalMicroUsd: 10_000_000 },
    assetRule: { enabled: true, maxActionAmount: 5_000_000, maxPeriodAmount: 10_000_000, periodSeconds: 86_400, periodStartedAt: Math.floor(Date.now() / 1000), spentThisPeriod: st.spent, spentThisPeriodNotionalMicroUsd: st.spent }
  });
  return {
    st,
    gate: null,
    async bootstrapWorkspace() { return { bootstrap: {}, ...view() }; },
    async readMandate() { return view(); },
    async executeIntent({ inputAmount }) {
      if (this.gate) await this.gate;
      const q = { inputAmount, notionalMicroUsd: inputAmount };
      if (inputAmount > st.max) return { decision: 'REFUSE', boundary: 'SOFT', code: 'PythNotionalExceeded', refusalEvidence: 'PROGRAM_PREFLIGHT_SIMULATION', quote: q, standingMaxNotionalMicroUsd: st.max, policyDiff: { violatedDimensions: ['MAX_ACTION_NOTIONAL'] }, mandateBefore: view().mandate };
      st.spent += inputAmount;
      return { decision: 'ALLOW', signature: `s${++st.n}`.padEnd(64, 'z'), quote: q, effectObserved: true, mandateBefore: view().mandate };
    },
    async approveAndExecuteException({ expectedNonce }) {
      if (expectedNonce !== st.nonce) return { status: 'STALE', code: 'StaleNonce' };
      return { status: 'EXECUTED', grant: { signature: 'g'.repeat(64) }, executionSignature: 'e'.repeat(64), allowanceConsumed: true, standingAuthorityChanged: false };
    },
    async setMandateStatus({ status }) { st.status = status; st.nonce += 1; return { status: 'CONFIRMED', signature: 'p'.repeat(64), mandate: view().mandate }; },
    async revisePolicy({ values }) { st.max = values.maxActionNotionalMicroUsd; st.nonce += 1; return { status: 'CONFIRMED', signature: 'r'.repeat(64), mandate: view().mandate }; },
    async updateRule() { st.nonce += 1; return { status: 'CONFIRMED', signature: 'u'.repeat(64), mandate: view() }; },
    async signatureStatus() { return { status: 'CONFIRMED' }; }
  };
}

const call = (workflow, method, path, body, token, query) =>
  routeCrescoHttp({ method, path, body, headers: token ? { authorization: `Bearer ${token}` } : {}, query, services: { worldFairWorkflow: workflow } });

test('HTTP v0.4: full operator -> principal loop through the shared router', async () => {
  const chain = simpleChain();
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => chain });
  const P = '/api/v0.4/worlds-fair';

  const created = await call(wf, 'POST', `${P}/workspaces`, { name: 'HTTP desk' });
  assert.equal(created.status, 201);
  const { id, tokens } = created.body;

  assert.equal((await call(wf, 'POST', `${P}/workspaces/${id}/intents`, { inputAmount: 1 }, tokens.operator)).status, 409);
  assert.equal((await call(wf, 'POST', `${P}/workspaces/${id}/bootstrap`, null, tokens.principal)).status, 200);

  const allow = await call(wf, 'POST', `${P}/workspaces/${id}/intents`, { inputAmount: 100_000 }, tokens.operator);
  assert.equal(allow.body.decision, 'ALLOW');

  const pending = await call(wf, 'POST', `${P}/workspaces/${id}/intents`, { inputAmount: 900_000 }, tokens.operator);
  assert.equal(pending.status, 202);
  const rid = pending.body.request.id;

  const msg = await call(wf, 'GET', `${P}/workspaces/${id}/requests/${rid}/approval-message`, null, tokens.principal, { issuedAt: '2026-10-12T12:00:00.000Z' });
  assert.match(msg.body.message, /decision:APPROVE/);
  assert.match(msg.body.message, new RegExp(`request:${rid}`));

  const forbidden = await call(wf, 'POST', `${P}/workspaces/${id}/requests/${rid}/decision`, { decision: 'APPROVE' }, tokens.operator);
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.body.error, 'ROLE_FORBIDDEN');

  const approved = await call(wf, 'POST', `${P}/workspaces/${id}/requests/${rid}/decision`, { decision: 'APPROVE' }, tokens.principal);
  assert.equal(approved.body.request.status, 'EXECUTED');

  const history = await call(wf, 'GET', `${P}/workspaces/${id}/history`, null, tokens.operator);
  assert.equal(history.body.events[0].type, 'EXCEPTION_EXECUTED');
  const mandate = await call(wf, 'GET', `${P}/workspaces/${id}/mandate`, null, tokens.operator);
  assert.equal(mandate.body.consumption.spentAmount, 100_000);
  const notes = await call(wf, 'GET', `${P}/workspaces/${id}/notifications`, null, tokens.operator);
  assert.ok(notes.body.notifications.some((n) => n.type === 'EXCEPTION_EXECUTED'));
  const who = await call(wf, 'GET', `${P}/workspaces/${id}/whoami`, null, tokens.risk);
  assert.equal(who.body.role, 'risk');
});

test('HTTP v0.4: private workspace reads require a matching bearer role', async () => {
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => simpleChain() });
  const P = '/api/v0.4/worlds-fair';
  const a = (await call(wf, 'POST', `${P}/workspaces`, {})).body;
  const b = (await call(wf, 'POST', `${P}/workspaces`, {})).body;
  await call(wf, 'POST', `${P}/workspaces/${a.id}/bootstrap`, {}, a.tokens.principal);
  const pending = await call(wf, 'POST', `${P}/workspaces/${a.id}/intents`, { inputAmount: 900_000 }, a.tokens.operator);
  const rid = pending.body.request.id;
  for (const path of [`/requests`, `/history`]) {
    const missing = await call(wf, 'GET', `${P}/workspaces/${a.id}${path}`);
    assert.equal(missing.status, 401);
    const foreign = await call(wf, 'GET', `${P}/workspaces/${a.id}${path}`, null, b.tokens.operator);
    assert.ok([401, 403].includes(foreign.status));
    const authorized = await call(wf, 'GET', `${P}/workspaces/${a.id}${path}`, null, a.tokens.operator);
    assert.equal(authorized.status, 200);
  }
  const unsigned = await call(wf, 'GET', `${P}/workspaces/${a.id}/requests/${rid}/approval-message`);
  assert.equal(unsigned.status, 401);
  const teen = await call(wf, 'GET', `${P}/workspaces/${a.id}/requests/${rid}/approval-message`, null, a.tokens.operator);
  assert.equal(teen.status, 403);
  const parent = await call(wf, 'GET', `${P}/workspaces/${a.id}/requests/${rid}/approval-message`, null, a.tokens.principal);
  assert.equal(parent.status, 200);
});

test('HTTP v0.4: workspace metadata, mandate and principal wallet message are private by role', async () => {
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => simpleChain() });
  const P = '/api/v0.4/worlds-fair';
  const a = (await call(wf, 'POST', `${P}/workspaces`, { name: 'Family private', useCase: 'family' })).body;
  const b = (await call(wf, 'POST', `${P}/workspaces`, { name: 'Other private' })).body;
  await call(wf, 'POST', `${P}/workspaces/${a.id}/bootstrap`, {}, a.tokens.principal);
  const walletPath = '/principal/wallet-message';
  for (const suffix of ['', '/mandate', walletPath]) {
    const missing = await call(wf, 'GET', `${P}/workspaces/${a.id}${suffix}`);
    assert.equal(missing.status, 401, `Missing bearer for ${suffix || 'workspace'}`);
    const foreign = await call(wf, 'GET', `${P}/workspaces/${a.id}${suffix}`, null, b.tokens.principal);
    assert.equal(foreign.status, 401, `Wrong workspace bearer for ${suffix || 'workspace'}`);
  }
  for (const role of ['operator', 'principal', 'risk']) {
    for (const suffix of ['', '/mandate']) {
      const result = await call(wf, 'GET', `${P}/workspaces/${a.id}${suffix}`, null, a.tokens[role]);
      assert.equal(result.status, 200, `${role} reads ${suffix || 'workspace'}`);
    }
  }
  const teenWalletMessage = await call(wf, 'GET', `${P}/workspaces/${a.id}${walletPath}`, null, a.tokens.operator);
  assert.equal(teenWalletMessage.status, 403);
  const secondParentWalletMessage = await call(wf, 'GET', `${P}/workspaces/${a.id}${walletPath}`, null, a.tokens.risk);
  assert.equal(secondParentWalletMessage.status, 403);
  const principalWalletMessage = await call(wf, 'GET', `${P}/workspaces/${a.id}${walletPath}`, null, a.tokens.principal);
  assert.equal(principalWalletMessage.status, 200);
  assert.match(principalWalletMessage.body.message, /workspace:/);
});

test('Family Parent rotates Teen and second-parent role links; old links fail all reads and writes', async () => {
  const store = createMemoryWorkflowStore();
  const wf = createWorldFairWorkflow({ store, chainFactory: () => simpleChain() });
  const P = '/api/v0.4/worlds-fair';
  const family = (await call(wf, 'POST', `${P}/workspaces`, { useCase: 'family' })).body;
  const other = (await call(wf, 'POST', `${P}/workspaces`, { useCase: 'family' })).body;
  const capital = (await call(wf, 'POST', `${P}/workspaces`, { useCase: 'capital' })).body;
  const path = (role) => `${P}/workspaces/${family.id}/roles/${role}/rotate`;
  const oldTeen = family.tokens.operator;
  const oldSecondParent = family.tokens.risk;
  const principal = family.tokens.principal;

  assert.equal((await call(wf, 'POST', path('operator'), {}, oldTeen)).status, 403);
  assert.equal((await call(wf, 'POST', path('operator'), {}, oldSecondParent)).status, 403);
  assert.equal((await call(wf, 'POST', path('operator'))).status, 401);
  assert.equal((await call(wf, 'POST', path('operator'), {}, other.tokens.principal)).status, 401);
  assert.equal((await call(wf, 'POST', path('principal'), {}, principal)).status, 400);
  assert.equal((await call(wf, 'POST', `${P}/workspaces/${capital.id}/roles/operator/rotate`, {}, capital.tokens.principal)).status, 409);
  const changed = await call(wf, 'POST', path('operator'), {}, principal);
  assert.equal(changed.status, 200);
  assert.equal(changed.body.role, 'operator');
  assert.match(changed.body.token, /^wf_operator_/);
  assert.notEqual(changed.body.token, oldTeen);
  assert.equal(changed.body.onChainAuthorityChanged, false);
  const rawWorkspace = JSON.stringify(await store.get(`wf:ws:${family.id}`));
  const audit = JSON.stringify(await store.get(`wf:ws:${family.id}:events`));
  assert.ok(!rawWorkspace.includes(changed.body.token));
  assert.ok(!audit.includes(changed.body.token));
  for (const suffix of ['', '/requests', '/history', '/mandate', '/intents/safety']) {
    assert.equal((await call(wf, 'GET', `${P}/workspaces/${family.id}${suffix}`, null, oldTeen)).status, 401);
    assert.equal((await call(wf, 'GET', `${P}/workspaces/${family.id}${suffix}`, null, changed.body.token)).status, suffix === '/mandate' ? 409 : 200);
  }
  assert.equal((await call(wf, 'POST', `${P}/workspaces/${family.id}/intents`, { inputAmount: 100_000 }, oldTeen)).status, 401);
  assert.equal((await call(wf, 'GET', `${P}/workspaces/${family.id}/whoami`, null, principal)).status, 200);
  assert.equal((await call(wf, 'GET', `${P}/workspaces/${family.id}/whoami`, null, oldSecondParent)).status, 200);

  const riskChanged = await call(wf, 'POST', path('risk'), {}, principal);
  assert.equal(riskChanged.status, 200);
  assert.equal((await call(wf, 'GET', `${P}/workspaces/${family.id}/whoami`, null, oldSecondParent)).status, 401);
  assert.equal((await call(wf, 'GET', `${P}/workspaces/${family.id}/whoami`, null, riskChanged.body.token)).status, 200);
  const history = await call(wf, 'GET', `${P}/workspaces/${family.id}/history`, null, principal);
  assert.ok(history.body.events.filter((e) => e.type === 'ROLE_TOKEN_ROTATED').length >= 2);
  assert.ok(!JSON.stringify(history.body).includes(riskChanged.body.token));
  assert.ok(!JSON.stringify(history.body).includes(changed.body.token));
});

test('HTTP v0.4: Idempotency-Key header is honoured and errors carry codes', async () => {
  const chain = simpleChain();
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => chain });
  const P = '/api/v0.4/worlds-fair';
  const { id, tokens } = (await call(wf, 'POST', `${P}/workspaces`, {})).body;
  await call(wf, 'POST', `${P}/workspaces/${id}/bootstrap`, null, tokens.principal);
  const send = () => routeCrescoHttp({ method: 'POST', path: `${P}/workspaces/${id}/intents`, body: { inputAmount: 10_000 }, headers: { Authorization: `Bearer ${tokens.operator}`, 'Idempotency-Key': 'hdr-key-0001' }, services: { worldFairWorkflow: wf } });
  const a = await send();
  const b = await send();
  assert.equal(b.body.idempotentReplay, true);
  assert.equal(a.body.receipt.signature, b.body.receipt.signature);
  assert.equal(chain.st.spent, 10_000);
  const bad = await call(wf, 'POST', `${P}/workspaces/${id}/intents`, { inputAmount: -5 }, tokens.operator);
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error, 'INTENT_AMOUNT_INVALID');
  const missing = await call(wf, 'GET', `${P}/workspaces/ws-doesnotexist/history`);
  assert.equal(missing.status, 404);
});

test('HTTP v0.4: an unresolved intent holds the server and safety endpoint is role protected', async () => {
  const chain = simpleChain();
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => chain });
  const P = '/api/v0.4/worlds-fair';
  const { id, tokens } = (await call(wf, 'POST', `${P}/workspaces`, {})).body;
  await call(wf, 'POST', `${P}/workspaces/${id}/bootstrap`, null, tokens.principal);
  chain.executeIntent = async () => { throw new Error('network failure after possible execution'); };
  const first = await call(wf, 'POST', `${P}/workspaces/${id}/intents`, { inputAmount: 50_000, idempotencyKey: 'http-unknown-001' }, tokens.operator);
  assert.equal(first.status, 503);
  assert.equal(first.body.decision, 'UNKNOWN');
  const unauthenticated = await call(wf, 'GET', `${P}/workspaces/${id}/intents/safety`);
  assert.equal(unauthenticated.status, 401);
  const safety = await call(wf, 'GET', `${P}/workspaces/${id}/intents/safety`, null, tokens.operator);
  assert.equal(safety.body.blocked, true);
  const blocked = await call(wf, 'POST', `${P}/workspaces/${id}/intents`, { inputAmount: 50_000, idempotencyKey: 'http-unknown-002' }, tokens.operator);
  assert.equal(blocked.status, 409);
  assert.equal(blocked.body.error, 'INTENT_RECONCILIATION_REQUIRED');
  await call(wf, 'POST', `${P}/workspaces/${id}/reconcile`, {}, tokens.principal);
  const after = await call(wf, 'GET', `${P}/workspaces/${id}/intents/safety`, null, tokens.risk);
  assert.equal(after.body.blocked, true);
});

test('HTTP v0.4: OpenAPI contract documents every role-gated route', async () => {
  const res = await routeCrescoHttp({ method: 'GET', path: '/api/v0.4/worlds-fair/openapi', services: {} });
  assert.equal(res.status, 200);
  const spec = workflowOpenApi();
  assert.equal(res.body.openapi, '3.1.0');
  const intents = spec.paths['/api/v0.4/worlds-fair/workspaces/{id}/intents'].post;
  assert.deepEqual(intents['x-cresco-roles'], ['operator']);
  assert.ok(intents.responses['202']);
  assert.deepEqual(spec.paths['/api/v0.4/worlds-fair/workspaces/{id}/requests/{requestId}/decision'].post['x-cresco-roles'], ['principal', 'risk']);
  assert.deepEqual(spec.paths['/api/v0.4/worlds-fair/workspaces/{id}/intents/safety'].get['x-cresco-roles'], ['operator', 'principal', 'risk']);
  assert.deepEqual(spec.paths['/api/v0.4/worlds-fair/workspaces/{id}/requests'].get['x-cresco-roles'], ['operator', 'principal', 'risk']);
  assert.deepEqual(spec.paths['/api/v0.4/worlds-fair/workspaces/{id}/history'].get['x-cresco-roles'], ['operator', 'principal', 'risk']);
  for (const suffix of ['', '/mandate']) {
    assert.deepEqual(spec.paths[`/api/v0.4/worlds-fair/workspaces/{id}${suffix}`].get['x-cresco-roles'], ['operator', 'principal', 'risk']);
  }
  assert.deepEqual(spec.paths['/api/v0.4/worlds-fair/workspaces/{id}/principal/wallet-message'].get['x-cresco-roles'], ['principal']);
});

test('write scope only applies to mutating workspace routes', () => {
  assert.equal(workflowWriteScope('POST', '/api/v0.4/worlds-fair/workspaces/ws-abc123/intents'), 'ws-abc123');
  assert.equal(workflowWriteScope('POST', '/api/v0.4/worlds-fair/workspaces/ws-abc123/requests/req-1/decision'), 'ws-abc123');
  assert.equal(workflowWriteScope('GET', '/api/v0.4/worlds-fair/workspaces/ws-abc123/history'), null);
  assert.equal(workflowWriteScope('POST', '/api/v0.4/worlds-fair/workspaces'), '__index');
  assert.equal(workflowWriteScope('POST', '/api/v0.4/worlds-fair/workspaces/ws-abc123/roles/operator/rotate'), 'ws-abc123');
  assert.equal(workflowWriteScope('POST', '/api/v0.4/worlds-fair/workspaces/ws-abc123/roles/risk/rotate'), 'ws-abc123');
});

function durableEnv() {
  const values = new Map();
  const instance = new FamilyState({
    storage: {
      async get(key) { return values.get(key); },
      async put(key, value) { values.set(key, structuredClone(value)); },
      async delete(key) { values.delete(key); }
    }
  });
  return {
    values,
    FAMILY_STATE: {
      idFromName(name) { return name; },
      get() { return { fetch: (url, init = {}) => instance.fetch(new Request(url, init)) }; }
    }
  };
}

const workerCall = (env, services, method, path, body, token, extra = {}) =>
  handleCrescoCloudflareRequest(
    new Request(`https://keys-api.example${path}`, {
      method,
      headers: { 'content-type': 'application/json', Origin: 'https://cresco-lac.vercel.app', ...(token ? { authorization: `Bearer ${token}` } : {}), ...extra },
      body: body == null ? undefined : JSON.stringify(body)
    }),
    env,
    services
  );

test('Worker v0.4: state persists in the Durable Object across isolates (fresh workflow per request)', async () => {
  const env = durableEnv();
  const chain = simpleChain();
  const services = { worldFairWorkspaceChainFactory: () => chain };
  const P = '/api/v0.4/worlds-fair';

  const created = await (await workerCall(env, services, 'POST', `${P}/workspaces`, { name: 'Durable desk' })).json();
  const { id, tokens } = created;
  assert.ok([...env.values.keys()].some((k) => k === `wf:ws:${id}`));

  assert.equal((await workerCall(env, services, 'POST', `${P}/workspaces/${id}/bootstrap`, null, tokens.principal)).status, 200);
  const pending = await (await workerCall(env, services, 'POST', `${P}/workspaces/${id}/intents`, { inputAmount: 800_000 }, tokens.operator)).json();
  assert.equal(pending.decision, 'PENDING_PRINCIPAL');

  for (const suffix of ['', '/mandate']) {
    const anonymous = await workerCall(env, services, 'GET', `${P}/workspaces/${id}${suffix}`);
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.headers.get('cache-control'), 'no-store');
    const privateRead = await workerCall(env, services, 'GET', `${P}/workspaces/${id}${suffix}`, null, tokens.operator);
    assert.equal(privateRead.status, 200);
    assert.equal(privateRead.headers.get('cache-control'), 'no-store');
    const foreignOrigin = await workerCall(env, services, 'GET', `${P}/workspaces/${id}${suffix}`, null, tokens.operator, { Origin: 'https://untrusted.example' });
    assert.equal(foreignOrigin.headers.get('access-control-allow-origin'), null);
    assert.equal(foreignOrigin.headers.get('cache-control'), 'no-store');
  }

  const listed = await (await workerCall(env, services, 'GET', `${P}/workspaces/${id}/requests?status=PENDING`, null, tokens.operator)).json();
  assert.equal(listed.requests.length, 1);
  const res = await workerCall(env, services, 'GET', `${P}/workspaces/${id}/history`, null, tokens.operator);
  assert.equal(res.headers.get('access-control-allow-origin'), 'https://cresco-lac.vercel.app');
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('Worker v0.4: concurrent writes on one workspace are serialized (BUSY), other workspaces proceed', async () => {
  const env = durableEnv();
  const chain = simpleChain();
  let release;
  chain.gate = new Promise((r) => { release = r; });
  const services = { worldFairWorkspaceChainFactory: () => chain };
  const P = '/api/v0.4/worlds-fair';
  const a = await (await workerCall(env, services, 'POST', `${P}/workspaces`, {})).json();
  await workerCall(env, services, 'POST', `${P}/workspaces/${a.id}/bootstrap`, null, a.tokens.principal);

  const first = workerCall(env, services, 'POST', `${P}/workspaces/${a.id}/intents`, { inputAmount: 1000 }, a.tokens.operator);
  await new Promise((r) => setTimeout(r, 20));
  const second = await workerCall(env, services, 'POST', `${P}/workspaces/${a.id}/intents`, { inputAmount: 1000 }, a.tokens.operator);
  assert.equal(second.status, 409);
  assert.equal((await second.json()).error, 'BUSY');
  assert.ok(Number(second.headers.get('retry-after')) >= 1);

  const read = await workerCall(env, services, 'GET', `${P}/workspaces/${a.id}/history`, null, a.tokens.operator);
  assert.equal(read.status, 200);

  release();
  assert.equal((await first).status, 200);
  const third = await workerCall(env, services, 'POST', `${P}/workspaces/${a.id}/intents`, { inputAmount: 1000 }, a.tokens.operator);
  assert.equal(third.status, 200);
});

test('Worker v0.4: Durable Object refuses keys outside the workflow namespace', async () => {
  const env = durableEnv();
  const stub = env.FAMILY_STATE.get(env.FAMILY_STATE.idFromName('x'));
  const res = await stub.fetch('https://x.internal/wf-kv/put', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: 'family', value: { hacked: true } }) });
  assert.equal(res.status, 400);
});

test('worker options: create token and bounded workspace capacity come from env', async () => {
  const { worldFairWorkflowOptionsFromEnv } = await import('../src/cloudflare-worker.mjs');
  assert.deepEqual(worldFairWorkflowOptionsFromEnv({}), {});
  assert.deepEqual(worldFairWorkflowOptionsFromEnv({ WORLD_FAIR_CREATE_TOKEN: 't', WORLD_FAIR_MAX_WORKSPACES: '60' }), { createToken: 't', maxWorkspaces: 60 });
  assert.deepEqual(worldFairWorkflowOptionsFromEnv({ WORLD_FAIR_MAX_WORKSPACES: '5000' }), {});
  assert.deepEqual(worldFairWorkflowOptionsFromEnv({ WORLD_FAIR_MAX_WORKSPACES: 'abc' }), {});
});
