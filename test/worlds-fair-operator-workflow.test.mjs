import test from 'node:test';
import assert from 'node:assert/strict';

import { routeCrescoHttp } from '../src/http-api.mjs';
import {
  createMemoryWorldFairWorkflowStore,
  createWorldFairWorkflowService
} from '../src/worlds-fair-workflow.mjs';

function fixture(kind = 'STANDING', overrides = {}) {
  const calls = [];
  const provider = {
    calls,
    async previewTradeIntent({ inputAmountBaseUnits }) {
      calls.push('preview');
      const soft = kind === 'SOFT';
      const hard = kind === 'HARD';
      return {
        action: {
          type: 'SWAP_EXACT_IN',
          inputAmountBaseUnits,
          inputMint: 'devUSDC',
          outputMint: 'devUSDT'
        },
        mandate: { nonce: 14, version: 3, status: 'ACTIVE' },
        policyDiff: { violatedDimensions: soft ? ['MAX_ACTION_NOTIONAL'] : hard ? ['INPUT_VAULT_LIQUIDITY'] : [] },
        evaluation: {
          decision: soft || hard ? 'REFUSE' : 'ALLOW',
          exceptionEligible: soft,
          boundaryClass: soft ? 'SOFT_EXACT' : hard ? 'HARD' : 'STANDING'
        },
        market: { source: 'PYTH_LAZER' }
      };
    },
    async executeStandingIntent(params) {
      calls.push('standing');
      return { status: 'CONFIRMED', signature: 'standing_sig', ...params };
    },
    async prepareExceptionIntent(params) {
      calls.push('prepare');
      return { status: 'PREPARED', requestHash: 'exact_hash', deadline: 12345, ...params };
    },
    async grantPreparedException({ prepared }) {
      calls.push('grant');
      return { status: 'GRANTED', grantSignature: 'grant_sig', allowance: 'allowance_one', requestHash: prepared.requestHash, prepared };
    },
    async executeGrantedException() {
      calls.push('exception');
      return { status: 'CONFIRMED', signature: 'exception_sig', allowanceConsumed: true };
    },
    async inspectPreparedException() {
      calls.push('inspect');
      return { status: 'OBSERVED', allowanceFound: true, used: true, deadlineStillValid: true, stale: false };
    },
    ...overrides
  };
  const store = createMemoryWorldFairWorkflowStore();
  const operator = { role: 'operator' };
  const principal = { role: 'principal' };
  const service = createWorldFairWorkflowService({
    provider, store, now: () => '2026-10-11T00:00:00.000Z', idFactory: () => 'fixed-uuid'
  });
  function route(method, subpath, body, actor = operator) {
    return routeCrescoHttp({
      method, path: '/api/v0.3/worlds-fair/workflow' + subpath, body,
      services: { worldFairActor: actor, worldFairExecutionProvider: provider, worldFairWorkflowStore: store }
    });
  }
  return { provider, calls, store, operator, principal, service, route };
}

test('API refuses unauthenticated workflow requests and missing runtime dependencies', async () => {
  const noAuth = await routeCrescoHttp({
    method: 'GET', path: '/api/v0.3/worlds-fair/workflow/intents',
    services: {}
  });
  assert.equal(noAuth.status, 401);
  assert.equal(noAuth.body.error, 'WORLD_FAIR_ROLE_REQUIRED');

  const missing = await routeCrescoHttp({
    method: 'GET', path: '/api/v0.3/worlds-fair/workflow/intents',
    services: { worldFairActor: { role: 'operator' } }
  });
  assert.equal(missing.status, 503);
  assert.equal(missing.body.status, 'BLOCKED');
});

test('standing intent is created, listed, executed and persisted through the shared workflow', async () => {
  const f = fixture();
  const created = await f.route('POST', '/intents', { inputAmountBaseUnits: 250_000 });
  assert.equal(created.status, 201);
  assert.equal(created.body.intent.status, 'READY_STANDING_EXECUTION');
  const id = created.body.intent.id;
  const listed = await f.route('GET', '/intents');
  assert.equal(listed.body.intents.length, 1);

  const done = await f.route('POST', `/intents/${id}/execute-standing`, {});
  assert.equal(done.status, 200);
  assert.equal(done.body.intent.status, 'EXECUTED');
  assert.equal(done.body.intent.execution.signature, 'standing_sig');
  assert.equal(done.body.intent.history.at(-1).type, 'STANDING_EXECUTED');

  const forbiddenRepeat = await f.route('POST', `/intents/${id}/execute-standing`, {});
  assert.equal(forbiddenRepeat.status, 409);
  assert.deepEqual(f.calls, ['preview', 'standing']);
});

