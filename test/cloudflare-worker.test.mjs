import test from 'node:test';
import assert from 'node:assert/strict';

import { handleCrescoCloudflareRequest } from '../src/cloudflare-worker.mjs';
import { FamilyState } from '../src/cloudflare-family-state.mjs';

function memoryState() {
  const values = new Map();
  return {
    storage: {
      async get(key) {
        return values.get(key);
      },
      async put(key, value) {
        values.set(key, structuredClone(value));
      },
      async delete(key) {
        values.delete(key);
      }
    }
  };
}

function workerEnv() {
  const instances = new Map();
  return {
    CRESCO_CORS_ORIGIN: 'https://cresco-lac.vercel.app',
    CRESCO_CORS_ORIGINS:
      'https://cresco-lac.vercel.app,https://cresco.faadil-casecraft.workers.dev',
    FAMILY_STATE: {
      idFromName(name) {
        return name;
      },
      get(id) {
        if (!instances.has(id)) {
          instances.set(id, new FamilyState(memoryState()));
        }
        const instance = instances.get(id);
        return {
          fetch(url, init = {}) {
            return instance.fetch(new Request(url, init));
          }
        };
      }
    }
  };
}

test('Cloudflare adapter serves CRESCO health at root with Cresco CORS', async () => {
  const response = await handleCrescoCloudflareRequest(
    new Request('https://cresco-api-stocklana.example/', {
      headers: {
        Origin: 'https://cresco-lac.vercel.app'
      }
    }),
    {
      CRESCO_CORS_ORIGIN: 'https://cresco-lac.vercel.app'
    }
  );

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    'https://cresco-lac.vercel.app'
  );

  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.service, 'cresco-backend');
  assert.equal(body.contractVersion, '0.2');
});

test('Cloudflare adapter handles CORS preflight without touching runtime secrets', async () => {
  const response = await handleCrescoCloudflareRequest(
    new Request('https://cresco-api-stocklana.example/api/v0.2/actions/execute', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://cresco-lac.vercel.app'
      }
    }),
    {
      CRESCO_CORS_ORIGIN: 'https://cresco-lac.vercel.app'
    }
  );

  assert.equal(response.status, 204);
  assert.equal(
    response.headers.get('access-control-allow-methods'),
    'GET,POST,OPTIONS'
  );
});




test('Cloudflare adapter allows the new CRESCO Workers frontend origin', async () => {
  const response = await handleCrescoCloudflareRequest(
    new Request('https://cresco-api-stocklana.example/', {
      headers: {
        Origin: 'https://cresco.faadil-casecraft.workers.dev'
      }
    }),
    {
      CRESCO_CORS_ORIGINS:
        'https://cresco-lac.vercel.app,https://cresco.faadil-casecraft.workers.dev'
    }
  );

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    'https://cresco.faadil-casecraft.workers.dev'
  );
});

test('Cloudflare adapter does not grant CORS to an untrusted browser origin', async () => {
  const response = await handleCrescoCloudflareRequest(
    new Request('https://cresco-api-stocklana.example/api/v0.2/actions/execute', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://example-attacker.invalid'
      }
    }),
    {
      CRESCO_CORS_ORIGINS:
        'https://cresco-lac.vercel.app,https://cresco.faadil-casecraft.workers.dev'
    }
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('Cloudflare World’s Fair live route refuses overlap while the durable lease is active', async () => {
  const env = workerEnv();
  let releaseFirst;
  let startedFirst;
  const firstStarted = new Promise((resolve) => {
    startedFirst = resolve;
  });
  const waitForRelease = new Promise((resolve) => {
    releaseFirst = resolve;
  });

  const provider = {
    async runCanonicalSequence() {
      startedFirst();
      await waitForRelease;
      return {
        status: 'PASS',
        productState: 'WORLD_FAIR_OPERATOR_LAB_LIVE',
        scenarios: {}
      };
    }
  };

  const request = () =>
    new Request(
      'https://cresco-api-stocklana.example/api/v0.3/worlds-fair/run',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Origin: 'https://cresco-lac.vercel.app'
        },
        body: JSON.stringify({ scenario: 'CANONICAL_LIVE' })
      }
    );

  const first = handleCrescoCloudflareRequest(
    request(),
    env,
    { worldFairExecutionProvider: provider }
  );

  await firstStarted;

  const overlapping = await handleCrescoCloudflareRequest(
    request(),
    env,
    { worldFairExecutionProvider: provider }
  );
  assert.equal(overlapping.status, 409);
  const busy = await overlapping.json();
  assert.equal(busy.status, 'BUSY');
  assert.equal(busy.error, 'WORLD_FAIR_LIVE_RUN_IN_PROGRESS');
  assert.equal(Number(busy.retryAfterMs) > 0, true);

  releaseFirst();
  const completed = await first;
  assert.equal(completed.status, 200);
  const completedBody = await completed.json();
  assert.equal(completedBody.status, 'PASS');

  const afterRelease = await handleCrescoCloudflareRequest(
    request(),
    env,
    {
      worldFairExecutionProvider: {
        async runCanonicalSequence() {
          return {
            status: 'PASS',
            productState: 'WORLD_FAIR_OPERATOR_LAB_LIVE',
            scenarios: {}
          };
        }
      }
    }
  );
  assert.equal(afterRelease.status, 200);
});


