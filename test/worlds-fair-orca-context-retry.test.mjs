import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyWorldFairRunFailure,
  summarizeWorldFairUnderlyingError,
  withTransientRpcReadRetry,
  withTransientPythEvidenceRetry,
  WORLD_FAIR_STATE_READ_RETRY_PROFILE,
  WORLD_FAIR_ORCA_READ_RETRY_PROFILE,
  WORLD_FAIR_PYTH_READ_RETRY_PROFILE,
  WORLD_FAIR_POST_WRITE_READ_PROFILE,
  WORLD_FAIR_READ_CONNECTION_CONFIG
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


test('World’s Fair safe-read connection disables web3 rate-limit auto-retry', () => {
  assert.deepEqual(WORLD_FAIR_READ_CONNECTION_CONFIG, {
    commitment: 'confirmed',
    disableRetryOnRateLimit: true
  });
});


test('Pyth evidence retry profile is bounded', () => {
  assert.deepEqual(WORLD_FAIR_PYTH_READ_RETRY_PROFILE, {
    attempts: 4,
    baseDelayMs: 1_000
  });
});

test('post-write read reconciliation profile is bounded', () => {
  assert.deepEqual(WORLD_FAIR_POST_WRITE_READ_PROFILE, {
    attempts: 6,
    baseDelayMs: 2_000
  });
});

test('post-write read lag is classified as state reconciliation, not blind retry', () => {
  const diagnostic = classifyWorldFairRunFailure(
    new Error(
      'WORLD_FAIR_POST_WRITE_READ_NOT_OBSERVED expectedSpentThisPeriod=5400000 observedSpentThisPeriod=5200000'
    ),
    {
      phase: 'STANDING_1_EFFECT_OBSERVED',
      phaseKind: 'READ'
    }
  );

  assert.equal(diagnostic.failureClass, 'UNKNOWN_CONFIRMATION');
  assert.equal(
    diagnostic.reasonCode,
    'SOLANA_POST_WRITE_READ_NOT_OBSERVED'
  );
  assert.equal(
    diagnostic.retryPolicy,
    'REQUIRES_STATE_RECONCILIATION'
  );
});

test('transient Pyth evidence retries can recover', async () => {
  let calls = 0;

  const snapshot = await withTransientPythEvidenceRetry(
    async () => {
      calls += 1;
      if (calls < 3) {
        return {
          status: 'UNAVAILABLE',
          reasonCode: 'PYTH_UPSTREAM_ERROR',
          solanaPayload: {
            status: 'UNAVAILABLE',
            reasonCode: 'PYTH_UPSTREAM_ERROR'
          }
        };
      }
      return {
        status: 'FRESH',
        solanaPayload: {
          status: 'AVAILABLE',
          data: 'abcd'
        }
      };
    },
    {
      ...WORLD_FAIR_PYTH_READ_RETRY_PROFILE,
      baseDelayMs: 0
    }
  );

  assert.equal(calls, 3);
  assert.equal(snapshot.status, 'FRESH');
  assert.equal(snapshot.solanaPayload.status, 'AVAILABLE');
});

test('Pyth auth and entitlement failures do not retry', async () => {
  let calls = 0;

  const snapshot = await withTransientPythEvidenceRetry(
    async () => {
      calls += 1;
      return {
        status: 'UNAVAILABLE',
        reasonCode: 'PYTH_NOT_ENTITLED',
        solanaPayload: {
          status: 'UNAVAILABLE',
          reasonCode: 'PYTH_NOT_ENTITLED'
        }
      };
    },
    {
      ...WORLD_FAIR_PYTH_READ_RETRY_PROFILE,
      baseDelayMs: 0
    }
  );

  assert.equal(calls, 1);
  assert.equal(snapshot.reasonCode, 'PYTH_NOT_ENTITLED');
});

