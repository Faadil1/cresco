import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair } from '@solana/web3.js';

import {
  classifyWorldFairProgramRefusal,
  createWorldFairWorkspaceChain,
  deriveWorldFairDelegate,
  deriveWorldFairWorkspaceDelegate,
  normalizeWorldFairPolicy,
  WORLD_FAIR_LAB_POLICY
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
  assert.equal(classifyWorldFairProgramRefusal(err(['Program log: AmountOutBelowMinimum'])).boundary, 'VENUE');
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
