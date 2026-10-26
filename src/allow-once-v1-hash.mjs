import { createHash } from 'node:crypto';
import { PublicKey } from '@solana/web3.js';

const DOMAIN = Buffer.from('CRESCO_ALLOW_ONCE_V1\0', 'utf8');

function keyBytes(value) {
  return new PublicKey(value).toBuffer();
}

function exactInteger(value) {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) {
    throw new RangeError('V1_UNSAFE_JS_INTEGER_USE_BIGINT');
  }
  if (typeof value !== 'bigint' && typeof value !== 'number' &&
      !(typeof value === 'string' && /^-?[0-9]+$/.test(value))) {
    throw new TypeError('V1_INTEGER_REQUIRED');
  }
  return BigInt(value);
}

function u64(value) {
  const n = exactInteger(value);
  if (n < 0n || n > 0xffffffffffffffffn) throw new RangeError('V1_U64_OUT_OF_RANGE');
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(n);
  return b;
}

function i64(value) {
  const n = exactInteger(value);
  if (n < -(1n << 63n) || n > (1n << 63n) - 1n) throw new RangeError('V1_I64_OUT_OF_RANGE');
  const b = Buffer.alloc(8);
  b.writeBigInt64LE(n);
  return b;
}

// Design-only: not used for granting or executing onchain V1 allowances.
export function canonicalAllowOnceV1Hash({
  programId, mandate, mandateNonce, mint, beneficiary,
  destinationTokenAccount, amount, maxNotionalMicroUsd, expiry, guardian
}) {
  return createHash('sha256').update(Buffer.concat([
    DOMAIN, keyBytes(programId), keyBytes(mandate), u64(mandateNonce),
    keyBytes(mint), keyBytes(beneficiary), keyBytes(destinationTokenAccount),
    u64(amount), u64(maxNotionalMicroUsd), i64(expiry), keyBytes(guardian)
  ])).digest();
}