test('stale Pyth evidence is retryable before fail-closed evaluation', async () => {
  let calls = 0;

  const snapshot = await withTransientPythEvidenceRetry(
    async () => {
      calls += 1;
      if (calls === 1) {
        return {
          status: 'STALE',
          solanaPayload: { status: 'AVAILABLE', data: 'abcd' }
        };
      }
      return {
        status: 'FRESH',
        solanaPayload: { status: 'AVAILABLE', data: 'abcd' }
      };
    },
    {
      ...WORLD_FAIR_PYTH_READ_RETRY_PROFILE,
      baseDelayMs: 0
    }
  );

  assert.equal(calls, 2);
  assert.equal(snapshot.status, 'FRESH');
});


test('post-write Orca context phases retain dependency classification', () => {
  const diagnostic = classifyWorldFairRunFailure(
    new Error('unexpected provider implementation detail'),
    {
      phase: 'ORCA_CONTEXT_AFTER_STANDING_1',
      phaseKind: 'READ'
    }
  );

  assert.equal(diagnostic.failureClass, 'DEPENDENCY_FAILURE');
  assert.equal(diagnostic.reasonCode, 'ORCA_CONTEXT_READ_UNAVAILABLE');
  assert.equal(diagnostic.retryPolicy, 'REQUIRES_STATE_RECONCILIATION');
});

test('residual Orca quote failures receive quote-specific classification', () => {
  const diagnostic = classifyWorldFairRunFailure(
    new Error('unexpected quote implementation detail'),
    {
      phase: 'STANDING_2_QUOTE',
      phaseKind: 'READ'
    }
  );

  assert.equal(diagnostic.failureClass, 'DEPENDENCY_FAILURE');
  assert.equal(diagnostic.reasonCode, 'ORCA_QUOTE_READ_UNAVAILABLE');
  assert.equal(diagnostic.retryPolicy, 'REQUIRES_STATE_RECONCILIATION');
});


test('underlying read-error evidence preserves structure while redacting URLs and tokens', () => {
  const error = new Error(
    'fetch failed at https://rpc.example.test/path?api_key=secret authorization=BearerSecret'
  );
  error.code = 'FETCH_FAILED';
  error.logs = [
    'rpc=https://rpc.example.test/abc token=supersecret',
    'TickArray account unavailable'
  ];

  const summary = summarizeWorldFairUnderlyingError(error);

  assert.equal(summary.name, 'Error');
  assert.equal(summary.code, 'FETCH_FAILED');
  assert.match(summary.message, /<redacted-url>/);
  assert.equal(summary.message.includes('secret'), false);
  assert.equal(summary.logTail.length, 2);
  assert.equal(summary.logTail[0].includes('supersecret'), false);
  assert.match(summary.logTail[1], /TickArray account unavailable/);
});

test('underlying Orca invariant text remains visible when it contains no secret material', () => {
  const summary = summarizeWorldFairUnderlyingError(
    new Error('Whirlpool data not found')
  );

  assert.equal(summary.message, 'Whirlpool data not found');
  assert.deepEqual(summary.logTail, []);
});


test('Orca MintInfo fetch gaps are treated as bounded transient reads', async () => {
  let calls = 0;

  const value = await withTransientRpcReadRetry(
    async () => {
      calls += 1;
      if (calls < 3) {
        throw new Error(
          'Unable to fetch MintInfo for mint - H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'
        );
      }
      return 'mint-info-ready';
    },
    { attempts: 4, baseDelayMs: 0 }
  );

  assert.equal(value, 'mint-info-ready');
  assert.equal(calls, 3);
});

test('Orca MintInfo fetch retry remains bounded', async () => {
  let calls = 0;

  await assert.rejects(
    () =>
      withTransientRpcReadRetry(
        async () => {
          calls += 1;
          throw new Error(
            'Unable to fetch MintInfo for mint - H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'
          );
        },
        { attempts: 3, baseDelayMs: 0 }
      ),
    /Unable to fetch MintInfo/
  );

  assert.equal(calls, 3);
});
