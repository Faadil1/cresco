import { createHash } from 'node:crypto';

import BN from 'bn.js';
import {
  Connection,
  Ed25519Program,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  SYSVAR_INSTRUCTIONS_PUBKEY
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction
} from '@solana/spl-token';
import {
  WhirlpoolContext,
  buildWhirlpoolClient,
  swapQuoteByInputToken,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil,
  IGNORE_CACHE
} from '@orca-so/whirlpools-sdk';
import { Percentage } from '@orca-so/common-sdk';
import { createEd25519Instruction } from '@pythnetwork/pyth-lazer-solana-sdk';

import { fetchPythProSolanaPayload } from './pyth-adapter.mjs';
import {
  confirmSignatureOverRpc,
  executeTransactionBuilderOverRpc,
  isBlockhashExpiryError,
  isTransientSolanaRpcError
} from './solana-transaction-reliability.mjs';

export const WORLD_FAIR_PROGRAM_ID = new PublicKey(
  '7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z'
);
export const WORLD_FAIR_PROGRAM_SHA256 =
  '084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61';

export const WORLD_FAIR_ORCA_POOL = new PublicKey(
  '63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg'
);
const ORCA_SOL_USDC_POOL = new PublicKey(
  '3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt'
);
export const WORLD_FAIR_DEV_USDC = new PublicKey(
  'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'
);
export const WORLD_FAIR_DEV_USDT = new PublicKey(
  'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'
);
export const PYTH_LAZER_PROGRAM_ID = new PublicKey(
  'pytd2yyk641x7ak7mkaasSJVXh6YYZnC7wTmtgAyxPt'
);
export const PYTH_LAZER_STORAGE_ID = new PublicKey(
  '3rdJbqfnagQ4yx9HXJViD4zc4xpiSqmFsKpPuSCQVyQL'
);

function isTransientRpcReadError(error) {
  const message = String(error?.message ?? error ?? '');
  return (
    isTransientSolanaRpcError(error) ||
    message.includes('Unable to fetch TokenAccountInfo for vault') ||
    message.includes('Unable to fetch MintInfo for mint') ||
    message.includes('Unable to fetch Whirlpool at address at') ||
    message.includes('Invariant failed: Whirlpool data not found') ||
    // Production bundles (Cloudflare Workers) strip tiny-invariant details, so
    // the same Orca null-read surfaces as the bare string. Reads only: this
    // classifier is used by bounded read/quote retries, never by writes.
    message.trim() === 'Invariant failed'
  );
}

export function buildWorldFairOrcaReadFetcher(baseFetcher) {
  if (!baseFetcher) {
    throw new Error('WORLD_FAIR_ORCA_FETCHER_REQUIRED');
  }

  const addressKey = (address) =>
    typeof address?.toBase58 === 'function'
      ? address.toBase58()
      : String(address);

  const serialMap = async (addresses, singleMethod, opts) => {
    const entries = [];
    for (const address of addresses) {
      const value = await baseFetcher[singleMethod](address, opts);
      entries.push([addressKey(address), value]);
    }
    return new Map(entries);
  };

  return new Proxy(baseFetcher, {
    get(target, prop, receiver) {
      if (prop === 'getMintInfos') {
        return async (addresses, opts) => {
          const result = await serialMap(
            addresses,
            'getMintInfo',
            opts
          );

          for (const address of addresses) {
            const key = addressKey(address);
            if (!result.get(key)) {
              throw new Error(
                `Unable to fetch MintInfo for mint - ${key}`
              );
            }
          }

          return result;
        };
      }

      if (prop === 'getTickArrays') {
        return async (addresses, opts) => {
          const values = [];
          for (const address of addresses) {
            values.push(await target.getTickArray(address, opts));
          }
          return values;
        };
      }

      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
}

export async function withTransientRpcReadRetry(
  operation,
  { attempts = 4, baseDelayMs = 1_500 } = {}
) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientRpcReadError(error) || attempt === attempts) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelayMs * attempt)
      );
    }
  }

  throw lastError;
}

export const WORLD_FAIR_STATE_READ_RETRY_PROFILE = Object.freeze({
  attempts: 6,
  baseDelayMs: 2_000
});

export const WORLD_FAIR_ORCA_READ_RETRY_PROFILE = Object.freeze({
  attempts: 6,
  baseDelayMs: 2_000
});

export const WORLD_FAIR_PYTH_READ_RETRY_PROFILE = Object.freeze({
  attempts: 4,
  baseDelayMs: 1_000
});

export const WORLD_FAIR_POST_WRITE_READ_PROFILE = Object.freeze({
  attempts: 6,
  baseDelayMs: 2_000
});

export const WORLD_FAIR_READ_CONNECTION_CONFIG = Object.freeze({
  commitment: 'confirmed',
  disableRetryOnRateLimit: true
});

export const WORLD_FAIR_PYTH_FEED = Object.freeze({
  symbol: 'Crypto.USDC/USD',
  feedId: 7,
  exponent: -8,
  minChannel: 'fixed_rate@200ms'
});

const RETRYABLE_PYTH_EVIDENCE_REASON_CODES = new Set([
  'PYTH_UPSTREAM_UNREACHABLE',
  'PYTH_UPSTREAM_ERROR',
  'PYTH_FEED_MISSING_FROM_RESPONSE',
  'PYTH_SOLANA_PAYLOAD_MISSING',
  'PYTH_PRICE_UNAVAILABLE'
]);

function pythEvidenceReady(snapshot) {
  return (
    snapshot?.status === 'FRESH' &&
    snapshot?.solanaPayload?.status === 'AVAILABLE'
  );
}

export function isRetryablePythEvidenceSnapshot(snapshot) {
  if (snapshot?.status === 'STALE') return true;
  const reasonCode =
    snapshot?.solanaPayload?.reasonCode ??
    snapshot?.reasonCode ??
    null;
  return RETRYABLE_PYTH_EVIDENCE_REASON_CODES.has(reasonCode);
}

export async function withTransientPythEvidenceRetry(
  operation,
  { attempts = 4, baseDelayMs = 1_000 } = {}
) {
  let lastSnapshot = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastSnapshot = await operation();
    if (pythEvidenceReady(lastSnapshot)) return lastSnapshot;

    if (
      !isRetryablePythEvidenceSnapshot(lastSnapshot) ||
      attempt === attempts
    ) {
      return lastSnapshot;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, baseDelayMs * attempt)
    );
  }

  return lastSnapshot;
}

const STANDING_MAX_NOTIONAL_MICRO_USD = 500_000;
const PERIOD_MAX_NOTIONAL_MICRO_USD = 10_000_000;
const MAX_ACTION_AMOUNT = 5_000_000;
const MAX_PERIOD_AMOUNT = 10_000_000;
const MAX_UNIT_PRICE_MICRO_USD = 2_000_000;
const PERIOD_SECONDS = 24 * 60 * 60;
const ACTION_SWAP_EXACT_IN = 2;

const STANDING_INPUT = 200_000;
const EXCEPTION_INPUT = 750_000;
const ROLLBACK_INPUT = 700_000;
const VAULT_TARGET_BASE_UNITS = 1_500_000;
const DELEGATE_MIN_LAMPORTS = 50_000_000;
const DELEGATE_TOPUP_LAMPORTS = 100_000_000;
const FUNDING_SOL_PROBE_LAMPORTS = 2_000_000;
const FUNDING_SOL_RESERVE_LAMPORTS = 5_000_000;
const FUNDING_SOL_SAFETY_BPS = 11_000;

export function sizeWorldFairFundingLamports({
  requiredBaseUnits,
  probeInputLamports,
  probeMinimumOutputBaseUnits,
  spendableLamports,
  safetyBps = FUNDING_SOL_SAFETY_BPS
}) {
  const required = BigInt(requiredBaseUnits);
  const probeInput = BigInt(probeInputLamports);
  const probeOutput = BigInt(probeMinimumOutputBaseUnits);
  const spendable = BigInt(spendableLamports);
  const safety = BigInt(safetyBps);

  if (
    required <= 0n ||
    probeInput <= 0n ||
    probeOutput <= 0n ||
    spendable <= 0n ||
    safety < 10_000n
  ) {
    throw new Error('WORLD_FAIR_LAB_FUNDING_QUOTE_INVALID');
  }

  const denominator = probeOutput * 10_000n;
  const numerator = probeInput * required * safety;
  let sized = (numerator + denominator - 1n) / denominator;

  if (sized < probeInput) sized = probeInput;
  if (sized > spendable) sized = spendable;

  return Number(sized);
}

const runtimePromises = new Map();

function hashBytes(value) {
  return createHash('sha256').update(value).digest();
}

function discriminator(name) {
  return createHash('sha256')
    .update(`global:${name}`)
    .digest()
    .subarray(0, 8);
}

function u64le(value) {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(BigInt(value));
  return out;
}

function i64le(value) {
  const out = Buffer.alloc(8);
  out.writeBigInt64LE(BigInt(value));
  return out;
}

function u32le(value) {
  const out = Buffer.alloc(4);
  out.writeUInt32LE(Number(value));
  return out;
}

function u128le(value) {
  let n = BigInt(value);
  const out = Buffer.alloc(16);
  for (let i = 0; i < 16; i += 1) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

function vecBytes(value) {
  const bytes = Buffer.from(value);
  return Buffer.concat([u32le(bytes.length), bytes]);
}

function readU64(data, offset) {
  return Number(data.readBigUInt64LE(offset));
}

function readI64(data, offset) {
  return Number(data.readBigInt64LE(offset));
}

function parseKeypair(json) {
  const values = JSON.parse(json);
  if (!Array.isArray(values) || values.length !== 64) {
    throw new Error('DEVNET_KEYPAIR_JSON must be a 64-byte Solana keypair array');
  }
  return Keypair.fromSecretKey(Uint8Array.from(values));
}

export const WORLD_FAIR_LAB_POLICY = Object.freeze({
  maxActionNotionalMicroUsd: STANDING_MAX_NOTIONAL_MICRO_USD,
  maxPeriodNotionalMicroUsd: PERIOD_MAX_NOTIONAL_MICRO_USD,
  maxActionAmount: MAX_ACTION_AMOUNT,
  maxPeriodAmount: MAX_PERIOD_AMOUNT,
  periodSeconds: PERIOD_SECONDS,
  maxUnitPriceMicroUsd: MAX_UNIT_PRICE_MICRO_USD,
  maxMarketAgeSeconds: 120,
  maxConfidenceBps: 100,
  expiresAt: 0
});

export function normalizeWorldFairPolicy(policy = {}) {
  const merged = { ...WORLD_FAIR_LAB_POLICY, ...(policy ?? {}) };
  const out = {};
  for (const key of Object.keys(WORLD_FAIR_LAB_POLICY)) {
    const value = Number(merged[key]);
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`WORLD_FAIR_POLICY_INVALID:${key}`);
    }
    out[key] = value;
  }
  if (out.maxActionNotionalMicroUsd <= 0) throw new Error('WORLD_FAIR_POLICY_INVALID:maxActionNotionalMicroUsd');
  if (out.maxPeriodNotionalMicroUsd && out.maxPeriodNotionalMicroUsd < out.maxActionNotionalMicroUsd) {
    throw new Error('WORLD_FAIR_POLICY_INVALID:maxPeriodNotionalMicroUsd');
  }
  if (out.maxActionAmount <= 0 || out.maxPeriodAmount < out.maxActionAmount) {
    throw new Error('WORLD_FAIR_POLICY_INVALID:maxPeriodAmount');
  }
  if (out.periodSeconds <= 0) throw new Error('WORLD_FAIR_POLICY_INVALID:periodSeconds');
  if (out.maxMarketAgeSeconds <= 0) throw new Error('WORLD_FAIR_POLICY_INVALID:maxMarketAgeSeconds');
  if (out.maxConfidenceBps <= 0 || out.maxConfidenceBps > 10_000) {
    throw new Error('WORLD_FAIR_POLICY_INVALID:maxConfidenceBps');
  }
  return Object.freeze(out);
}

// A workspace (operator/principal workflow) never shares the judge lab mandate:
// pausing or revising it must not break the fixed CANONICAL_LIVE regression path.
export function deriveWorldFairWorkspaceDelegate(guardian, workspaceId) {
  if (!guardian?.secretKey || !guardian?.publicKey) {
    throw new Error('WORLD_FAIR_GUARDIAN_KEYPAIR_REQUIRED');
  }
  const id = String(workspaceId ?? '');
  if (!/^[a-z0-9-]{6,64}$/.test(id)) throw new Error('WORLD_FAIR_WORKSPACE_ID_INVALID');
  const seed = createHash('sha256')
    .update('CRESCO_WORLD_FAIR_WORKSPACE_DELEGATE_V1')
    .update(Buffer.from(guardian.secretKey))
    .update(id)
    .digest()
    .subarray(0, 32);
  return Keypair.fromSeed(seed);
}

// Mirrors programs/keys price_to_micro_usd: integer mantissa, truncating division.
export function worldFairPythUnitPriceMicroUsd(snapshot) {
  const exponent = Number.isInteger(Number(snapshot?.priceExponent))
    ? Number(snapshot.priceExponent)
    : WORLD_FAIR_PYTH_FEED.exponent;
  const mantissa = Number.isFinite(Number(snapshot?.priceMantissa))
    ? Number(snapshot.priceMantissa)
    : Math.round(Number(snapshot?.price) * 10 ** -exponent);
  if (!Number.isSafeInteger(mantissa) || mantissa <= 0) return NaN;
  const scale = exponent + 6;
  const value =
    scale >= 0
      ? BigInt(mantissa) * 10n ** BigInt(scale)
      : BigInt(mantissa) / 10n ** BigInt(-scale);
  return Number(value);
}