test('World Fair UNKNOWN live outcome blocks a second request before any further write', async () => {
  const env = workerEnv();
  let calls = 0;
  const request = () => new Request(
    'https://cresco-api-stocklana.example/api/v0.3/worlds-fair/run', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scenario: 'CANONICAL_LIVE' })
    }
  );
  const provider = {
    async runCanonicalSequence() {
      calls += 1;
      throw new Error('rpc confirmation unknown');
    }
  };
  const first = await handleCrescoCloudflareRequest(request(), env, {
    worldFairExecutionProvider: provider
  });
  assert.equal(first.status, 503);
  assert.equal((await first.json()).status, 'UNKNOWN');

  const status = await handleCrescoCloudflareRequest(
    new Request('https://cresco-api-stocklana.example/api/v0.3/worlds-fair/run-status'),
    env
  );
  assert.equal(status.status, 200);
  const state = await status.json();
  assert.equal(state.status, 'RECONCILIATION_REQUIRED');
  assert.equal(state.reasonCode, 'RUN_OUTCOME_UNCONFIRMED');

  const replay = await handleCrescoCloudflareRequest(request(), env, {
    worldFairExecutionProvider: provider
  });
  assert.equal(replay.status, 503);
  const body = await replay.json();
  assert.equal(body.error, 'WORLD_FAIR_STATE_RECONCILIATION_REQUIRED');
  assert.equal(body.recoveryRequired, true);
  assert.equal(calls, 1);
});

test('World Fair expired lease never silently permits another live run', async () => {
  const state = memoryState();
  await state.storage.put('worlds-fair-run-lock', {
    requestId: 'first-run',
    acquiredAt: '2026-10-01T00:00:00.000Z',
    expiresAtMs: Date.now() - 1000
  });
  const durable = new FamilyState(state);
  const req = (path, method = 'GET', body) =>
    new Request('https://lock.internal' + path, {
      method,
      ...(body ? {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      } : {})
    });

  const before = await durable.fetch(req('/worlds-fair-lock'));
  assert.equal((await before.json()).status, 'RECONCILIATION_REQUIRED');
  const next = await durable.fetch(
    req('/worlds-fair-lock/acquire', 'POST', { requestId: 'second-run' })
  );
  assert.equal(next.status, 409);
  const result = await next.json();
  assert.equal(result.recoveryRequired, true);
  assert.equal(result.reasonCode, 'LEASE_EXPIRED_OUTCOME_UNKNOWN');
  const third = await durable.fetch(
    req('/worlds-fair-lock/acquire', 'POST', { requestId: 'third-run' })
  );
  assert.equal(third.status, 409);
});

test('World Fair safe refusal releases lease; no durable reconciliation lock', async () => {
  const env = workerEnv();
  const bad = await handleCrescoCloudflareRequest(
    new Request('https://cresco-api-stocklana.example/api/v0.3/worlds-fair/run', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scenario: 'INVALID' })
    }), env
  );
  assert.equal(bad.status, 400);
  const status = await handleCrescoCloudflareRequest(
    new Request('https://cresco-api-stocklana.example/api/v0.3/worlds-fair/run-status'),
    env
  );
  assert.equal((await status.json()).status, 'AVAILABLE');
});

test('World Fair run-status fails closed without durable storage', async () => {
  const status = await handleCrescoCloudflareRequest(
    new Request('https://cresco-api-stocklana.example/api/v0.3/worlds-fair/run-status'),
    {}
  );
  assert.equal(status.status, 503);
  assert.equal((await status.json()).recoveryRequired, true);
});