test('principal-only approval, exact grant and operator-only execution preserve state', async () => {
  const f = fixture('SOFT');
  const created = await f.route('POST', '/intents', { inputAmountBaseUnits: 650_000 });
  const id = created.body.intent.id;
  assert.equal(created.body.intent.status, 'PENDING_PRINCIPAL_DECISION');

  const unauthorizedPrepare = await f.route('POST', `/intents/${id}/prepare-exception`, {});
  assert.equal(unauthorizedPrepare.status, 403);
  const prepared = await f.route('POST', `/intents/${id}/prepare-exception`, {}, f.principal);
  assert.equal(prepared.status, 200);
  assert.equal(prepared.body.intent.status, 'PREPARED_FOR_ALLOW_ONCE');

  const unauthorizedDecision = await f.route('POST', `/intents/${id}/decision`, { decision: 'ALLOW_ONCE' });
  assert.equal(unauthorizedDecision.status, 403);
  const granted = await f.route('POST', `/intents/${id}/decision`, { decision: 'ALLOW_ONCE', note: 'once only' }, f.principal);
  assert.equal(granted.body.intent.status, 'ALLOW_ONCE_GRANTED');

  const invalidOperator = await f.route('POST', `/intents/${id}/execute-exception`, {}, f.principal);
  assert.equal(invalidOperator.status, 403);
  const executed = await f.route('POST', `/intents/${id}/execute-exception`, {});
  assert.equal(executed.body.intent.status, 'EXECUTED');
  assert.equal(executed.body.intent.execution.allowanceConsumed, true);
  assert.equal((await f.route('POST', `/intents/${id}/execute-exception`, {})).status, 409);
  assert.deepEqual(f.calls, ['preview', 'prepare', 'grant', 'exception']);
});

test('hard boundary cannot be prepared or approved even by the principal', async () => {
  const f = fixture('HARD');
  const created = await f.route('POST', '/intents', { inputAmountBaseUnits: 10_000_000 });
  const id = created.body.intent.id;
  assert.equal(created.body.intent.status, 'REFUSED_HARD');
  assert.equal((await f.route('POST', `/intents/${id}/prepare-exception`, {}, f.principal)).status, 409);
  assert.equal((await f.route('POST', `/intents/${id}/decision`, { decision: 'ALLOW_ONCE' }, f.principal)).status, 409);
  assert.deepEqual(f.calls, ['preview']);
});

test('principal refusal blocks later grant or execution', async () => {
  const f = fixture('SOFT');
  const id = (await f.route('POST', '/intents', { inputAmountBaseUnits: 600_000 })).body.intent.id;
  const denied = await f.route('POST', `/intents/${id}/decision`, { decision: 'REFUSE' }, f.principal);
  assert.equal(denied.body.intent.status, 'REFUSED_BY_PRINCIPAL');
  assert.equal((await f.route('POST', `/intents/${id}/prepare-exception`, {}, f.principal)).status, 409);
  assert.equal((await f.route('POST', `/intents/${id}/execute-exception`, {})).status, 409);
});

test('uncertain standing execution is never replayable or shown as confirmed', async () => {
  const f = fixture('STANDING', {
    async executeStandingIntent() {
      throw new Error('network timeout after submit');
    }
  });
  const id = (await f.route('POST', '/intents', { inputAmountBaseUnits: 200_000 })).body.intent.id;
  const outcome = await f.route('POST', `/intents/${id}/execute-standing`, {});
  assert.equal(outcome.status, 503);
  assert.equal(outcome.body.status, 'UNKNOWN');
  assert.equal(outcome.body.intent.status, 'UNKNOWN');
  assert.equal(outcome.body.intent.recovery.automaticReplayAllowed, false);
  assert.equal((await f.route('POST', `/intents/${id}/execute-standing`, {})).status, 409);
});