const SOFT_REFUSALS = new Set(['PythNotionalExceeded']);
const STALE_REFUSALS = new Set(['StaleNonce', 'StaleAllowance', 'StaleReviewReceipt']);
const EVIDENCE_REFUSALS = new Set([
  'PythMessageInvalid', 'PythPayloadInvalid', 'PythPayloadUnsupportedProperty',
  'PythSignatureVerificationFailed', 'PythChannelMismatch', 'PythFeedMismatch',
  'PythPriceMissing', 'PythPriceInvalid', 'PythExponentMissing', 'PythExponentUnsupported',
  'PythConfidenceMissing', 'PythConfidenceInvalid', 'PythConfidenceTooWide',
  'PythTimestampInvalid', 'PythMarketEvidenceStale', 'MarketConditionInvalidated'
]);
const VENUE_REFUSALS = new Set(['AmountOutBelowMinimum']);
const HARD_REFUSALS = new Set([
  'MandateNotActive', 'MandateRevoked', 'MandateExpired', 'ExecutionNotAllowedAtStage',
  'AssetRuleDisabled', 'ActionNotAllowed', 'ActionAmountExceeded', 'PeriodAmountExceeded',
  'PythPeriodNotionalExceeded', 'InvalidOrcaProgram', 'InvalidOrcaPool',
  'InvalidTradeInputMint', 'InvalidTradeOutputMint', 'TradeActionExpired',
  'AllowanceAlreadyUsed', 'AllowanceExpired', 'AllowanceActionMismatch',
  'AllowanceRequestMismatch', 'AllowanceNotionalExceeded', 'ExceptionNotRequired',
  'InvalidAmount', 'InvalidCap', 'Unauthorized', 'InvalidExpiry',
  'InvalidMarketPolicy', 'Overflow', 'InvalidOrcaPriceLimit', 'InvalidPeriod'
]);

// Program refusals are deterministic decisions; anything else (RPC, timeout,
// blockhash, HTTP 401) is NOT a refusal and must surface as UNKNOWN for
// reconciliation. Only exact Anchor error names count (`Error Code: X` in the
// program logs or the parsed AnchorError), never a free-text substring.
export function worldFairProgramErrorCodes(error) {
  const codes = new Set();
  const direct = error?.error?.errorCode?.code;
  if (direct) codes.add(String(direct));
  for (const match of errorText(error).matchAll(/Error Code: ([A-Za-z][A-Za-z0-9]*)/g)) codes.add(match[1]);
  return [...codes];
}

export function classifyWorldFairProgramRefusal(error) {
  const codes = worldFairProgramErrorCodes(error);
  if (!codes.length) return null;
  const find = (set) => codes.find((code) => set.has(code));
  const soft = find(SOFT_REFUSALS);
  if (soft) return { refused: true, code: soft, boundary: 'SOFT' };
  const stale = find(STALE_REFUSALS);
  if (stale) return { refused: true, code: stale, boundary: 'STALE' };
  const evidence = find(EVIDENCE_REFUSALS);
  if (evidence) return { refused: true, code: evidence, boundary: 'EVIDENCE' };
  const venue = find(VENUE_REFUSALS);
  if (venue) return { refused: true, code: 'AmountOutBelowMinimum', boundary: 'VENUE' };
  const hard = find(HARD_REFUSALS);
  if (hard) return { refused: true, code: hard, boundary: 'HARD' };
  // A named program error we do not map is still a deterministic refusal.
  return { refused: true, code: codes[0], boundary: 'HARD' };
}

export function worldFairSignatureFromError(error) {
  const match = errorText(error).match(/SOLANA_CONFIRMATION_TIMEOUT:([1-9A-HJ-NP-Za-km-z]{64,90})/);
  return match ? match[1] : null;
}

// Same order and arithmetic as the program's post-notional checks
// (reset_period_if_needed, PeriodAmountExceeded, PythPeriodNotionalExceeded).
export function worldFairHardPrecheck(state, q, nowSeconds) {
  const rule = state.assetRule;
  const mandate = state.mandate;
  const amount = Number(q.inputAmount);
  const notional = Number(q.notionalMicroUsd);
  if (!rule.enabled) return 'AssetRuleDisabled';
  if (amount > Number(rule.maxActionAmount)) return 'ActionAmountExceeded';
  const rolled = nowSeconds >= Number(rule.periodStartedAt) + Number(rule.periodSeconds);
  const spent = rolled ? 0 : Number(rule.spentThisPeriod);
  const spentNotional = rolled ? 0 : Number(rule.spentThisPeriodNotionalMicroUsd);
  if (spent + amount > Number(rule.maxPeriodAmount)) return 'PeriodAmountExceeded';
  const periodCap = Number(mandate.maxPeriodNotionalMicroUsd);
  if (periodCap !== 0 && spentNotional + notional > periodCap) return 'PythPeriodNotionalExceeded';
  return null;
}

export const WORLD_FAIR_MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Puts the principal's wallet approval on-chain, in the same transaction as
// the exception grant: Solana's native Ed25519 program verifies the wallet's
// signature over the exact approval message (the transaction fails if it does
// not verify), and a memo links it to the request. The CRESCO program itself
// does not read this proof; the runtime verifies it.
export function worldFairApprovalProofInstructions(proof) {
  if (!proof) return [];
  const publicKey = new PublicKey(String(proof.publicKey)).toBytes();
  const signature = Uint8Array.from(proof.signature);
  if (signature.length !== 64) throw new Error('WORLD_FAIR_APPROVAL_SIGNATURE_INVALID');
  const message = Buffer.from(String(proof.message), 'utf8');
  return [
    Ed25519Program.createInstructionWithPublicKey({ publicKey, message, signature }),
    new TransactionInstruction({
      programId: WORLD_FAIR_MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(`CRESCO principal approval verified on-chain: ${proof.requestId ?? 'request'}`, 'utf8')
    })
  ];
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export function base58Encode(bytes) {
  const input = Buffer.from(bytes);
  let value = BigInt('0x' + (input.toString('hex') || '0'));
  let out = '';
  while (value > 0n) {
    out = BASE58_ALPHABET[Number(value % 58n)] + out;
    value /= 58n;
  }
  for (const byte of input) {
    if (byte !== 0) break;
    out = '1' + out;
  }
  return out;
}

export class WorldFairGuardianSignatureRequired extends Error {
  constructor(request) {
    super('WORLD_FAIR_GUARDIAN_SIGNATURE_REQUIRED');
    this.request = request;
  }
}

const MANDATE_STATUS_CODES = Object.freeze({ ACTIVE: 0, PAUSED: 1, REVOKED: 2 });
const MANDATE_STATUS_NAMES = Object.freeze(['ACTIVE', 'PAUSED', 'REVOKED']);

export function deriveWorldFairDelegate(guardian) {
  if (!guardian?.secretKey || !guardian?.publicKey) {
    throw new Error('WORLD_FAIR_GUARDIAN_KEYPAIR_REQUIRED');
  }
  const seed = createHash('sha256')
    .update('CRESCO_WORLD_FAIR_OPERATOR_LAB_DELEGATE_V1')
    .update(Buffer.from(guardian.secretKey))
    .digest()
    .subarray(0, 32);
  return Keypair.fromSeed(seed);
}

function parseCharter(data) {
  if (!Buffer.isBuffer(data) || data.length < 129) {
    throw new Error('WORLD_FAIR_CHARTER_INVALID');
  }
  return {
    guardian: new PublicKey(data.subarray(8, 40)),
    beneficiary: new PublicKey(data.subarray(40, 72)),
    version: readU64(data, 112),
    bump: data.readUInt8(128)
  };
}

function parseMandate(data) {
  if (!Buffer.isBuffer(data) || data.length < 123) {
    throw new Error('WORLD_FAIR_MANDATE_INVALID');
  }
  return {
    charter: new PublicKey(data.subarray(8, 40)),
    stage: data.readUInt8(40),
    status: data.readUInt8(41),
    version: readU64(data, 42),
    nonce: readU64(data, 50),
    maxActionNotionalMicroUsd: readU64(data, 58),
    maxPeriodNotionalMicroUsd: readU64(data, 66),
    expiresAt: readI64(data, 74),
    maxMarketAgeSeconds: data.readUInt32LE(82),
    maxConfidenceBps: data.readUInt32LE(86),
    bump: data.readUInt8(122)
  };
}

function parseAssetRule(data) {
  if (!Buffer.isBuffer(data) || data.length < 135) {
    throw new Error('WORLD_FAIR_ASSET_RULE_INVALID');
  }
  return {
    mandate: new PublicKey(data.subarray(8, 40)),
    mint: new PublicKey(data.subarray(40, 72)),
    actionMask: data.readUInt8(72),
    enabled: data.readUInt8(73) !== 0,
    maxActionAmount: readU64(data, 74),
    maxPeriodAmount: readU64(data, 82),
    periodSeconds: readI64(data, 90),
    periodStartedAt: readI64(data, 98),
    spentThisPeriod: readU64(data, 106),
    spentThisPeriodNotionalMicroUsd: readU64(data, 114),
    maxUnitPriceMicroUsd: readU64(data, 122),
    pythFeedId: data.readUInt32LE(130),
    bump: data.readUInt8(134)
  };
}

function parseAllowance(data) {
  if (!Buffer.isBuffer(data) || data.length < 202) {
    throw new Error('WORLD_FAIR_ALLOWANCE_INVALID');
  }
  return {
    mandate: new PublicKey(data.subarray(8, 40)),
    guardian: new PublicKey(data.subarray(40, 72)),
    beneficiary: new PublicKey(data.subarray(72, 104)),
    mint: new PublicKey(data.subarray(104, 136)),
    requestHash: Buffer.from(data.subarray(136, 168)),
    maxNotionalMicroUsd: readU64(data, 168),
    mandateNonce: readU64(data, 176),
    expiresAt: readI64(data, 184),
    used: data.readUInt8(192) !== 0,
    usedAt: readI64(data, 193),
    bump: data.readUInt8(201)
  };
}

function errorText(error) {
  return [
    error?.error?.errorCode?.code,
    error?.error?.errorMessage,
    error?.message,
    error?.stack,
    ...(Array.isArray(error?.logs) ? error.logs : [])
  ]
    .filter(Boolean)
    .map(String)
    .join('\n');
}

function redactDiagnosticText(value) {
  return String(value ?? '')
    .replace(/https?:\/\/[^\s)"']+/gi, '<redacted-url>')
    .replace(
      /\b(authorization|api[-_ ]?key|token|bearer)\b\s*[:=]\s*[^\s,;]+/gi,
      '$1=<redacted>'
    )
    .slice(0, 1200);
}

export function summarizeWorldFairUnderlyingError(error) {
  const message =
    error?.message ??
    error?.error?.errorMessage ??
    error?.error?.errorCode?.code ??
    error ??
    'UNKNOWN_ERROR';

  return {
    name: redactDiagnosticText(
      error?.name ?? error?.constructor?.name ?? 'Error'
    ).slice(0, 120),
    code:
      error?.code === undefined || error?.code === null
        ? null
        : redactDiagnosticText(error.code).slice(0, 160),
    message: redactDiagnosticText(message),
    logTail: Array.isArray(error?.logs)
      ? error.logs.slice(-8).map((line) => redactDiagnosticText(line))
      : []
  };
}

function reasonFromError(error) {
  const text = errorText(error);
  const markers = [
    'PythNotionalExceeded',
    'AllowanceActionMismatch',
    'AllowanceAlreadyUsed',
    'InvalidOrcaProgram',
    'PythMessageInvalid',
    'AmountOutBelowMinimum',
    'OrcaSwapFailed',
    'StaleNonce',
    'MandateNotActive',
    'TradeActionExpired'
  ];
  return markers.find((marker) => text.includes(marker)) ?? 'WORLD_FAIR_EXECUTION_REFUSED';
}

export function classifyWorldFairRunFailure(
  error,
  { phase = 'RUN_UNKNOWN', phaseKind = 'READ' } = {}
) {
  const text = errorText(error);

  let failureClass = 'UNKNOWN_RUNTIME';
  let reasonCode = 'WORLD_FAIR_RUNTIME_FAILURE';
  let message =
    'The live sequence stopped before CRESCO could prove a complete outcome.';

  if (
    isTransientSolanaRpcError(error) ||
    text.includes('Unable to fetch TokenAccountInfo for vault')
  ) {
    failureClass = 'TRANSIENT_RPC';
    reasonCode = 'SOLANA_RPC_TRANSIENT';
    message =
      'Solana Devnet RPC was temporarily rate-limited or unavailable.';
  } else if (
    isBlockhashExpiryError(error) ||
    text.includes('SOLANA_CONFIRMATION_TIMEOUT') ||
    text.includes('WORLD_FAIR_POST_WRITE_READ_NOT_OBSERVED')
  ) {
    failureClass = 'UNKNOWN_CONFIRMATION';
    if (text.includes('WORLD_FAIR_POST_WRITE_READ_NOT_OBSERVED')) {
      reasonCode = 'SOLANA_POST_WRITE_READ_NOT_OBSERVED';
      message =
        'A confirmed Solana write was not yet visible through CRESCO’s read-side state reconciliation.';
    } else {
      reasonCode = 'SOLANA_CONFIRMATION_UNCERTAIN';
      message =
        'A submitted Solana transaction did not reach a confirmed state before CRESCO could prove its outcome.';
    }
  } else if (
    text.includes('WORLD_FAIR_PYTH_UNAVAILABLE') ||
    text.includes('WORLD_FAIR_PYTH_PAYLOAD_INVALID') ||
    text.includes('WORLD_FAIR_PYTH_PRICE_INVALID') ||
    text.includes('WORLD_FAIR_PYTH_STORAGE_UNAVAILABLE')
  ) {
    failureClass = 'DEPENDENCY_FAILURE';
    reasonCode = 'PYTH_EVIDENCE_UNAVAILABLE';
    message =
      'Required Pyth market evidence was unavailable or invalid.';
  } else if (
    text.includes('WORLD_FAIR_ROLLBACK_INVARIANT_FAILED') ||
    text.includes('WORLD_FAIR_LAB_') ||
    text.includes('WORLD_FAIR_ORCA_POOL_PAIR_MISMATCH')
  ) {
    failureClass = 'INVARIANT_FAILURE';
    reasonCode = 'WORLD_FAIR_INVARIANT_FAILURE';
    message =
      'CRESCO detected a runtime invariant mismatch and stopped fail-closed.';
  } else if (
    text.includes('WORLD_FAIR_UNEXPECTED_REFUSAL') ||
    [
      'PythNotionalExceeded',
      'AllowanceActionMismatch',
      'AllowanceAlreadyUsed',
      'InvalidOrcaProgram',
      'PythMessageInvalid',
      'AmountOutBelowMinimum',
      'OrcaSwapFailed',
      'StaleNonce',
      'MandateNotActive',
      'TradeActionExpired'
    ].some((marker) => text.includes(marker))
  ) {
    failureClass = 'SEMANTIC_REFUSAL';
    reasonCode = 'WORLD_FAIR_UNEXPECTED_SEMANTIC_REFUSAL';
    message =
      'An on-chain policy refusal occurred outside the expected canonical branch.';
  }

  if (
    failureClass === 'UNKNOWN_RUNTIME' &&
    phase.startsWith('ORCA_CONTEXT') &&
    phaseKind === 'READ'
  ) {
    failureClass = 'DEPENDENCY_FAILURE';
    reasonCode = 'ORCA_CONTEXT_READ_UNAVAILABLE';
    message =
      'CRESCO could not reliably read the required Orca/Pyth context from Solana Devnet.';
  }

  if (
    failureClass === 'UNKNOWN_RUNTIME' &&
    phase.endsWith('_QUOTE') &&
    phaseKind === 'READ'
  ) {
    failureClass = 'DEPENDENCY_FAILURE';
    reasonCode = 'ORCA_QUOTE_READ_UNAVAILABLE';
    message =
      'CRESCO could not obtain a fresh Orca quote from the current Devnet pool state.';
  }

  const retryPolicy =
    failureClass === 'TRANSIENT_RPC' && phaseKind === 'READ'
      ? 'SAFE_RETRY_READ'
      : failureClass === 'TRANSIENT_RPC' ||
          failureClass === 'UNKNOWN_CONFIRMATION' ||
          reasonCode === 'ORCA_CONTEXT_READ_UNAVAILABLE' ||
          reasonCode === 'ORCA_QUOTE_READ_UNAVAILABLE'
        ? 'REQUIRES_STATE_RECONCILIATION'
        : 'NOT_AUTOMATICALLY_RETRYABLE';

  return {
    phase,
    phaseKind,
    failureClass,
    reasonCode,
    retryPolicy,
    message
  };
}

function createWorldFairRunFailure({
  error,
  phase,
  phaseKind,
  receipt
}) {
  const diagnostic = classifyWorldFairRunFailure(error, {
    phase,
    phaseKind
  });
  const underlyingError = summarizeWorldFairUnderlyingError(error);

  const partialReceipt = receipt
    ? {
        ...receipt,
        status: 'UNKNOWN',
        productState: 'WORLD_FAIR_OPERATOR_LAB_PARTIAL',
        progress: {
          ...receipt.progress,
          currentPhase: phase,
          failure: diagnostic,
          underlyingError
        }
      }
    : null;

  const wrapped = new Error(diagnostic.message);
  wrapped.name = 'WorldFairRunError';
  wrapped.code = 'WORLD_FAIR_LIVE_RUN_UNCONFIRMED';
  wrapped.worldFairDiagnostic = diagnostic;
  wrapped.worldFairPartialReceipt = partialReceipt;
  wrapped.worldFairUnderlyingError = underlyingError;
  wrapped.cause = error;
  return wrapped;
}

async function expectRefusal(fn, markers) {
  try {
    await fn();
  } catch (error) {
    const text = errorText(error);
    const matched = markers.find((marker) => text.includes(marker));
    if (!matched) {
      throw new Error(`WORLD_FAIR_UNEXPECTED_REFUSAL:${text.slice(0, 1800)}`);
    }
    return {
      reason: reasonFromError(error),
      marker: matched
    };
  }
  throw new Error('WORLD_FAIR_EXPECTED_REFUSAL_EXECUTED');
}

async function sendInstructions({
  rpc,
  feePayer,
  signers,
  instructions
}) {
  const latest = await rpc.getLatestBlockhash('confirmed');
  const tx = new Transaction({
    feePayer: feePayer.publicKey,
    recentBlockhash: latest.blockhash
  });
  for (const ix of instructions) tx.add(ix);
  tx.sign(...signers);

  const signature = await rpc.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 3
  });
  await confirmSignatureOverRpc({
    rpc,
    signature,
    lastValidBlockHeight: latest.lastValidBlockHeight
  });
  return signature;
}

