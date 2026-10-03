import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyWorldFairRunFailure,
  withTransientRpcReadRetry,
  WORLD_FAIR_STATE_READ_RETRY_PROFILE,
  WORLD_FAIR_ORCA_READ_RETRY_PROFILE
} from '../src/worlds-fair-orca-provider.mjs';

test('transient Orca-context reads retry before succeeding', async () => {
  let calls = 0;

  const value = await withTransientRpcReadRetry(
    async () => {
      calls += 1;
      if (calls < 3) {
        throw new Error('429 Too Many Requests');
      }
      return { ok: true };
    },
    { attempts: 4, baseDelayMs: 0 }
  );

  assert.deepEqual(value, { ok: true });
  assert.equal(calls, 3);
});

test('transient Orca-context reads stop after the configured attempt bound', async () => {
  let calls = 0;

  await assert.rejects(
    () =>
      withTransientRpcReadRetry(
        async () => {
          calls += 1;
          throw new Error('fetch failed');
        },
        { attempts: 3, baseDelayMs: 0 }
      ),
    /fetch failed/
  );

  assert.equal(calls, 3);
});

test('residual ORCA_CONTEXT read failures receive a specific sanitized reason', () => {
  const diagnostic = classifyWorldFairRunFailure(
    new Error('unexpected provider implementation detail'),
    {
      phase: 'ORCA_CONTEXT',
      phaseKind: 'READ'
    }
  );

  assert.equal(diagnostic.failureClass, 'DEPENDENCY_FAILURE');
  assert.equal(
    diagnostic.reasonCode,
    'ORCA_CONTEXT_READ_UNAVAILABLE'
  );
  assert.equal(
    diagnostic.retryPolicy,
    'REQUIRES_STATE_RECONCILIATION'
  );
  assert.equal(
    diagnostic.message.includes('unexpected provider implementation detail'),
    false
  );
});


test('Orca read retry profile gives throttled quotes a longer bounded recovery window', () => {
  assert.deepEqual(WORLD_FAIR_ORCA_READ_RETRY_PROFILE, {
    attempts: 6,
    baseDelayMs: 2_000
  });
});

test('Orca read profile can recover on the sixth bounded attempt', async () => {
  let calls = 0;

  const value = await withTransientRpcReadRetry(
    async () => {
      calls += 1;
      if (calls < 6) {
        throw new Error('429 Too Many Requests');
      }
      return 'quote-ready';
    },
    {
      ...WORLD_FAIR_ORCA_READ_RETRY_PROFILE,
      baseDelayMs: 0
    }
  );

  assert.equal(value, 'quote-ready');
  assert.equal(calls, 6);
});

test('Orca read profile remains bounded and does not retry semantic failures', async () => {
  let calls = 0;

  await assert.rejects(
    () =>
      withTransientRpcReadRetry(
        async () => {
          calls += 1;
          throw new Error('WORLD_FAIR_ORCA_POOL_PAIR_MISMATCH');
        },
        {
          ...WORLD_FAIR_ORCA_READ_RETRY_PROFILE,
          baseDelayMs: 0
        }
      ),
    /WORLD_FAIR_ORCA_POOL_PAIR_MISMATCH/
  );

  assert.equal(calls, 1);
});


test('World’s Fair preflight/state reads use the same bounded recovery budget', () => {
  assert.deepEqual(WORLD_FAIR_STATE_READ_RETRY_PROFILE, {
    attempts: 6,
    baseDelayMs: 2_000
  });
});

test('preflight/state read profile can recover on the sixth bounded attempt', async () => {
  let calls = 0;

  const value = await withTransientRpcReadRetry(
    async () => {
      calls += 1;
      if (calls < 6) {
        throw new Error('429 Too Many Requests');
      }
      return 'state-ready';
    },
    {
      ...WORLD_FAIR_STATE_READ_RETRY_PROFILE,
      baseDelayMs: 0
    }
  );

  assert.equal(value, 'state-ready');
  assert.equal(calls, 6);
});