test('unknown grant can be inspected and recovered without blind grant replay', async () => {
  const f = fixture('SOFT', {
    async grantPreparedException() {
      throw new Error('grant submitted but RPC returned 503');
    }
  });
  const id = (await f.route('POST', '/intents', { inputAmountBaseUnits: 600_000 })).body.intent.id;
  await f.route('POST', `/intents/${id}/prepare-exception`, {}, f.principal);
  const uncertain = await f.route('POST', `/intents/${id}/decision`, { decision: 'ALLOW_ONCE' }, f.principal);
  assert.equal(uncertain.status, 503);
  assert.equal(uncertain.body.intent.status, 'UNKNOWN_GRANT');
  const recovered = await f.route('POST', `/intents/${id}/reconcile`, {});
  assert.equal(recovered.body.intent.status, 'EXECUTED_RECOVERED');
  assert.equal(recovered.body.intent.recovery.automaticReplayAllowed, false);
  assert.equal((await f.route('POST', `/intents/${id}/decision`, { decision: 'ALLOW_ONCE' }, f.principal)).status, 409);
});

test('API rejects arbitrary fields, invalid decisions, mutation parameters and unknown routes', async () => {
  const f = fixture('SOFT');
  const badIntent = await f.route('POST', '/intents', { inputAmountBaseUnits: 600_000, programId: 'arbitrary' });
  assert.equal(badIntent.status, 400);
  assert.deepEqual(f.calls, []);

  const id = (await f.route('POST', '/intents', { inputAmountBaseUnits: 600_000 })).body.intent.id;
  assert.equal((await f.route('POST', `/intents/${id}/decision`, { decision: 'WIDEN_MANDATE' }, f.principal)).status, 400);
  assert.equal((await f.route('POST', `/intents/${id}/prepare-exception`, { nonce: 99 }, f.principal)).status, 404);
  assert.equal((await f.route('POST', `/intents/${id}/replay`, {}, f.principal)).status, 404);
});

test('in-memory store enforces optimistic concurrency for durable states', async () => {
  const f = fixture();
  const initial = await f.service.submitIntent({ actor: f.operator, inputAmountBaseUnits: 250_000 });
  const updated = await f.store.update(initial.id, { ...initial, status: 'PENDING' }, initial.revision);
  assert.equal(updated.revision, 2);
  await assert.rejects(
    f.store.update(initial.id, { ...initial, status: 'EXECUTED' }, initial.revision),
    (error) => error.code === 'WORLD_FAIR_WORKFLOW_CONFLICT'
  );
});

test('parallel standing requests must not produce duplicate on-chain writes', async () => {
  let started;
  let unblock;
  const began = new Promise((resolve) => { started = resolve; });
  const gate = new Promise((resolve) => { unblock = resolve; });
  let submitted = 0;
  const f = fixture('STANDING', {
    async executeStandingIntent() {
      submitted += 1;
      started();
      await gate;
      return { status: 'CONFIRMED', signature: 'exactly_once' };
    }
  });
  const id = (await f.service.submitIntent({
    actor: f.operator, inputAmountBaseUnits: 150_000
  })).id;
  const first = f.service.executeStanding({ actor: f.operator, id });
  await began;
  const second = f.service.executeStanding({ actor: f.operator, id });
  unblock();
  const outcomes = await Promise.allSettled([first, second]);
  assert.equal(submitted, 1, 'a concurrent duplicate may not reach the real provider');
  assert.equal(outcomes.filter((x) => x.status === 'fulfilled').length, 1);
  assert.equal((await f.store.get(id)).status, 'EXECUTED');
});

test('parallel allow-once grants must reserve intent before calling the provider', async () => {
  let started;
  let unblock;
  const began = new Promise((resolve) => { started = resolve; });
  const gate = new Promise((resolve) => { unblock = resolve; });
  let grants = 0;
  const f = fixture('SOFT', {
    async grantPreparedException({ prepared }) {
      grants += 1;
      started();
      await gate;
      return {
        status: 'GRANTED', grantSignature: 'grant_once', allowance: 'allowance',
        requestHash: prepared.requestHash, prepared
      };
    }
  });
  const id = (await f.service.submitIntent({
    actor: f.operator, inputAmountBaseUnits: 700_000
  })).id;
  await f.service.prepareException({ actor: f.principal, id });
  const first = f.service.decideException({
    actor: f.principal, id, decision: 'ALLOW_ONCE'
  });
  await began;
  const second = f.service.decideException({
    actor: f.principal, id, decision: 'ALLOW_ONCE'
  });
  unblock();
  const outcomes = await Promise.allSettled([first, second]);
  assert.equal(grants, 1, 'duplicate exception grants may not reach provider');
  assert.equal(outcomes.filter((x) => x.status === 'fulfilled').length, 1);
  assert.equal((await f.store.get(id)).status, 'ALLOW_ONCE_GRANTED');
});