function ix(name, keys, parts = []) {
  return new TransactionInstruction({
    programId: WORLD_FAIR_PROGRAM_ID,
    keys,
    data: Buffer.concat([discriminator(name), ...parts])
  });
}

function semanticSwapHash({
  mandate,
  inputAmount,
  minOutputAmount,
  sqrtPriceLimit,
  deadline,
  mandateNonce
}) {
  return createHash('sha256')
    .update(
      Buffer.concat([
        Buffer.from('CRESCO_SWAP_V0'),
        mandate.toBuffer(),
        ORCA_WHIRLPOOL_PROGRAM_ID.toBuffer(),
        WORLD_FAIR_ORCA_POOL.toBuffer(),
        WORLD_FAIR_DEV_USDC.toBuffer(),
        WORLD_FAIR_DEV_USDT.toBuffer(),
        u64le(inputAmount),
        u64le(minOutputAmount),
        u128le(sqrtPriceLimit),
        i64le(deadline),
        u64le(mandateNonce),
        Buffer.from([1]),
        Buffer.from([1])
      ])
    )
    .digest();
}

export function worldFairPolicyDiff({
  requestedNotionalMicroUsd,
  standingMaxNotionalMicroUsd = STANDING_MAX_NOTIONAL_MICRO_USD
}) {
  const violated =
    Number(requestedNotionalMicroUsd) > Number(standingMaxNotionalMicroUsd);
  return {
    supportedProgram: 'PASS',
    supportedPool: 'PASS',
    supportedPair: 'PASS',
    marketEvidence: 'PASS',
    perActionNotional: violated ? 'VIOLATED' : 'PASS',
    violatedDimensions: violated ? ['MAX_ACTION_NOTIONAL'] : []
  };
}

function publicKeyMeta(pubkey, isSigner = false, isWritable = false) {
  return { pubkey, isSigner, isWritable };
}

