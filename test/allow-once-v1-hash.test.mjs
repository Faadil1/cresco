import test from 'node:test';
import assert from 'node:assert/strict';
import { PublicKey } from '@solana/web3.js';
import { canonicalAllowOnceV1Hash } from '../src/allow-once-v1-hash.mjs';

const key = n => new PublicKey(Buffer.alloc(32, n));
const action = {
  programId: key(1), mandate: key(2), mandateNonce: 7n,
  mint: key(3), beneficiary: key(4), destinationTokenAccount: key(5),
  amount: 500n, maxNotionalMicroUsd: 1000n, expiry: 1234n, guardian: key(6)
};

test('V1 canonical action digest is deterministic and binds each field', () => {
  const baseline = canonicalAllowOnceV1Hash(action);
  assert.equal(baseline.length, 32);
  assert.deepEqual(baseline, canonicalAllowOnceV1Hash(action));
  const mutations = {
    programId: key(11), mandate: key(12), mandateNonce: 8n,
    mint: key(13), beneficiary: key(14), destinationTokenAccount: key(15),
    amount: 501n, maxNotionalMicroUsd: 1001n, expiry: 1235n, guardian: key(16)
  };
  for (const [field, value] of Object.entries(mutations)) {
    assert.notDeepEqual(canonicalAllowOnceV1Hash({ ...action, [field]: value }), baseline, field);
  }
});

test('V1 digest rejects unsigned overflow and negative token amounts', () => {
  assert.throws(() => canonicalAllowOnceV1Hash({ ...action, amount: -1n }), /V1_U64_OUT_OF_RANGE/);
  assert.throws(() => canonicalAllowOnceV1Hash({ ...action, amount: 1n << 64n }), /V1_U64_OUT_OF_RANGE/);
  assert.throws(() => canonicalAllowOnceV1Hash({ ...action, expiry: 1n << 63n }), /V1_I64_OUT_OF_RANGE/);
});
