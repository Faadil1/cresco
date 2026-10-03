import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyWorldFairRunFailure
} from '../src/worlds-fair-orca-provider.mjs';

test('read-side RPC throttling is safe to retry only as a read', () => {
  const diagnostic = classifyWorldFairRunFailure(
    new Error('429 Too Many Requests'),
    {
      phase: 'STANDING_1_QUOTE',
      phaseKind: 'READ'
    }
  );

  assert.equal(diagnostic.failureClass, 'TRANSIENT_RPC');
  assert.equal(diagnostic.reasonCode, 'SOLANA_RPC_TRANSIENT');
  assert.equal(diagnostic.retryPolicy, 'SAFE_RETRY_READ');
});

test('write-side RPC uncertainty requires state reconciliation', () => {
  const diagnostic = classifyWorldFairRunFailure(
    new Error('429 Too Many Requests'),
    {
      phase: 'STANDING_2_EXECUTE',
      phaseKind: 'WRITE'
    }
  );

  assert.equal(diagnostic.failureClass, 'TRANSIENT_RPC');
  assert.equal(
    diagnostic.retryPolicy,
    'REQUIRES_STATE_RECONCILIATION'
  );
});

test('blockhash expiry is classified as unknown confirmation, never safe replay', () => {
  const diagnostic = classifyWorldFairRunFailure(
    new Error('SOLANA_BLOCKHASH_EXPIRED:signature'),
    {
      phase: 'EXACT_EXCEPTION_EXECUTE',
      phaseKind: 'WRITE'
    }
  );

  assert.equal(
    diagnostic.failureClass,
    'UNKNOWN_CONFIRMATION'
  );
  assert.equal(
    diagnostic.reasonCode,
    'SOLANA_CONFIRMATION_UNCERTAIN'
  );
  assert.equal(
    diagnostic.retryPolicy,
    'REQUIRES_STATE_RECONCILIATION'
  );
});

test('Pyth dependency failures expose only the sanitized dependency reason', () => {
  const diagnostic = classifyWorldFairRunFailure(
    new Error('WORLD_FAIR_PYTH_UNAVAILABLE:private-provider-detail'),
    {
      phase: 'STANDING_1_MARKET_EVIDENCE',
      phaseKind: 'READ'
    }
  );

  assert.equal(
    diagnostic.reasonCode,
    'PYTH_EVIDENCE_UNAVAILABLE'
  );
  assert.equal(
    diagnostic.message.includes('private-provider-detail'),
    false
  );
});