export function createWorldFairOrcaProvider({
  rpcUrl = 'https://api.devnet.solana.com',
  guardian,
  pythApiKey,
  connection = null,
  now = () => new Date().toISOString(),
  delegate: delegateOverride = null,
  policy: policyInput = null,
  strictLabState = true,
  vaultTargetBaseUnits = VAULT_TARGET_BASE_UNITS,
  // When set, this public key (the principal's own wallet) is the on-chain
  // guardian: every guardian instruction is prepared here and signed by that
  // wallet. The server keypair then only pays fees for executions and funds
  // the workspace on Devnet; it holds no authority over the mandate.
  guardianAuthority = null
}) {
  if (!guardian?.publicKey) throw new Error('WORLD_FAIR_GUARDIAN_REQUIRED');
  const walletGuardian = Boolean(guardianAuthority);
  const guardianPk = walletGuardian ? new PublicKey(String(guardianAuthority)) : guardian.publicKey;
  const policy = normalizeWorldFairPolicy(policyInput ?? WORLD_FAIR_LAB_POLICY);
  if (!pythApiKey) throw new Error('PYTH_API_KEY_REQUIRED');

  const rpc = connection ?? new Connection(rpcUrl, 'confirmed');
  // Safe reads own their retry policy explicitly. Avoid stacking web3.js's
  // built-in HTTP 429 retry delays underneath CRESCO's bounded read backoff.
  // Injected test connections remain shared so existing deterministic fakes
  // continue to exercise both paths.
  const readRpc =
    connection ?? new Connection(rpcUrl, WORLD_FAIR_READ_CONNECTION_CONFIG);
  const delegate = delegateOverride ?? deriveWorldFairDelegate(guardian);
  const wallet = {
    publicKey: guardian.publicKey,
    async signTransaction(transaction) {
      if (typeof transaction.partialSign === 'function') {
        transaction.partialSign(guardian);
      } else {
        transaction.sign([guardian]);
      }
      return transaction;
    },
    async signAllTransactions(transactions) {
      return Promise.all(transactions.map((transaction) => this.signTransaction(transaction)));
    }
  };
  const defaultOrcaContext = WhirlpoolContext.from(readRpc, wallet);
  const orcaFetcher = buildWorldFairOrcaReadFetcher(
    defaultOrcaContext.fetcher
  );
  const orcaContext = WhirlpoolContext.from(
    readRpc,
    wallet,
    orcaFetcher
  );
  const orcaClient = buildWhirlpoolClient(orcaContext);

  const [charter] = PublicKey.findProgramAddressSync(
    [Buffer.from('charter'), delegate.publicKey.toBuffer()],
    WORLD_FAIR_PROGRAM_ID
  );
  const [mandate] = PublicKey.findProgramAddressSync(
    [Buffer.from('mandate'), charter.toBuffer()],
    WORLD_FAIR_PROGRAM_ID
  );
  const [assetRule] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('asset-rule'),
      mandate.toBuffer(),
      WORLD_FAIR_DEV_USDC.toBuffer()
    ],
    WORLD_FAIR_PROGRAM_ID
  );
  const [legacyVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), mandate.toBuffer(), WORLD_FAIR_DEV_USDC.toBuffer()],
    WORLD_FAIR_PROGRAM_ID
  );
  const [inputTradeVault] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('trade-vault'),
      mandate.toBuffer(),
      WORLD_FAIR_DEV_USDC.toBuffer()
    ],
    WORLD_FAIR_PROGRAM_ID
  );
  const [outputTradeVault] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('trade-vault'),
      mandate.toBuffer(),
      WORLD_FAIR_DEV_USDT.toBuffer()
    ],
    WORLD_FAIR_PROGRAM_ID
  );

  // Server-held guardian: sign and send. Principal-wallet guardian: build the
  // exact transaction, partially sign with any server signer it needs (the
  // workspace delegate for initialize_charter) and hand it to the wallet.
  async function sendGuardian({ label, instructions, extraSigners = [], context = null }) {
    if (!walletGuardian) {
      return sendInstructions({ rpc, feePayer: guardian, signers: [guardian, ...extraSigners], instructions });
    }
    const latest = await rpc.getLatestBlockhash('confirmed');
    const tx = new Transaction({ feePayer: guardianPk, recentBlockhash: latest.blockhash });
    for (const instruction of instructions) tx.add(instruction);
    // Wallets (Phantom) may rewrite a transaction that nobody else has signed
    // yet (priority fee, guard instructions), which changes the message and
    // makes the server refuse it. A transaction that already carries another
    // signature cannot be rewritten without breaking it, so when no server
    // signer is otherwise needed the lab key co-signs a memo. That memo grants
    // nothing: the program still requires the wallet as guardian.
    const coSigners = extraSigners.length ? extraSigners : [guardian];
    if (!extraSigners.length) {
      tx.add(new TransactionInstruction({
        programId: WORLD_FAIR_MEMO_PROGRAM_ID,
        keys: [{ pubkey: guardian.publicKey, isSigner: true, isWritable: false }],
        data: Buffer.from(`CRESCO wallet-guardian ${label}`, 'utf8')
      }));
    }
    tx.partialSign(...coSigners);
    throw new WorldFairGuardianSignatureRequired({
      label,
      guardian: guardianPk.toBase58(),
      transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
      message: tx.serializeMessage().toString('base64'),
      lastValidBlockHeight: latest.lastValidBlockHeight,
      context
    });
  }

  // Submit a transaction the principal's wallet signed. It must be byte-for-byte
  // the message this server prepared, fully signed, with the wallet's signature.
  async function submitGuardianTransaction({ signedTransaction, expectedMessage, lastValidBlockHeight = null }) {
    if (!walletGuardian) throw new Error('WORLD_FAIR_NOT_A_WALLET_GUARDIAN_WORKSPACE');
    const tx = Transaction.from(Buffer.from(String(signedTransaction), 'base64'));
    if (tx.serializeMessage().toString('base64') !== String(expectedMessage)) {
      throw new Error('WORLD_FAIR_GUARDIAN_TRANSACTION_ALTERED');
    }
    const walletSig = tx.signatures.find((entry) => entry.publicKey.equals(guardianPk));
    if (!walletSig?.signature || !tx.verifySignatures()) {
      throw new Error('WORLD_FAIR_GUARDIAN_SIGNATURE_INVALID');
    }
    // The fee payer (the wallet) signature is the transaction id, known before send.
    const signature = base58Encode(tx.signatures[0].signature);
    try {
      await rpc.sendRawTransaction(tx.serialize(), { skipPreflight: false, maxRetries: 3 });
      const blockHeight = lastValidBlockHeight ?? (await rpc.getLatestBlockhash('confirmed')).lastValidBlockHeight;
      await confirmSignatureOverRpc({ rpc, signature, lastValidBlockHeight: blockHeight });
    } catch (error) {
      const refusal = classifyWorldFairProgramRefusal(error);
      if (refusal) return { status: 'REFUSED', code: refusal.code, boundary: refusal.boundary, signature };
      throw Object.assign(error, { worldFairGuardianSignature: signature });
    }
    return { status: 'CONFIRMED', signature };
  }

  // Principal-wallet bootstrap: everything the guardian must sign, in ONE
  // transaction. The nonce sequence is deterministic: initialize_mandate sets
  // 0, transition_mandate(0) -> 1, initialize_asset_rule(1) -> 2,
  // configure_mandate_policy(2) -> 3. Pieces that already exist are skipped.
  function walletBootstrapInstructions(state) {
    const out = [];
    let nonce = state.mandate ? Number(state.mandate.nonce) : 0;
    let stage = state.mandate ? state.mandate.stage : 2;
    const signers = [];
    if (!state.charter) {
      signers.push(delegate);
      out.push(ix('initialize_charter', [
        publicKeyMeta(charter, false, true),
        publicKeyMeta(guardianPk, true, true),
        publicKeyMeta(delegate.publicKey, true, false),
        publicKeyMeta(SystemProgram.programId)
      ], [hashBytes('CRESCO-WORLDS-FAIR-OPERATOR-LAB'), u64le(10_000_000), u64le(10_000_000)]));
    }
    if (!state.mandate) {
      out.push(ix('initialize_mandate', [
        publicKeyMeta(charter),
        publicKeyMeta(mandate, false, true),
        publicKeyMeta(guardianPk, true, true),
        publicKeyMeta(SystemProgram.programId)
      ]));
    }
    if (stage === 2) {
      const [reviewReceipt] = PublicKey.findProgramAddressSync(
        [Buffer.from('review'), mandate.toBuffer(), u64le(nonce)],
        WORLD_FAIR_PROGRAM_ID
      );
      out.push(ix('record_review', [
        publicKeyMeta(charter),
        publicKeyMeta(mandate),
        publicKeyMeta(reviewReceipt, false, true),
        publicKeyMeta(guardianPk, true, true),
        publicKeyMeta(SystemProgram.programId)
      ], [hashBytes('CRESCO-WF-OPERATOR-LAB-BOUNDED'), Buffer.from([1])]));
      out.push(ix('transition_mandate', [
        publicKeyMeta(charter),
        publicKeyMeta(mandate, false, true),
        publicKeyMeta(reviewReceipt),
        publicKeyMeta(guardianPk, true, false)
      ], [Buffer.from([3]), u64le(nonce)]));
      nonce += 1;
      stage = 3;
    }
    if (!state.assetRule) {
      out.push(ix('initialize_asset_rule', [
        publicKeyMeta(charter),
        publicKeyMeta(mandate, false, true),
        publicKeyMeta(assetRule, false, true),
        publicKeyMeta(legacyVault, false, true),
        publicKeyMeta(WORLD_FAIR_DEV_USDC),
        publicKeyMeta(guardianPk, true, true),
        publicKeyMeta(TOKEN_PROGRAM_ID),
        publicKeyMeta(SystemProgram.programId)
      ], [
        u64le(nonce),
        Buffer.from([ACTION_SWAP_EXACT_IN]),
        u64le(policy.maxActionAmount),
        u64le(policy.maxPeriodAmount),
        i64le(policy.periodSeconds),
        u64le(policy.maxUnitPriceMicroUsd),
        u32le(WORLD_FAIR_PYTH_FEED.feedId)
      ]));
      nonce += 1;
    }
    for (const [exists, mint, vault] of [[state.inputVaultExists, WORLD_FAIR_DEV_USDC, inputTradeVault], [state.outputVaultExists, WORLD_FAIR_DEV_USDT, outputTradeVault]]) {
      if (exists) continue;
      out.push(ix('initialize_trade_vault', [
        publicKeyMeta(charter),
        publicKeyMeta(mandate),
        publicKeyMeta(vault, false, true),
        publicKeyMeta(mint),
        publicKeyMeta(guardianPk, true, true),
        publicKeyMeta(TOKEN_PROGRAM_ID),
        publicKeyMeta(SystemProgram.programId)
      ]));
    }
    const pristine = !state.mandate || (state.mandate.maxActionNotionalMicroUsd === 0 && state.mandate.maxPeriodNotionalMicroUsd === 0);
    if (pristine) {
      out.push(ix('configure_mandate_policy', [
        publicKeyMeta(charter),
        publicKeyMeta(mandate, false, true),
        publicKeyMeta(guardianPk, true, false)
      ], [
        u64le(nonce),
        u64le(policy.maxActionNotionalMicroUsd),
        u64le(policy.maxPeriodNotionalMicroUsd),
        i64le(policy.expiresAt),
        u32le(policy.maxMarketAgeSeconds),
        u32le(policy.maxConfidenceBps)
      ]));
    }
    return { instructions: out, signers };
  }

  async function loadState() {
    const [
      charterInfo,
      mandateInfo,
      ruleInfo,
      inputVaultInfo,
      outputVaultInfo
    ] = await withTransientRpcReadRetry(
      () =>
        readRpc.getMultipleAccountsInfo(
          [
            charter,
            mandate,
            assetRule,
            inputTradeVault,
            outputTradeVault
          ],
          'confirmed'
        ),
      WORLD_FAIR_STATE_READ_RETRY_PROFILE
    );

    return {
      charter: charterInfo ? parseCharter(Buffer.from(charterInfo.data)) : null,
      mandate: mandateInfo ? parseMandate(Buffer.from(mandateInfo.data)) : null,
      assetRule: ruleInfo ? parseAssetRule(Buffer.from(ruleInfo.data)) : null,
      inputVaultExists: Boolean(inputVaultInfo),
      outputVaultExists: Boolean(outputVaultInfo)
    };
  }

  function validateExistingState(state) {
    if (state.charter) {
      if (!state.charter.guardian.equals(guardianPk)) {
        throw new Error('WORLD_FAIR_LAB_GUARDIAN_MISMATCH');
      }
      if (!state.charter.beneficiary.equals(delegate.publicKey)) {
        throw new Error('WORLD_FAIR_LAB_DELEGATE_MISMATCH');
      }
    }

    if (state.mandate) {
      if (!state.mandate.charter.equals(charter)) {
        throw new Error('WORLD_FAIR_LAB_MANDATE_CHARTER_MISMATCH');
      }
      if (!strictLabState) {
        // Workspace mandates are owned by their principal: status and policy
        // evolve through the workflow, so on-chain values are the truth.
        if (state.mandate.stage !== 2 && state.mandate.stage !== 3) {
          throw new Error('WORLD_FAIR_LAB_STAGE_INCOMPATIBLE');
        }
        return;
      }
      if (state.mandate.status !== 0) {
        throw new Error('WORLD_FAIR_LAB_MANDATE_NOT_ACTIVE');
      }
      if (state.mandate.stage !== 2 && state.mandate.stage !== 3) {
        throw new Error('WORLD_FAIR_LAB_STAGE_INCOMPATIBLE');
      }
    }

    if (state.assetRule) {
      const rule = state.assetRule;
      const compatible =
        rule.mandate.equals(mandate) &&
        rule.mint.equals(WORLD_FAIR_DEV_USDC) &&
        (rule.actionMask & ACTION_SWAP_EXACT_IN) !== 0 &&
        rule.enabled &&
        rule.maxActionAmount === policy.maxActionAmount &&
        rule.maxPeriodAmount === policy.maxPeriodAmount &&
        rule.periodSeconds === policy.periodSeconds &&
        rule.maxUnitPriceMicroUsd === policy.maxUnitPriceMicroUsd &&
        rule.pythFeedId === WORLD_FAIR_PYTH_FEED.feedId;
      if (!compatible) {
        throw new Error('WORLD_FAIR_LAB_ASSET_RULE_INCOMPATIBLE');
      }
    }
  }

  async function initializeCharter() {
    return sendGuardian({
      label: 'initialize_charter',
      extraSigners: [delegate],
      instructions: [
        ix(
          'initialize_charter',
          [
            publicKeyMeta(charter, false, true),
            publicKeyMeta(guardianPk, true, true),
            publicKeyMeta(delegate.publicKey, true, false),
            publicKeyMeta(SystemProgram.programId)
          ],
          [
            hashBytes('CRESCO-WORLDS-FAIR-OPERATOR-LAB'),
            u64le(10_000_000),
            u64le(10_000_000)
          ]
        )
      ]
    });
  }

  async function initializeMandate() {
    return sendGuardian({
      label: 'initialize_mandate',
      instructions: [
        ix('initialize_mandate', [
          publicKeyMeta(charter),
          publicKeyMeta(mandate, false, true),
          publicKeyMeta(guardianPk, true, true),
          publicKeyMeta(SystemProgram.programId)
        ])
      ]
    });
  }

  async function transitionToBounded(currentNonce) {
    const [reviewReceipt] = PublicKey.findProgramAddressSync(
      [Buffer.from('review'), mandate.toBuffer(), u64le(currentNonce)],
      WORLD_FAIR_PROGRAM_ID
    );

    const reviewInfo = await withTransientRpcReadRetry(
      () => readRpc.getAccountInfo(reviewReceipt, 'confirmed'),
      WORLD_FAIR_STATE_READ_RETRY_PROFILE
    );
    let reviewSignature = null;
    if (!reviewInfo) {
      reviewSignature = await sendGuardian({
        label: 'record_review',
        instructions: [
          ix(
            'record_review',
            [
              publicKeyMeta(charter),
              publicKeyMeta(mandate),
              publicKeyMeta(reviewReceipt, false, true),
              publicKeyMeta(guardianPk, true, true),
              publicKeyMeta(SystemProgram.programId)
            ],
            [hashBytes('CRESCO-WF-OPERATOR-LAB-BOUNDED'), Buffer.from([1])]
          )
        ]
      });
    }

    const transitionSignature = await sendGuardian({
      label: 'transition_mandate',
      instructions: [
        ix(
          'transition_mandate',
          [
            publicKeyMeta(charter),
            publicKeyMeta(mandate, false, true),
            publicKeyMeta(reviewReceipt),
            publicKeyMeta(guardianPk, true, false)
          ],
          [Buffer.from([3]), u64le(currentNonce)]
        )
      ]
    });

    return { reviewSignature, transitionSignature };
  }

  async function initializeRule(expectedNonce) {
    return sendGuardian({
      label: 'initialize_asset_rule',
      instructions: [
        ix(
          'initialize_asset_rule',
          [
            publicKeyMeta(charter),
            publicKeyMeta(mandate, false, true),
            publicKeyMeta(assetRule, false, true),
            publicKeyMeta(legacyVault, false, true),
            publicKeyMeta(WORLD_FAIR_DEV_USDC),
            publicKeyMeta(guardianPk, true, true),
            publicKeyMeta(TOKEN_PROGRAM_ID),
            publicKeyMeta(SystemProgram.programId)
          ],
          [
            u64le(expectedNonce),
            Buffer.from([ACTION_SWAP_EXACT_IN]),
            u64le(policy.maxActionAmount),
            u64le(policy.maxPeriodAmount),
            i64le(policy.periodSeconds),
            u64le(policy.maxUnitPriceMicroUsd),
            u32le(WORLD_FAIR_PYTH_FEED.feedId)
          ]
        )
      ]
    });
  }

  async function initializeTradeVault(mint, vault) {
    return sendGuardian({
      label: 'initialize_trade_vault',
      instructions: [
        ix('initialize_trade_vault', [
          publicKeyMeta(charter),
          publicKeyMeta(mandate),
          publicKeyMeta(vault, false, true),
          publicKeyMeta(mint),
          publicKeyMeta(guardianPk, true, true),
          publicKeyMeta(TOKEN_PROGRAM_ID),
          publicKeyMeta(SystemProgram.programId)
        ])
      ]
    });
  }

  async function configurePolicy(expectedNonce, values = policy) {
    return sendGuardian({
      label: 'configure_mandate_policy',
      instructions: [
        ix(
          'configure_mandate_policy',
          [
            publicKeyMeta(charter),
            publicKeyMeta(mandate, false, true),
            publicKeyMeta(guardianPk, true, false)
          ],
          [
            u64le(expectedNonce),
            u64le(values.maxActionNotionalMicroUsd),
            u64le(values.maxPeriodNotionalMicroUsd),
            i64le(values.expiresAt),
            u32le(values.maxMarketAgeSeconds),
            u32le(values.maxConfidenceBps)
          ]
        )
      ]
    });
  }

  async function ensureDelegateFunding() {
    const balance = await withTransientRpcReadRetry(
      () => readRpc.getBalance(delegate.publicKey, 'confirmed'),
      WORLD_FAIR_STATE_READ_RETRY_PROFILE
    );
    if (balance >= DELEGATE_MIN_LAMPORTS) return null;

    return sendInstructions({
      rpc,
      feePayer: guardian,
      signers: [guardian],
      instructions: [
        SystemProgram.transfer({
          fromPubkey: guardian.publicKey,
          toPubkey: delegate.publicKey,
          lamports: DELEGATE_TOPUP_LAMPORTS
        })
      ]
    });
  }

  async function readTokenAccount(address) {
    return withTransientRpcReadRetry(
      () => getAccount(readRpc, address, 'confirmed', TOKEN_PROGRAM_ID),
      WORLD_FAIR_STATE_READ_RETRY_PROFILE
    );
  }

  async function ensureInputVaultFunding(minimumBaseUnits = 0) {
    const target = Math.max(vaultTargetBaseUnits, Number(minimumBaseUnits) || 0);
    const vault = await readTokenAccount(inputTradeVault);
    if (Number(vault.amount) >= target) return null;

    const guardianUsdc = await getOrCreateAssociatedTokenAccount(
      rpc,
      guardian,
      WORLD_FAIR_DEV_USDC,
      guardian.publicKey
    );
    let guardianUsdcState = await readTokenAccount(guardianUsdc.address);

    const required =
      target - Number(vault.amount);

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const availableUsdc = Number(guardianUsdcState.amount);
      const remaining = required - availableUsdc;
      if (remaining <= 0) break;

      const guardianLamports = await withTransientRpcReadRetry(
        () => readRpc.getBalance(guardian.publicKey, 'confirmed'),
        WORLD_FAIR_STATE_READ_RETRY_PROFILE
      );
      const spendableLamports =
        guardianLamports - FUNDING_SOL_RESERVE_LAMPORTS;

      if (spendableLamports <= 0) {
        throw new Error('WORLD_FAIR_LAB_SOL_FUNDING_UNAVAILABLE');
      }

      const solUsdcPool = await withTransientRpcReadRetry(
        () => orcaClient.getPool(ORCA_SOL_USDC_POOL, IGNORE_CACHE),
        WORLD_FAIR_ORCA_READ_RETRY_PROFILE
      );

      const quoteFundingInput = (inputLamports) =>
        withTransientRpcReadRetry(
          () =>
            swapQuoteByInputToken(
              solUsdcPool,
              NATIVE_MINT,
              new BN(inputLamports),
              Percentage.fromFraction(1, 100),
              ORCA_WHIRLPOOL_PROGRAM_ID,
              orcaContext.fetcher,
              IGNORE_CACHE
            ),
          WORLD_FAIR_ORCA_READ_RETRY_PROFILE
        );

      const probeInputLamports = Math.min(
        FUNDING_SOL_PROBE_LAMPORTS,
        spendableLamports
      );
      if (probeInputLamports <= 0) {
        throw new Error('WORLD_FAIR_LAB_SOL_FUNDING_UNAVAILABLE');
      }

      const probeQuote = await quoteFundingInput(probeInputLamports);
      const probeMinimumOutput = Number(
        probeQuote.otherAmountThreshold.toString()
      );
      const sizedInputLamports = sizeWorldFairFundingLamports({
        requiredBaseUnits: remaining,
        probeInputLamports,
        probeMinimumOutputBaseUnits: probeMinimumOutput,
        spendableLamports
      });

      let quote =
        sizedInputLamports === probeInputLamports
          ? probeQuote
          : await quoteFundingInput(sizedInputLamports);

      if (Number(quote.otherAmountThreshold.toString()) < remaining) {
        if (sizedInputLamports >= spendableLamports) {
          throw new Error('WORLD_FAIR_LAB_DEV_USDC_FUNDING_UNAVAILABLE');
        }
        quote = await quoteFundingInput(spendableLamports);
      }

      if (Number(quote.otherAmountThreshold.toString()) < remaining) {
        throw new Error('WORLD_FAIR_LAB_DEV_USDC_FUNDING_UNAVAILABLE');
      }

      const fundingTx = await solUsdcPool.swap(quote);

      try {
        await executeTransactionBuilderOverRpc({
          rpc,
          builder: fundingTx,
          payerSigner: guardian,
          timeoutMs: 60_000
        });
      } catch (error) {
        guardianUsdcState = await readTokenAccount(guardianUsdc.address);

        if (Number(guardianUsdcState.amount) >= required) break;
        if (!isBlockhashExpiryError(error) || attempt === 2) throw error;
        continue;
      }

      guardianUsdcState = await readTokenAccount(guardianUsdc.address);
    }

    if (Number(guardianUsdcState.amount) < required) {
      throw new Error('WORLD_FAIR_LAB_DEV_USDC_FUNDING_UNAVAILABLE');
    }

    return sendInstructions({
      rpc,
      feePayer: guardian,
      signers: [guardian],
      instructions: [
        createTransferInstruction(
          guardianUsdc.address,
          inputTradeVault,
          guardian.publicKey,
          required,
          [],
          TOKEN_PROGRAM_ID
        )
      ]
    });
  }

  async function ensureReady() {
    let state = await loadState();
    validateExistingState(state);
    const bootstrap = {};

    if (walletGuardian) {
      const plan = walletBootstrapInstructions(state);
      if (plan.instructions.length) {
        await sendGuardian({ label: 'bootstrap_mandate', instructions: plan.instructions, extraSigners: plan.signers });
      }
      bootstrap.delegateFunding = await ensureDelegateFunding();
      bootstrap.inputVaultFunding = await ensureInputVaultFunding();
      return { state: await loadState(), bootstrap };
    }

    if (!state.charter) {
      bootstrap.initializeCharter = await initializeCharter();
      state = await loadState();
    }

    if (!state.mandate) {
      bootstrap.initializeMandate = await initializeMandate();
      state = await loadState();
    }

    validateExistingState(state);

    if (state.mandate.stage === 2) {
      bootstrap.transition = await transitionToBounded(state.mandate.nonce);
      state = await loadState();
    }

    if (!state.assetRule) {
      bootstrap.initializeAssetRule = await initializeRule(state.mandate.nonce);
      state = await loadState();
    }

    if (!state.inputVaultExists) {
      bootstrap.initializeInputTradeVault = await initializeTradeVault(
        WORLD_FAIR_DEV_USDC,
        inputTradeVault
      );
      state = await loadState();
    }

    if (!state.outputVaultExists) {
      bootstrap.initializeOutputTradeVault = await initializeTradeVault(
        WORLD_FAIR_DEV_USDT,
        outputTradeVault
      );
      state = await loadState();
    }

    validateExistingState(state);

    const pristine =
      state.mandate.maxActionNotionalMicroUsd === 0 &&
      state.mandate.maxPeriodNotionalMicroUsd === 0;
    const policyMatches = strictLabState
      ? state.mandate.maxActionNotionalMicroUsd ===
          policy.maxActionNotionalMicroUsd &&
        state.mandate.maxPeriodNotionalMicroUsd ===
          policy.maxPeriodNotionalMicroUsd &&
        state.mandate.maxMarketAgeSeconds === policy.maxMarketAgeSeconds &&
        state.mandate.maxConfidenceBps === policy.maxConfidenceBps
      : !pristine;

    if (!policyMatches) {
      const pristinePolicy =
        state.mandate.maxActionNotionalMicroUsd === 0 &&
        state.mandate.maxPeriodNotionalMicroUsd === 0;
      if (!pristinePolicy) {
        throw new Error('WORLD_FAIR_LAB_POLICY_INCOMPATIBLE');
      }
      bootstrap.configurePolicy = await configurePolicy(state.mandate.nonce);
      state = await loadState();
    }

    bootstrap.delegateFunding = await ensureDelegateFunding();
    bootstrap.inputVaultFunding = await ensureInputVaultFunding();

    return { state: await loadState(), bootstrap };
  }

  async function livePyth() {
    const snapshot = await withTransientPythEvidenceRetry(
      () =>
        fetchPythProSolanaPayload({
          apiKey: pythApiKey,
          feed: WORLD_FAIR_PYTH_FEED,
          channel: WORLD_FAIR_PYTH_FEED.minChannel,
          maxAgeSeconds: 120,
          maxConfidenceBps: 100
        }),
      WORLD_FAIR_PYTH_READ_RETRY_PROFILE
    );

    if (
      snapshot.status !== 'FRESH' ||
      snapshot.solanaPayload?.status !== 'AVAILABLE'
    ) {
      throw new Error(
        `WORLD_FAIR_PYTH_UNAVAILABLE:${snapshot.reasonCode ?? snapshot.status}`
      );
    }

    const encoding =
      snapshot.solanaPayload.encoding === 'base64' ? 'base64' : 'hex';
    const message = Buffer.from(snapshot.solanaPayload.data, encoding);
    if (message.length <= 100) {
      throw new Error('WORLD_FAIR_PYTH_PAYLOAD_INVALID');
    }
    // Same truncation as the program's price_to_micro_usd: a rounded price can
    // sit 1 micro-USD/unit above the on-chain value and break exact-notional
    // exception checks on larger amounts.
    const unitPriceMicroUsd = worldFairPythUnitPriceMicroUsd(snapshot);
    if (!Number.isFinite(unitPriceMicroUsd) || unitPriceMicroUsd <= 0) {
      throw new Error('WORLD_FAIR_PYTH_PRICE_INVALID');
    }

    return { snapshot, message, unitPriceMicroUsd };
  }

  async function freshOrcaPoolSnapshot() {
    const pool = await withTransientRpcReadRetry(
      () => orcaClient.getPool(WORLD_FAIR_ORCA_POOL, IGNORE_CACHE),
      WORLD_FAIR_ORCA_READ_RETRY_PROFILE
    );
    const data = pool.getData();

    if (
      !data.tokenMintA.equals(WORLD_FAIR_DEV_USDC) ||
      !data.tokenMintB.equals(WORLD_FAIR_DEV_USDT)
    ) {
      throw new Error('WORLD_FAIR_ORCA_POOL_PAIR_MISMATCH');
    }

    return { pool, data };
  }

  async function orcaContextState() {
    const { pool, data } = await freshOrcaPoolSnapshot();

    const storageInfo = await withTransientRpcReadRetry(
      () =>
        readRpc.getAccountInfo(
          PYTH_LAZER_STORAGE_ID,
          'confirmed'
        ),
      WORLD_FAIR_ORCA_READ_RETRY_PROFILE
    );
    if (!storageInfo || storageInfo.data.length < 72) {
      throw new Error('WORLD_FAIR_PYTH_STORAGE_UNAVAILABLE');
    }

    return {
      pool,
      data,
      pythTreasury: new PublicKey(storageInfo.data.subarray(40, 72))
    };
  }

  async function quoteFor(_pool, inputAmount) {
    // A quote always owns a fresh Orca pool snapshot. This avoids relying on
    // refreshData() after a confirmed swap, which is an unnecessary second
    // read path and was the observed PR #21 failure boundary.
    const { pool } = await freshOrcaPoolSnapshot();

    return withTransientRpcReadRetry(
      () =>
        swapQuoteByInputToken(
          pool,
          WORLD_FAIR_DEV_USDC,
          new BN(inputAmount),
          Percentage.fromFraction(1, 100),
          ORCA_WHIRLPOOL_PROGRAM_ID,
          orcaContext.fetcher,
          IGNORE_CACHE
        ),
      WORLD_FAIR_ORCA_READ_RETRY_PROFILE
    );
  }

  async function waitForAssetRuleSpentAtLeast(expectedSpentThisPeriod) {
    let lastSpentThisPeriod = null;

    for (
      let attempt = 1;
      attempt <= WORLD_FAIR_POST_WRITE_READ_PROFILE.attempts;
      attempt += 1
    ) {
      const state = await loadState();
      lastSpentThisPeriod = state.assetRule?.spentThisPeriod ?? null;

      if (
        Number.isFinite(Number(lastSpentThisPeriod)) &&
        Number(lastSpentThisPeriod) >= Number(expectedSpentThisPeriod)
      ) {
        return state;
      }

      if (attempt === WORLD_FAIR_POST_WRITE_READ_PROFILE.attempts) {
        break;
      }

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          WORLD_FAIR_POST_WRITE_READ_PROFILE.baseDelayMs * attempt
        )
      );
    }

    throw new Error(
      `WORLD_FAIR_POST_WRITE_READ_NOT_OBSERVED expectedSpentThisPeriod=${expectedSpentThisPeriod} observedSpentThisPeriod=${lastSpentThisPeriod}`
    );
  }

  function swapAccounts({
    quote,
    poolData,
    pythTreasury,
    allowance = null,
    orcaProgram = ORCA_WHIRLPOOL_PROGRAM_ID
  }) {
    const keys = [
      publicKeyMeta(charter),
      publicKeyMeta(mandate, false, true),
      publicKeyMeta(assetRule, false, true)
    ];
    if (allowance) keys.push(publicKeyMeta(allowance, false, true));

    keys.push(
      publicKeyMeta(inputTradeVault, false, true),
      publicKeyMeta(outputTradeVault, false, true),
      publicKeyMeta(WORLD_FAIR_DEV_USDC),
      publicKeyMeta(WORLD_FAIR_DEV_USDT),
      publicKeyMeta(delegate.publicKey, true, true),
      publicKeyMeta(orcaProgram),
      publicKeyMeta(WORLD_FAIR_ORCA_POOL, false, true),
      publicKeyMeta(poolData.tokenVaultA, false, true),
      publicKeyMeta(poolData.tokenVaultB, false, true),
      publicKeyMeta(quote.tickArray0, false, true),
      publicKeyMeta(quote.tickArray1, false, true),
      publicKeyMeta(quote.tickArray2, false, true),
      publicKeyMeta(
        PDAUtil.getOracle(ORCA_WHIRLPOOL_PROGRAM_ID, WORLD_FAIR_ORCA_POOL)
          .publicKey
      ),
      publicKeyMeta(PYTH_LAZER_PROGRAM_ID),
      publicKeyMeta(PYTH_LAZER_STORAGE_ID),
      publicKeyMeta(pythTreasury, false, true),
      publicKeyMeta(SYSVAR_INSTRUCTIONS_PUBKEY),
      publicKeyMeta(TOKEN_PROGRAM_ID),
      publicKeyMeta(SystemProgram.programId)
    );

    return keys;
  }

  async function executeStanding({
    inputAmount,
    pyth,
    quote,
    executionNonce,
    poolData,
    pythTreasury,
    orcaProgram = ORCA_WHIRLPOOL_PROGRAM_ID,
    includePythVerification = true
  }) {
    const deadline = Math.floor(Date.now() / 1000) + 300;
    const instructions = [];
    if (includePythVerification) {
      instructions.push(createEd25519Instruction(pyth.message, 1, 12));
    }

    instructions.push(
      ix(
        'execute_swap_within_mandate_with_pyth',
        swapAccounts({
          quote,
          poolData,
          pythTreasury,
          orcaProgram
        }),
        [
          vecBytes(includePythVerification ? pyth.message : Buffer.alloc(0)),
          u64le(inputAmount),
          u64le(quote.otherAmountThreshold.toString()),
          u128le(quote.sqrtPriceLimit.toString()),
          i64le(deadline),
          u64le(executionNonce)
        ]
      )
    );

    return sendInstructions({
      rpc,
      feePayer: guardian,
      signers: [guardian, delegate],
      instructions
    });
  }

  async function grantSwapException({
    inputAmount,
    quote,
    pyth,
    deadline,
    expectedNonce,
    approvalProof = null
  }) {
    const minOutputAmount = BigInt(quote.otherAmountThreshold.toString());
    const sqrtPriceLimit = BigInt(quote.sqrtPriceLimit.toString());
    const requestHash = semanticSwapHash({
      mandate,
      inputAmount,
      minOutputAmount,
      sqrtPriceLimit,
      deadline,
      mandateNonce: expectedNonce
    });
    const exactNotional =
      (BigInt(inputAmount) * BigInt(pyth.unitPriceMicroUsd)) / 1_000_000n;
    const [allowance] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('allowance'),
        mandate.toBuffer(),
        WORLD_FAIR_DEV_USDC.toBuffer(),
        requestHash
      ],
      WORLD_FAIR_PROGRAM_ID
    );

    const signature = await sendGuardian({
      label: 'grant_allowance_once',
      context: { kind: 'GRANT', requestHash: requestHash.toString('hex'), exactNotional: exactNotional.toString(), allowance: allowance.toBase58() },
      instructions: [
        ...worldFairApprovalProofInstructions(approvalProof),
        ix(
          'grant_allowance_once',
          [
            publicKeyMeta(charter),
            publicKeyMeta(mandate),
            publicKeyMeta(WORLD_FAIR_DEV_USDC),
            publicKeyMeta(allowance, false, true),
            publicKeyMeta(guardianPk, true, true),
            publicKeyMeta(SystemProgram.programId)
          ],
          [
            requestHash,
            u64le(expectedNonce),
            u64le(exactNotional),
            i64le(Math.floor(Date.now() / 1000) + 600)
          ]
        )
      ]
    });

    return {
      requestHash,
      exactNotional,
      allowance,
      signature,
      inputAmount,
      quote,
      pyth,
      deadline,
      expectedNonce
    };
  }

  async function executeException({
    exception,
    poolData,
    pythTreasury,
    quote = exception.quote,
    inputAmount = exception.inputAmount,
    expectedNonce = exception.expectedNonce,
    orcaProgram = ORCA_WHIRLPOOL_PROGRAM_ID
  }) {
    const instructions = [
      createEd25519Instruction(exception.pyth.message, 1, 12),
      ix(
        'execute_swap_once_with_pyth',
        swapAccounts({
          quote,
          poolData,
          pythTreasury,
          allowance: exception.allowance,
          orcaProgram
        }),
        [
          vecBytes(exception.pyth.message),
          u64le(inputAmount),
          u64le(quote.otherAmountThreshold.toString()),
          u128le(quote.sqrtPriceLimit.toString()),
          i64le(exception.deadline),
          u64le(expectedNonce),
          exception.requestHash
        ]
      )
    ];

    return sendInstructions({
      rpc,
      feePayer: guardian,
      signers: [guardian, delegate],
      instructions
    });
  }

  async function loadAllowance(address) {
    const info = await withTransientRpcReadRetry(
      () => readRpc.getAccountInfo(address, 'confirmed'),
      WORLD_FAIR_STATE_READ_RETRY_PROFILE
    );
    if (!info) throw new Error('WORLD_FAIR_ALLOWANCE_NOT_FOUND');
    return parseAllowance(Buffer.from(info.data));
  }

  async function getPublicState({ ensure = false } = {}) {
    let bootstrap = null;
    if (ensure) {
      const ready = await ensureReady();
      bootstrap = ready.bootstrap;
    }

    const state = await loadState();
    validateExistingState(state);

    const inputVault = state.inputVaultExists
      ? await readTokenAccount(inputTradeVault)
      : null;
    const outputVault = state.outputVaultExists
      ? await readTokenAccount(outputTradeVault)
      : null;

    return {
      status: state.mandate && state.assetRule ? 'READY' : 'NOT_BOOTSTRAPPED',
      mode: 'WORLD_FAIR_OPERATOR_LAB',
      network: 'solana-devnet',
      programId: WORLD_FAIR_PROGRAM_ID.toBase58(),
      programSha256: WORLD_FAIR_PROGRAM_SHA256,
      guardian: guardian.publicKey.toBase58(),
      delegate: delegate.publicKey.toBase58(),
      accounts: {
        charter: charter.toBase58(),
        mandate: mandate.toBase58(),
        assetRule: assetRule.toBase58(),
        inputTradeVault: inputTradeVault.toBase58(),
        outputTradeVault: outputTradeVault.toBase58()
      },
      mandate: state.mandate
        ? {
            stage: state.mandate.stage,
            status: state.mandate.status === 0 ? 'ACTIVE' : 'NOT_ACTIVE',
            version: state.mandate.version,
            nonce: state.mandate.nonce,
            maxActionNotionalMicroUsd:
              state.mandate.maxActionNotionalMicroUsd,
            maxPeriodNotionalMicroUsd:
              state.mandate.maxPeriodNotionalMicroUsd
          }
        : null,
      assetRule: state.assetRule
        ? {
            enabled: state.assetRule.enabled,
            actionMask: state.assetRule.actionMask,
            maxActionAmount: state.assetRule.maxActionAmount,
            maxPeriodAmount: state.assetRule.maxPeriodAmount,
            spentThisPeriod: state.assetRule.spentThisPeriod,
            spentThisPeriodNotionalMicroUsd:
              state.assetRule.spentThisPeriodNotionalMicroUsd,
            pythFeedId: state.assetRule.pythFeedId
          }
        : null,
      vaults: {
        inputAmountBaseUnits: inputVault ? Number(inputVault.amount) : null,
        outputAmountBaseUnits: outputVault ? Number(outputVault.amount) : null
      },
      orca: {
        programId: ORCA_WHIRLPOOL_PROGRAM_ID.toBase58(),
        pool: WORLD_FAIR_ORCA_POOL.toBase58(),
        inputMint: WORLD_FAIR_DEV_USDC.toBase58(),
        outputMint: WORLD_FAIR_DEV_USDT.toBase58()
      },
      pyth: {
        symbol: WORLD_FAIR_PYTH_FEED.symbol,
        feedId: WORLD_FAIR_PYTH_FEED.feedId,
        authorityEffect: 'NONE'
      },
      bootstrap,
      truthBoundary: {
        mainnet: false,
        serverHeldDevnetActors: true,
        delegateDerivedServerSide: true,
        productionCustody: false,
        auditedProductionSecurity: false,
        institutionalTrading: false,
        customerValidation: false
      }
    };
  }

  async function runCanonicalSequence() {
    const lockKey = `${guardian.publicKey.toBase58()}:${delegate.publicKey.toBase58()}`;
    if (runtimePromises.has(lockKey)) {
      return runtimePromises.get(lockKey);
    }

    let receipt = null;
    let activePhase = {
      code: 'RUN_START',
      kind: 'READ'
    };

    const step = async (code, kind, operation) => {
      activePhase = { code, kind };
      if (receipt) {
        receipt.progress.currentPhase = code;
      }

      const value = await operation();

      if (
        receipt &&
        !receipt.progress.completedPhases.includes(code)
      ) {
        receipt.progress.completedPhases.push(code);
      }

      return value;
    };

    const recordEffect = (label, signature) => {
      if (!receipt || !signature) return;
      receipt.progress.confirmedEffects.push({
        label,
        signature
      });
    };

    const promise = (async () => {
      try {
        const ready = await step(
          'BOOTSTRAP_READY',
          'WRITE',
          () => ensureReady()
        );
        const starting = await step(
          'STATE_LOAD',
          'READ',
          () => loadState()
        );
        const executionNonce = starting.mandate.nonce;
        let {
          pool,
          data: poolData,
          pythTreasury
        } = await step(
          'ORCA_CONTEXT',
          'READ',
          () => orcaContextState()
        );

        receipt = {
          schemaVersion: 2,
          type: 'CRESCO_WORLD_FAIR_OPERATOR_LAB_RECEIPT',
          status: 'IN_PROGRESS',
          observedAt: now(),
          network: 'solana-devnet',
          programId: WORLD_FAIR_PROGRAM_ID.toBase58(),
          programSha256: WORLD_FAIR_PROGRAM_SHA256,
          principal: guardian.publicKey.toBase58(),
          delegate: delegate.publicKey.toBase58(),
          mandate: mandate.toBase58(),
          startingNonce: executionNonce,
          bootstrap: ready.bootstrap,
          orca: {
            programId: ORCA_WHIRLPOOL_PROGRAM_ID.toBase58(),
            pool: WORLD_FAIR_ORCA_POOL.toBase58(),
            inputMint: WORLD_FAIR_DEV_USDC.toBase58(),
            outputMint: WORLD_FAIR_DEV_USDT.toBase58()
          },
          pyth: {
            symbol: WORLD_FAIR_PYTH_FEED.symbol,
            feedId: WORLD_FAIR_PYTH_FEED.feedId,
            authorityEffect: 'NONE'
          },
          scenarios: {},
          progress: {
            currentPhase: 'ORCA_CONTEXT',
            completedPhases: [
              'BOOTSTRAP_READY',
              'STATE_LOAD',
              'ORCA_CONTEXT'
            ],
            confirmedEffects: []
          }
        };

        let latestAssetRule = starting.assetRule;

        const expectedSpentAfter = (inputAmount) => {
          if (!latestAssetRule) {
            throw new Error('WORLD_FAIR_ASSET_RULE_NOT_READY');
          }
          return Number(latestAssetRule.spentThisPeriod) + inputAmount;
        };

        const observeSwapEffect = async (inputAmount) => {
          const state = await waitForAssetRuleSpentAtLeast(
            expectedSpentAfter(inputAmount)
          );
          latestAssetRule = state.assetRule;
          return state;
        };

        const standingPyth = await step(
          'STANDING_1_MARKET_EVIDENCE',
          'READ',
          () => livePyth()
        );
        const standingQuote1 = await step(
          'STANDING_1_QUOTE',
          'READ',
          () => quoteFor(pool, STANDING_INPUT)
        );
        const standingSig1 = await step(
          'STANDING_1_EXECUTE',
          'WRITE',
          () =>
            executeStanding({
              inputAmount: STANDING_INPUT,
              pyth: standingPyth,
              quote: standingQuote1,
              executionNonce,
              poolData,
              pythTreasury
            })
        );
        recordEffect('standingAutonomy.1', standingSig1);
        await step(
          'STANDING_1_EFFECT_OBSERVED',
          'READ',
          () => observeSwapEffect(STANDING_INPUT)
        );

        const standingPyth2 = await step(
          'STANDING_2_MARKET_EVIDENCE',
          'READ',
          () => livePyth()
        );
        const standingQuote2 = await step(
          'STANDING_2_QUOTE',
          'READ',
          () => quoteFor(pool, STANDING_INPUT)
        );
        const standingSig2 = await step(
          'STANDING_2_EXECUTE',
          'WRITE',
          () =>
            executeStanding({
              inputAmount: STANDING_INPUT,
              pyth: standingPyth2,
              quote: standingQuote2,
              executionNonce,
              poolData,
              pythTreasury
            })
        );
        recordEffect('standingAutonomy.2', standingSig2);
        await step(
          'STANDING_2_EFFECT_OBSERVED',
          'READ',
          () => observeSwapEffect(STANDING_INPUT)
        );

        receipt.scenarios.standingAutonomy = {
          status: 'PASS',
          signatures: [standingSig1, standingSig2],
          guardianApprovalRequired: false
        };

        const boundaryPyth = await step(
          'SOFT_BOUNDARY_MARKET_EVIDENCE',
          'READ',
          () => livePyth()
        );
        const boundaryQuote = await step(
          'SOFT_BOUNDARY_QUOTE',
          'READ',
          () => quoteFor(pool, EXCEPTION_INPUT)
        );
        const boundary = await step(
          'SOFT_BOUNDARY_REFUSAL',
          'WRITE',
          () =>
            expectRefusal(
              () =>
                executeStanding({
                  inputAmount: EXCEPTION_INPUT,
                  pyth: boundaryPyth,
                  quote: boundaryQuote,
                  executionNonce,
                  poolData,
                  pythTreasury
                }),
              ['PythNotionalExceeded']
            )
        );
        const boundaryNotional =
          (BigInt(EXCEPTION_INPUT) *
            BigInt(boundaryPyth.unitPriceMicroUsd)) /
          1_000_000n;

        receipt.scenarios.softBoundary = {
          status: 'PASS',
          decision: 'REFUSE',
          reason: boundary.reason,
          requestedNotionalMicroUsd: Number(boundaryNotional),
          standingMaxNotionalMicroUsd: policy.maxActionNotionalMicroUsd,
          policyDiff: worldFairPolicyDiff({
            requestedNotionalMicroUsd: Number(boundaryNotional),
            standingMaxNotionalMicroUsd: policy.maxActionNotionalMicroUsd
          })
        };

        const exactPyth = await step(
          'EXACT_EXCEPTION_MARKET_EVIDENCE',
          'READ',
          () => livePyth()
        );
        const exactQuote = await step(
          'EXACT_EXCEPTION_QUOTE',
          'READ',
          () => quoteFor(pool, EXCEPTION_INPUT)
        );
        const exact = await step(
          'EXACT_EXCEPTION_GRANT',
          'WRITE',
          () =>
            grantSwapException({
              inputAmount: EXCEPTION_INPUT,
              quote: exactQuote,
              pyth: exactPyth,
              deadline: Math.floor(Date.now() / 1000) + 300,
              expectedNonce: executionNonce
            })
        );
        recordEffect('exactException.grant', exact.signature);

        const mutatedQuote = {
          ...exactQuote,
          otherAmountThreshold: exactQuote.otherAmountThreshold.sub(
            new BN(1)
          )
        };
        const mutation = await step(
          'EXACT_EXCEPTION_MUTATION_REFUSAL',
          'WRITE',
          () =>
            expectRefusal(
              () =>
                executeException({
                  exception: exact,
                  poolData,
                  pythTreasury,
                  quote: mutatedQuote
                }),
              ['AllowanceActionMismatch']
            )
        );

        const beforeExact = (
          await step(
            'EXACT_EXCEPTION_PRE_STATE',
            'READ',
            () => loadState()
          )
        ).mandate;
        const exactSignature = await step(
          'EXACT_EXCEPTION_EXECUTE',
          'WRITE',
          () =>
            executeException({
              exception: exact,
              poolData,
              pythTreasury
            })
        );
        recordEffect('exactException.execute', exactSignature);
        const exactObserved = await step(
          'EXACT_EXCEPTION_EFFECT_OBSERVED',
          'READ',
          () => observeSwapEffect(EXCEPTION_INPUT)
        );

        const exactAllowance = await step(
          'EXACT_EXCEPTION_ALLOWANCE_VERIFY',
          'READ',
          () => loadAllowance(exact.allowance)
        );
        const afterExact = exactObserved.mandate;

        const replay = await step(
          'EXACT_EXCEPTION_REPLAY_REFUSAL',
          'WRITE',
          () =>
            expectRefusal(
              () =>
                executeException({
                  exception: exact,
                  poolData,
                  pythTreasury
                }),
              ['AllowanceAlreadyUsed']
            )
        );

        receipt.scenarios.exactException = {
          status: 'PASS',
          allowance: exact.allowance.toBase58(),
          requestHash: exact.requestHash.toString('hex'),
          grantSignature: exact.signature,
          mutationDecision: 'REFUSE',
          mutationReason: mutation.reason,
          executionSignature: exactSignature,
          consumed: exactAllowance.used,
          replayDecision: 'REFUSE',
          replayReason: replay.reason,
          standingMandateVersionBefore: beforeExact.version,
          standingMandateVersionAfter: afterExact.version,
          standingAuthorityChanged: beforeExact.version !== afterExact.version
        };

        const hardPyth = await step(
          'HARD_BOUNDARY_MARKET_EVIDENCE',
          'READ',
          () => livePyth()
        );
        const hardQuote = await step(
          'HARD_BOUNDARY_QUOTE',
          'READ',
          () => quoteFor(pool, STANDING_INPUT)
        );
        const hardBoundary = await step(
          'HARD_BOUNDARY_REFUSAL',
          'WRITE',
          () =>
            expectRefusal(
              () =>
                executeStanding({
                  inputAmount: STANDING_INPUT,
                  pyth: hardPyth,
                  quote: hardQuote,
                  executionNonce,
                  poolData,
                  pythTreasury,
                  orcaProgram: SystemProgram.programId
                }),
              ['InvalidOrcaProgram']
            )
        );
        receipt.scenarios.hardBoundary = {
          status: 'PASS',
          decision: 'REFUSE',
          reason: hardBoundary.reason,
          exceptionPath: false
        };

        const evidenceQuote = await step(
          'EVIDENCE_FAILURE_QUOTE',
          'READ',
          () => quoteFor(pool, STANDING_INPUT)
        );
        const evidenceFailure = await step(
          'EVIDENCE_FAILURE_REFUSAL',
          'WRITE',
          () =>
            expectRefusal(
              () =>
                executeStanding({
                  inputAmount: STANDING_INPUT,
                  pyth: { message: Buffer.alloc(0) },
                  quote: evidenceQuote,
                  executionNonce,
                  poolData,
                  pythTreasury,
                  includePythVerification: false
                }),
              ['PythMessageInvalid']
            )
        );
        receipt.scenarios.evidenceFailure = {
          status: 'PASS',
          decision: 'REFUSE',
          reason: evidenceFailure.reason,
          dependency: 'PYTH_LAZER',
          evidenceStatus: 'MISSING'
        };

        const rollbackPyth = await step(
          'ROLLBACK_MARKET_EVIDENCE',
          'READ',
          () => livePyth()
        );
        const rollbackQuoteBase = await step(
          'ROLLBACK_QUOTE',
          'READ',
          () => quoteFor(pool, ROLLBACK_INPUT)
        );
        const impossibleQuote = {
          ...rollbackQuoteBase,
          otherAmountThreshold: rollbackQuoteBase.estimatedAmountOut.mul(
            new BN(100)
          )
        };
        const rollback = await step(
          'ROLLBACK_EXCEPTION_GRANT',
          'WRITE',
          () =>
            grantSwapException({
              inputAmount: ROLLBACK_INPUT,
              quote: impossibleQuote,
              pyth: rollbackPyth,
              deadline: Math.floor(Date.now() / 1000) + 300,
              expectedNonce: executionNonce
            })
        );
        recordEffect('rollback.grant', rollback.signature);

        const ruleBeforeRollback = (
          await step(
            'ROLLBACK_PRE_STATE',
            'READ',
            () => loadState()
          )
        ).assetRule;
        const rollbackRefusal = await step(
          'ROLLBACK_EXPECTED_REFUSAL',
          'WRITE',
          () =>
            expectRefusal(
              () =>
                executeException({
                  exception: rollback,
                  poolData,
                  pythTreasury
                }),
              [
                'AmountOutBelowMinimum',
                'OrcaSwapFailed',
                'Amount out below minimum threshold'
              ]
            )
        );
        const rollbackAllowance = await step(
          'ROLLBACK_ALLOWANCE_VERIFY',
          'READ',
          () => loadAllowance(rollback.allowance)
        );
        const ruleAfterRollback = (
          await step(
            'ROLLBACK_POST_STATE',
            'READ',
            () => loadState()
          )
        ).assetRule;

        const countersChanged =
          ruleAfterRollback.spentThisPeriod !==
            ruleBeforeRollback.spentThisPeriod ||
          ruleAfterRollback.spentThisPeriodNotionalMicroUsd !==
            ruleBeforeRollback.spentThisPeriodNotionalMicroUsd;

        if (rollbackAllowance.used || countersChanged) {
          activePhase = {
            code: 'ROLLBACK_INVARIANT_VERIFY',
            kind: 'ASSERT'
          };
          receipt.progress.currentPhase = activePhase.code;
          throw new Error('WORLD_FAIR_ROLLBACK_INVARIANT_FAILED');
        }

        receipt.progress.completedPhases.push(
          'ROLLBACK_INVARIANT_VERIFY'
        );
        receipt.scenarios.rollback = {
          status: 'PASS',
          decision: 'REFUSE',
          reason: rollbackRefusal.reason,
          allowance: rollback.allowance.toBase58(),
          allowanceConsumed: rollbackAllowance.used,
          countersChanged
        };

        const beforeStale = (
          await step(
            'STALE_AUTHORITY_PRE_STATE',
            'READ',
            () => loadState()
          )
        ).mandate;
        const policyTransitionSignature = await step(
          'STALE_AUTHORITY_POLICY_TRANSITION',
          'WRITE',
          () => configurePolicy(beforeStale.nonce)
        );
        recordEffect(
          'staleAuthority.policyTransition',
          policyTransitionSignature
        );
        const afterStale = (
          await step(
            'STALE_AUTHORITY_POST_STATE',
            'READ',
            () => loadState()
          )
        ).mandate;

        const stale = await step(
          'STALE_AUTHORITY_REFUSAL',
          'WRITE',
          () =>
            expectRefusal(
              () =>
                executeException({
                  exception: rollback,
                  poolData,
                  pythTreasury,
                  expectedNonce: beforeStale.nonce
                }),
              ['StaleNonce']
            )
        );

        receipt.scenarios.staleAuthority = {
          status: 'PASS',
          policyTransitionSignature,
          sourceNonce: beforeStale.nonce,
          currentNonce: afterStale.nonce,
          decision: 'REFUSE',
          reason: stale.reason
        };

        receipt.status = 'PASS';
        receipt.productState = 'WORLD_FAIR_OPERATOR_LAB_LIVE';
        receipt.observedAtCompleted = now();
        receipt.progress.currentPhase = 'COMPLETE';
        receipt.progress.completedPhases.push('COMPLETE');
        receipt.explorer = {
          program: `https://explorer.solana.com/address/${WORLD_FAIR_PROGRAM_ID.toBase58()}?cluster=devnet`
        };

        return receipt;
      } catch (error) {
        if (error?.name === 'WorldFairRunError') throw error;
        throw createWorldFairRunFailure({
          error,
          phase: activePhase.code,
          phaseKind: activePhase.kind,
          receipt
        });
      }
    })();

    runtimePromises.set(lockKey, promise);
    try {
      return await promise;
    } finally {
      runtimePromises.delete(lockKey);
    }
  }


  // ---------------------------------------------------------------------------
  // Workflow operations (operator intents, principal decisions, mandate lifecycle).
  // Each one reuses the instruction builders proven by the canonical sequence.
  // Program refusals come back as decisions; transport/RPC failures throw so the
  // caller records UNKNOWN and reconciles instead of inventing an outcome.
  // ---------------------------------------------------------------------------

  function chainLock(operation) {
    const lockKey = `${guardian.publicKey.toBase58()}:${delegate.publicKey.toBase58()}`;
    const previous = runtimePromises.get(lockKey);
    if (previous) {
      const busy = new Error('WORLD_FAIR_MANDATE_BUSY');
      busy.worldFairBusy = true;
      throw busy;
    }
    const promise = operation();
    runtimePromises.set(lockKey, promise);
    return promise.finally(() => runtimePromises.delete(lockKey));
  }

  function mandateView(state) {
    const m = state.mandate;
    const r = state.assetRule;
    return {
      accounts: {
        charter: charter.toBase58(),
        mandate: mandate.toBase58(),
        assetRule: assetRule.toBase58(),
        inputTradeVault: inputTradeVault.toBase58(),
        outputTradeVault: outputTradeVault.toBase58()
      },
      guardian: guardianPk.toBase58(),
      feePayer: guardian.publicKey.toBase58(),
      delegate: delegate.publicKey.toBase58(),
      mandate: m
        ? {
            stage: m.stage,
            status: MANDATE_STATUS_NAMES[m.status] ?? 'UNKNOWN',
            version: m.version,
            nonce: m.nonce,
            maxActionNotionalMicroUsd: m.maxActionNotionalMicroUsd,
            maxPeriodNotionalMicroUsd: m.maxPeriodNotionalMicroUsd,
            expiresAt: m.expiresAt,
            maxMarketAgeSeconds: m.maxMarketAgeSeconds,
            maxConfidenceBps: m.maxConfidenceBps
          }
        : null,
      assetRule: r
        ? {
            enabled: r.enabled,
            maxActionAmount: r.maxActionAmount,
            maxPeriodAmount: r.maxPeriodAmount,
            periodSeconds: r.periodSeconds,
            periodStartedAt: r.periodStartedAt,
            spentThisPeriod: r.spentThisPeriod,
            spentThisPeriodNotionalMicroUsd: r.spentThisPeriodNotionalMicroUsd,
            maxUnitPriceMicroUsd: r.maxUnitPriceMicroUsd
          }
        : null
    };
  }

  async function readMandate() {
    const state = await loadState();
    validateExistingState(state);
    return mandateView(state);
  }

  async function quoteIntent({ inputAmount, slippageBps }) {
    const amount = Number(inputAmount);
    const bps = Number(slippageBps);
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('WORLD_FAIR_INTENT_AMOUNT_INVALID');
    if (!Number.isSafeInteger(bps) || bps < 1 || bps > 300) throw new Error('WORLD_FAIR_INTENT_SLIPPAGE_INVALID');
    const pyth = await livePyth();
    const { pool, data: poolData, pythTreasury } = await orcaContextState();
    const quote = await withTransientRpcReadRetry(
      () =>
        swapQuoteByInputToken(
          pool,
          WORLD_FAIR_DEV_USDC,
          new BN(amount),
          Percentage.fromFraction(bps, 10_000),
          ORCA_WHIRLPOOL_PROGRAM_ID,
          orcaContext.fetcher,
          IGNORE_CACHE
        ),
      WORLD_FAIR_ORCA_READ_RETRY_PROFILE
    );
    const notionalMicroUsd = Number(
      (BigInt(amount) * BigInt(pyth.unitPriceMicroUsd)) / 1_000_000n
    );
    return {
      pyth,
      quote,
      poolData,
      pythTreasury,
      inputAmount: amount,
      slippageBps: bps,
      notionalMicroUsd,
      unitPriceMicroUsd: pyth.unitPriceMicroUsd,
      estimatedOutput: Number(quote.estimatedAmountOut.toString()),
      minOutput: Number(quote.otherAmountThreshold.toString())
    };
  }

  function quoteSummary(q) {
    return {
      inputAmount: q.inputAmount,
      slippageBps: q.slippageBps,
      notionalMicroUsd: q.notionalMicroUsd,
      unitPriceMicroUsd: q.unitPriceMicroUsd,
      estimatedOutput: q.estimatedOutput,
      minOutput: q.minOutput,
      pythPublishedAt: q.pyth?.snapshot?.publishedAt ?? q.pyth?.snapshot?.timestamp ?? null
    };
  }

  async function ensureWorkspaceVaultFor(inputAmount) {
    if (strictLabState) return null; // the judge lab keeps its proven funding path
    const vault = await readTokenAccount(inputTradeVault);
    if (Number(vault.amount) >= Number(inputAmount)) return null;
    await ensureDelegateFunding();
    return ensureInputVaultFunding(Number(inputAmount));
  }

  async function executeIntent({ inputAmount, slippageBps }) {
    return chainLock(async () => {
      const state = await loadState();
      validateExistingState(state);
      if (!state.mandate || !state.assetRule) throw new Error('WORLD_FAIR_WORKSPACE_NOT_BOOTSTRAPPED');
      const before = mandateView(state);
      // An empty trade vault makes the token program fail mid-swap (error 0x1).
      // Refill from the server-held Devnet guardian first, so the program
      // decision is about authority, never about lab plumbing.
      await ensureWorkspaceVaultFor(inputAmount);
      const q = await quoteIntent({ inputAmount, slippageBps });
      const standingMax = state.mandate.maxActionNotionalMicroUsd;

      if (state.mandate.status !== MANDATE_STATUS_CODES.ACTIVE) {
        return { decision: 'REFUSE', boundary: 'HARD', code: 'MandateNotActive', quote: quoteSummary(q), mandateBefore: before.mandate };
      }

      const attempt = () =>
        executeStanding({
          inputAmount: q.inputAmount,
          pyth: q.pyth,
          quote: q.quote,
          executionNonce: state.mandate.nonce,
          poolData: q.poolData,
          pythTreasury: q.pythTreasury
        });

      let signature;
      try {
        signature = await attempt();
      } catch (error) {
        let refusal = classifyWorldFairProgramRefusal(error);
        if (!refusal) throw error;
        if (refusal.boundary === 'SOFT') {
          // The program checks the notional cap before the period budgets, so a
          // soft refusal can hide a hard one. Never open a request that could
          // only fail after a paid grant.
          const blocked = worldFairHardPrecheck(state, q, Math.floor(Date.now() / 1000));
          if (blocked) refusal = { refused: true, code: blocked, boundary: 'HARD', evidence: 'PROGRAM_STATE_PRECHECK' };
        }
        return {
          decision: 'REFUSE',
          boundary: refusal.boundary,
          code: refusal.code,
          // Preflight simulation ran the CRESCO program against live state: the
          // refusal is the program's decision, and no state changed.
          refusalEvidence: refusal.evidence ?? 'PROGRAM_PREFLIGHT_SIMULATION',
          quote: quoteSummary(q),
          standingMaxNotionalMicroUsd: standingMax,
          policyDiff:
            refusal.boundary === 'SOFT'
              ? worldFairPolicyDiff({
                  requestedNotionalMicroUsd: q.notionalMicroUsd,
                  standingMaxNotionalMicroUsd: standingMax
                })
              : null,
          mandateBefore: before.mandate
        };
      }

      const expectedSpent = Number(state.assetRule.spentThisPeriod) + q.inputAmount;
      let after = null;
      try {
        after = mandateView(await waitForAssetRuleSpentAtLeast(expectedSpent));
      } catch {
        after = null; // confirmed signature, effect read lagging: caller reconciles
      }
      return {
        decision: 'ALLOW',
        boundary: 'STANDING',
        signature,
        quote: quoteSummary(q),
        standingMaxNotionalMicroUsd: standingMax,
        effectObserved: Boolean(after),
        mandateBefore: before.mandate,
        mandateAfter: after?.mandate ?? null,
        assetRuleAfter: after?.assetRule ?? null
      };
    });
  }

  async function approveAndExecuteException({ inputAmount, slippageBps, expectedNonce, approvalProof = null }) {
    return chainLock(async () => {
      const state = await loadState();
      validateExistingState(state);
      if (!state.mandate || !state.assetRule) throw new Error('WORLD_FAIR_WORKSPACE_NOT_BOOTSTRAPPED');
      if (Number(state.mandate.nonce) !== Number(expectedNonce)) {
        return { status: 'STALE', code: 'StaleNonce', currentNonce: state.mandate.nonce, requestNonce: Number(expectedNonce) };
      }
      if (state.mandate.status !== MANDATE_STATUS_CODES.ACTIVE) {
        return { status: 'REFUSED', boundary: 'HARD', code: 'MandateNotActive' };
      }
      const q = await quoteIntent({ inputAmount, slippageBps });
      if (q.notionalMicroUsd <= state.mandate.maxActionNotionalMicroUsd) {
        return { status: 'NOT_REQUIRED', code: 'ExceptionNotRequired', quote: quoteSummary(q) };
      }
      const blocked = worldFairHardPrecheck(state, q, Math.floor(Date.now() / 1000));
      if (!blocked) await ensureWorkspaceVaultFor(q.inputAmount);
      if (blocked) {
        // The program would refuse execution after the grant; do not pay for a grant.
        return { status: 'REFUSED', boundary: 'HARD', code: blocked, evidence: 'PROGRAM_STATE_PRECHECK', quote: quoteSummary(q) };
      }

      let exception;
      const grantDeadline = Math.floor(Date.now() / 1000) + 300;
      try {
        exception = await grantSwapException({
          inputAmount: q.inputAmount,
          quote: q.quote,
          pyth: q.pyth,
          deadline: grantDeadline,
          expectedNonce: state.mandate.nonce,
          approvalProof
        });
      } catch (error) {
        if (error instanceof WorldFairGuardianSignatureRequired) {
          // The principal's wallet must sign the exact grant. Keep everything the
          // execution needs so it can run right after the signed grant lands,
          // with the same Pyth message (within its market-age window).
          return {
            status: 'NEEDS_GUARDIAN_SIGNATURE',
            guardianSignature: error.request,
            pendingException: {
              inputAmount: q.inputAmount,
              slippageBps: q.slippageBps,
              deadline: grantDeadline,
              expectedNonce: Number(state.mandate.nonce),
              requestHash: error.request.context.requestHash,
              exactNotional: error.request.context.exactNotional,
              allowance: error.request.context.allowance,
              pythMessage: q.pyth.message.toString('base64'),
              unitPriceMicroUsd: q.pyth.unitPriceMicroUsd,
              minOutput: q.quote.otherAmountThreshold.toString(),
              sqrtPriceLimit: q.quote.sqrtPriceLimit.toString(),
              tickArrays: [q.quote.tickArray0, q.quote.tickArray1, q.quote.tickArray2].map((k) => k.toBase58()),
              standingMandateVersion: state.mandate.version,
              spentThisPeriod: Number(state.assetRule.spentThisPeriod),
              quote: quoteSummary(q)
            }
          };
        }
        const refusal = classifyWorldFairProgramRefusal(error);
        if (!refusal) throw error;
        return { status: refusal.boundary === 'STALE' ? 'STALE' : 'REFUSED', boundary: refusal.boundary, code: refusal.code, quote: quoteSummary(q) };
      }

      const grant = {
        signature: exception.signature,
        allowance: exception.allowance.toBase58(),
        requestHash: exception.requestHash.toString('hex'),
        maxNotionalMicroUsd: Number(exception.exactNotional),
        deadline: exception.deadline,
        mandateNonce: Number(state.mandate.nonce),
        principalApprovalVerifiedOnChain: Boolean(approvalProof),
        principalWallet: approvalProof ? String(approvalProof.publicKey) : null
      };

      let executionSignature;
      try {
        executionSignature = await executeException({
          exception,
          poolData: q.poolData,
          pythTreasury: q.pythTreasury
        });
      } catch (error) {
        const refusal = classifyWorldFairProgramRefusal(error);
        if (!refusal) {
          // Timeout / transport: the transaction may still land. Never record a
          // final outcome here; keep both signatures for reconciliation.
          throw Object.assign(error, {
            worldFairGrant: grant,
            worldFairExecutionSignature: worldFairSignatureFromError(error)
          });
        }
        let allowanceState = null;
        try {
          allowanceState = await loadAllowance(exception.allowance);
        } catch {
          allowanceState = null;
        }
        if (refusal.boundary === 'VENUE' && allowanceState && !allowanceState.used) {
          return { status: 'ROLLED_BACK', code: refusal.code, boundary: refusal.boundary, grant, allowanceConsumed: false, quote: quoteSummary(q) };
        }
        return { status: 'EXECUTION_REFUSED', code: refusal.code, boundary: refusal.boundary, grant, allowanceConsumed: allowanceState?.used ?? null, quote: quoteSummary(q) };
      }

      const expectedSpent = Number(state.assetRule.spentThisPeriod) + q.inputAmount;
      let after = null;
      try {
        after = mandateView(await waitForAssetRuleSpentAtLeast(expectedSpent));
      } catch {
        after = null;
      }
      let consumed = null;
      try {
        consumed = (await loadAllowance(exception.allowance)).used;
      } catch {
        consumed = null;
      }
      return {
        status: 'EXECUTED',
        grant,
        executionSignature,
        allowanceConsumed: consumed,
        quote: quoteSummary(q),
        standingMandateVersionBefore: state.mandate.version,
        standingMandateVersionAfter: after?.mandate?.version ?? null,
        standingAuthorityChanged:
          after?.mandate ? after.mandate.version !== state.mandate.version : null,
        assetRuleAfter: after?.assetRule ?? null
      };
    });
  }

  // Principal-wallet path, step 2: the wallet-signed grant has landed; execute
  // the exact swap once with the stored Pyth message and quote bounds.
  async function executeGrantedException({ pending, grantSignature }) {
    return chainLock(async () => {
      const allowance = new PublicKey(pending.allowance);
      const allowanceState = await loadAllowance(allowance);
      if (allowanceState.used) return { status: 'EXECUTION_REFUSED', code: 'AllowanceAlreadyUsed', boundary: 'HARD', allowanceConsumed: true };
      const { data: poolData, pythTreasury } = await orcaContextState();
      const quote = {
        otherAmountThreshold: new BN(pending.minOutput),
        sqrtPriceLimit: new BN(pending.sqrtPriceLimit),
        tickArray0: new PublicKey(pending.tickArrays[0]),
        tickArray1: new PublicKey(pending.tickArrays[1]),
        tickArray2: new PublicKey(pending.tickArrays[2])
      };
      const exception = {
        allowance,
        requestHash: Buffer.from(pending.requestHash, 'hex'),
        deadline: pending.deadline,
        inputAmount: pending.inputAmount,
        expectedNonce: pending.expectedNonce,
        quote,
        pyth: { message: Buffer.from(pending.pythMessage, 'base64'), unitPriceMicroUsd: pending.unitPriceMicroUsd }
      };
      const grant = {
        signature: grantSignature,
        allowance: pending.allowance,
        requestHash: pending.requestHash,
        maxNotionalMicroUsd: Number(pending.exactNotional),
        deadline: pending.deadline,
        mandateNonce: pending.expectedNonce,
        signedByPrincipalWallet: guardianPk.toBase58(),
        principalApprovalVerifiedOnChain: true,
        principalWallet: guardianPk.toBase58()
      };
      let executionSignature;
      try {
        executionSignature = await executeException({ exception, poolData, pythTreasury });
      } catch (error) {
        const refusal = classifyWorldFairProgramRefusal(error);
        if (!refusal) {
          throw Object.assign(error, { worldFairGrant: grant, worldFairExecutionSignature: worldFairSignatureFromError(error) });
        }
        return { status: refusal.boundary === 'VENUE' ? 'ROLLED_BACK' : 'EXECUTION_REFUSED', code: refusal.code, boundary: refusal.boundary, grant, allowanceConsumed: false, quote: pending.quote };
      }
      let after = null;
      try {
        after = mandateView(await waitForAssetRuleSpentAtLeast(Number(pending.spentThisPeriod) + Number(pending.inputAmount)));
      } catch {
        after = null;
      }
      let consumed = null;
      try {
        consumed = (await loadAllowance(allowance)).used;
      } catch {
        consumed = null;
      }
      return {
        status: 'EXECUTED',
        grant,
        executionSignature,
        allowanceConsumed: consumed,
        quote: pending.quote,
        standingMandateVersionBefore: pending.standingMandateVersion,
        standingMandateVersionAfter: after?.mandate?.version ?? null,
        standingAuthorityChanged: after?.mandate ? after.mandate.version !== pending.standingMandateVersion : null,
        assetRuleAfter: after?.assetRule ?? null
      };
    });
  }

  async function guardianWrite(name, keys, parts) {
    return sendGuardian({ label: name, instructions: [ix(name, keys, parts)] });
  }

  async function setMandateStatus({ status, expectedNonce }) {
    const code = MANDATE_STATUS_CODES[status];
    if (code === undefined) throw new Error('WORLD_FAIR_MANDATE_STATUS_INVALID');
    return chainLock(async () => {
      try {
        const signature = await guardianWrite(
          'set_mandate_status',
          [
            publicKeyMeta(charter),
            publicKeyMeta(mandate, false, true),
            publicKeyMeta(guardianPk, true, false)
          ],
          [u64le(expectedNonce), Buffer.from([code])]
        );
        return { status: 'CONFIRMED', signature, mandate: (await readMandate()).mandate };
      } catch (error) {
        if (error instanceof WorldFairGuardianSignatureRequired) {
          return { status: 'NEEDS_GUARDIAN_SIGNATURE', guardianSignature: error.request };
        }
        const refusal = classifyWorldFairProgramRefusal(error);
        if (!refusal) throw error;
        return { status: 'REFUSED', code: refusal.code, boundary: refusal.boundary };
      }
    });
  }

  async function revisePolicy({ values, expectedNonce }) {
    const next = normalizeWorldFairPolicy({ ...policy, ...values });
    return chainLock(async () => {
      try {
        const signature = await configurePolicy(expectedNonce, next);
        return { status: 'CONFIRMED', signature, mandate: (await readMandate()).mandate };
      } catch (error) {
        if (error instanceof WorldFairGuardianSignatureRequired) {
          return { status: 'NEEDS_GUARDIAN_SIGNATURE', guardianSignature: error.request };
        }
        const refusal = classifyWorldFairProgramRefusal(error);
        if (!refusal) throw error;
        return { status: 'REFUSED', code: refusal.code, boundary: refusal.boundary };
      }
    });
  }

  async function updateRule({ values, expectedNonce }) {
    const next = normalizeWorldFairPolicy({ ...policy, ...values });
    const enabled = values?.enabled === undefined ? true : Boolean(values.enabled);
    return chainLock(async () => {
      try {
        const signature = await guardianWrite(
          'update_asset_rule',
          [
            publicKeyMeta(charter),
            publicKeyMeta(mandate, false, true),
            publicKeyMeta(assetRule, false, true),
            publicKeyMeta(guardianPk, true, false)
          ],
          [
            u64le(expectedNonce),
            Buffer.from([enabled ? 1 : 0]),
            Buffer.from([ACTION_SWAP_EXACT_IN]),
            u64le(next.maxActionAmount),
            u64le(next.maxPeriodAmount),
            i64le(next.periodSeconds),
            u64le(next.maxUnitPriceMicroUsd),
            u32le(WORLD_FAIR_PYTH_FEED.feedId)
          ]
        );
        return { status: 'CONFIRMED', signature, mandate: await readMandate() };
      } catch (error) {
        if (error instanceof WorldFairGuardianSignatureRequired) {
          return { status: 'NEEDS_GUARDIAN_SIGNATURE', guardianSignature: error.request };
        }
        const refusal = classifyWorldFairProgramRefusal(error);
        if (!refusal) throw error;
        return { status: 'REFUSED', code: refusal.code, boundary: refusal.boundary };
      }
    });
  }

  async function signatureStatus(signature) {
    const result = await withTransientRpcReadRetry(
      () => readRpc.getSignatureStatuses([signature], { searchTransactionHistory: true }),
      WORLD_FAIR_STATE_READ_RETRY_PROFILE
    );
    const value = result?.value?.[0] ?? null;
    if (!value) return { status: 'NOT_FOUND' };
    if (value.err) return { status: 'FAILED', err: JSON.stringify(value.err).slice(0, 400) };
    return {
      status:
        value.confirmationStatus === 'finalized' || value.confirmationStatus === 'confirmed'
          ? 'CONFIRMED'
          : 'PROCESSED',
      slot: value.slot
    };
  }

  async function bootstrapWorkspace() {
    return chainLock(async () => {
      try {
        const ready = await ensureReady();
        return { bootstrap: ready.bootstrap, ...mandateView(ready.state) };
      } catch (error) {
        if (error instanceof WorldFairGuardianSignatureRequired) {
          return { status: 'NEEDS_GUARDIAN_SIGNATURE', guardianSignature: error.request };
        }
        throw error;
      }
    });
  }

  return {
    getPublicState,
    ensureReady,
    runCanonicalSequence,
    readMandate,
    quoteIntent,
    executeIntent,
    approveAndExecuteException,
    setMandateStatus,
    revisePolicy,
    updateRule,
    signatureStatus,
    bootstrapWorkspace,
    submitGuardianTransaction,
    executeGrantedException,
    walletGuardian,
    policy,
    ids: {
      programId: WORLD_FAIR_PROGRAM_ID.toBase58(),
      guardian: guardianPk.toBase58(),
      delegate: delegate.publicKey.toBase58()
    }
  };
}

