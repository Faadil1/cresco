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
