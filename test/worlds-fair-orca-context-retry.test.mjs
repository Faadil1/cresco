import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyWorldFairRunFailure,
  withTransientRpcReadRetry
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