let configuredProvider = null;

export function configuredWorldFairOrcaProviderFromEnv(env = null) {
  if (configuredProvider) return configuredProvider;

  const read = (key) =>
    env?.[key] ??
    (typeof process !== 'undefined' ? process.env?.[key] : null);

  const keypairJson = read('DEVNET_KEYPAIR_JSON');
  const pythApiKey = read('PYTH_PRO_API_KEY');
  if (!keypairJson || !pythApiKey) return null;

  configuredProvider = createWorldFairOrcaProvider({
    rpcUrl:
      read('SOLANA_DEVNET_RPC_URL') ??
      'https://api.devnet.solana.com',
    guardian: parseKeypair(keypairJson),
    pythApiKey
  });

  return configuredProvider;
}

const workspaceProviders = new Map();

// Chain adapter for one operator/principal workspace: its own delegate,
// charter, mandate, asset rule and trade vaults under the server-held Devnet
// guardian. The judge lab mandate is never touched.
export function createWorldFairWorkspaceChain({
  guardian,
  pythApiKey,
  rpcUrl = 'https://api.devnet.solana.com',
  workspaceId,
  policy,
  connection = null,
  guardianWallet = null
}) {
  return createWorldFairOrcaProvider({
    rpcUrl,
    guardian,
    pythApiKey,
    connection,
    // A principal-wallet workspace gets its own delegate (and so its own
    // charter): it can never collide with a server-guardian mandate.
    delegate: deriveWorldFairWorkspaceDelegate(guardian, guardianWallet ? `${workspaceId}-principal-wallet` : workspaceId),
    policy,
    guardianAuthority: guardianWallet,
    strictLabState: false,
    // Room for several cycles of the 0.20 / 0.75 loop before an auto-refill.
    vaultTargetBaseUnits: 5_000_000
  });
}

export function configuredWorldFairWorkspaceChainFactoryFromEnv(env = null) {
  const read = (key) =>
    env?.[key] ??
    (typeof process !== 'undefined' ? process.env?.[key] : null);
  const keypairJson = read('DEVNET_KEYPAIR_JSON');
  const pythApiKey = read('PYTH_PRO_API_KEY');
  if (!keypairJson || !pythApiKey) return null;
  const guardian = parseKeypair(keypairJson);
  const rpcUrl = read('SOLANA_DEVNET_RPC_URL') ?? 'https://api.devnet.solana.com';
  return ({ workspaceId, policy, guardianWallet = null }) => {
    const key = `${workspaceId}:${guardianWallet ?? 'server'}:${JSON.stringify(policy ?? {})}`;
    if (!workspaceProviders.has(key)) {
      workspaceProviders.set(
        key,
        createWorldFairWorkspaceChain({ guardian, pythApiKey, rpcUrl, workspaceId, policy, guardianWallet })
      );
    }
    return workspaceProviders.get(key);
  };
}
