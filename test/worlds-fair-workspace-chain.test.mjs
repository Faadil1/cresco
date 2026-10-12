import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair } from '@solana/web3.js';

import {
  classifyWorldFairProgramRefusal,
  createWorldFairWorkspaceChain,
  deriveWorldFairDelegate,
  deriveWorldFairWorkspaceDelegate,
  normalizeWorldFairPolicy,
  WORLD_FAIR_LAB_POLICY,
  worldFairHardPrecheck,
  worldFairPythUnitPriceMicroUsd,
  worldFairSignatureFromError
} from '../src/worlds-fair-orca-provider.mjs';

const guardian = Keypair.fromSeed(new Uint8Array(32).fill(7));

test('workspace delegates are deterministic, distinct per workspace and never the judge-lab delegate', () => {
  const a1 = deriveWorldFairWorkspaceDelegate(guardian, 'ws-aaaaaaaa').publicKey.toBase58();
  const a2 = deriveWorldFairWorkspaceDelegate(guardian, 'ws-aaaaaaaa').publicKey.toBase58();
  const b = deriveWorldFairWorkspaceDelegate(guardian, 'ws-bbbbbbbb').publicKey.toBase58();
  const lab = deriveWorldFairDelegate(guardian).publicKey.toBase58();
  assert.equal(a1, a2);
  assert.notEqual(a1, b);
  assert.notEqual(a1, lab);
  assert.throws(() => deriveWorldFairWorkspaceDelegate(guardian, '../etc'), /WORKSPACE_ID_INVALID/);
});

test('program refusals are classified; transport failures are not refusals', () => {
  const err = (logs) => Object.assign(new Error('Simulation failed'), { logs });
  assert.deepEqual(classifyWorldFairProgramRefusal(err(['Program log: AnchorError ... Error Code: PythNotionalExceeded'])), { refused: true, code: 'PythNotionalExceeded', boundary: 'SOFT' });
  assert.equal(classifyWorldFairProgramRefusal(err(['Error Code: StaleNonce'])).boundary, 'STALE');
  assert.equal(classifyWorldFairProgramRefusal(err(['Error Code: MandateNotActive'])).boundary, 'HARD');
  assert.equal(classifyWorldFairProgramRefusal(err(['Error Code: PythMarketEvidenceStale'])).boundary, 'EVIDENCE');
  assert.equal(classifyWorldFairProgramRefusal(err(['Program log: AnchorError occurred. Error Code: AmountOutBelowMinimum. Error Number: 6036.'])).boundary, 'VENUE');
  assert.equal(classifyWorldFairProgramRefusal(err(['Error Code: InvalidExpiry'])).boundary, 'HARD');
  assert.deepEqual(classifyWorldFairProgramRefusal(err(['Error Code: SomethingNew'])), { refused: true, code: 'SomethingNew', boundary: 'HARD' });
  // Free text that merely contains a code name is not a program refusal.
  assert.equal(classifyWorldFairProgramRefusal(new Error('RPC 401 Unauthorized')), null);
  assert.equal(classifyWorldFairProgramRefusal(new Error('insufficient funds PythNotionalExceeded-like text')), null);
  assert.equal(classifyWorldFairProgramRefusal(new Error('fetch failed: ECONNRESET')), null);
  assert.equal(classifyWorldFairProgramRefusal(new Error('block height exceeded')), null);
});

test('policy normalization keeps the lab defaults and rejects inconsistent caps', () => {
  assert.deepEqual(normalizeWorldFairPolicy(), WORLD_FAIR_LAB_POLICY);
  assert.equal(normalizeWorldFairPolicy({ maxActionNotionalMicroUsd: 1_000_000 }).maxActionNotionalMicroUsd, 1_000_000);
  assert.throws(() => normalizeWorldFairPolicy({ maxActionNotionalMicroUsd: 20_000_000, maxPeriodNotionalMicroUsd: 1_000_000 }), /maxPeriodNotionalMicroUsd/);
  assert.throws(() => normalizeWorldFairPolicy({ maxConfidenceBps: 20_000 }), /maxConfidenceBps/);
  assert.throws(() => normalizeWorldFairPolicy({ maxActionAmount: -1 }), /POLICY_INVALID/);
});

test('workspace chain exposes the workflow operations without touching the network at construction', () => {
  const chain = createWorldFairWorkspaceChain({ guardian, pythApiKey: 'k', workspaceId: 'ws-cccccccc', policy: { maxActionNotionalMicroUsd: 700_000 } });
  for (const fn of ['executeIntent', 'approveAndExecuteException', 'setMandateStatus', 'revisePolicy', 'updateRule', 'readMandate', 'signatureStatus', 'bootstrapWorkspace']) {
    assert.equal(typeof chain[fn], 'function', fn);
  }
  assert.equal(chain.policy.maxActionNotionalMicroUsd, 700_000);
  assert.notEqual(chain.ids.delegate, deriveWorldFairDelegate(guardian).publicKey.toBase58());
});

test('unit price truncates exactly like the program (no float rounding up)', () => {
  // mantissa 99_996_789 at exponent -8 -> 999_967.89 micro-USD -> program truncates to 999_967
  assert.equal(worldFairPythUnitPriceMicroUsd({ priceMantissa: 99_996_789, priceExponent: -8, price: 0.99996789 }), 999_967);
  assert.equal(worldFairPythUnitPriceMicroUsd({ price: 0.99996789 }), 999_967);
  assert.equal(worldFairPythUnitPriceMicroUsd({ priceMantissa: 100_000_000, priceExponent: -8 }), 1_000_000);
  assert.ok(Number.isNaN(worldFairPythUnitPriceMicroUsd({ priceMantissa: 0, priceExponent: -8 })));
});

test('hard precheck mirrors the program checks that follow the notional cap', () => {
  const now = 1_000_000;
  const state = (rule = {}, mandate = {}) => ({
    assetRule: { enabled: true, maxActionAmount: 5_000_000, maxPeriodAmount: 10_000_000, periodSeconds: 86_400, periodStartedAt: now - 10, spentThisPeriod: 0, spentThisPeriodNotionalMicroUsd: 0, ...rule },
    mandate: { maxPeriodNotionalMicroUsd: 10_000_000, ...mandate }
  });
  const q = { inputAmount: 750_000, notionalMicroUsd: 750_000 };
  assert.equal(worldFairHardPrecheck(state(), q, now), null);
  assert.equal(worldFairHardPrecheck(state({ enabled: false }), q, now), 'AssetRuleDisabled');
  assert.equal(worldFairHardPrecheck(state({ maxActionAmount: 500_000 }), q, now), 'ActionAmountExceeded');
  assert.equal(worldFairHardPrecheck(state({ spentThisPeriod: 9_500_000 }), q, now), 'PeriodAmountExceeded');
  assert.equal(worldFairHardPrecheck(state({ spentThisPeriodNotionalMicroUsd: 9_500_000 }), q, now), 'PythPeriodNotionalExceeded');
  // The period rolled over on-chain: spent counters reset, so it fits again.
  assert.equal(worldFairHardPrecheck(state({ spentThisPeriod: 9_500_000, periodStartedAt: now - 90_000 }), q, now), null);
});

test('a confirmation timeout keeps the signature for reconciliation', () => {
  const sig = '5'.repeat(88);
  assert.equal(worldFairSignatureFromError(new Error(`SOLANA_CONFIRMATION_TIMEOUT:${sig}`)), sig);
  assert.equal(worldFairSignatureFromError(new Error('fetch failed')), null);
});
