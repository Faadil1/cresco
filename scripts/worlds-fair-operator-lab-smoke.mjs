import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  WORLD_FAIR_PROGRAM_ID,
  configuredWorldFairOrcaProviderFromEnv
} from '../src/worlds-fair-orca-provider.mjs';

async function main() {
  const provider = configuredWorldFairOrcaProviderFromEnv();
  assert(provider, 'World’s Fair provider requires DEVNET_KEYPAIR_JSON and PYTH_PRO_API_KEY');

  const runtime = await provider.getPublicState({ ensure: true });
  assert.equal(runtime.network, 'solana-devnet');
  assert.equal(runtime.programId, WORLD_FAIR_PROGRAM_ID.toBase58());
  assert.equal(runtime.status, 'READY');

  console.log(`PROOF world_fair_operator_lab_program=${runtime.programId}`);
  console.log(`PROOF world_fair_operator_lab_delegate=${runtime.delegate}`);
  console.log(`PROOF world_fair_operator_lab_nonce_before=${runtime.mandate?.nonce}`);
  console.log('WORLD_FAIR_OPERATOR_LAB_RUNTIME=READY');

  const receipt = await provider.runCanonicalSequence();
  assert.equal(receipt.status, 'PASS');
  assert.equal(receipt.productState, 'WORLD_FAIR_OPERATOR_LAB_LIVE');

  for (const key of [
    'standingAutonomy',
    'softBoundary',
    'exactException',
    'hardBoundary',
    'evidenceFailure',
    'rollback',
    'staleAuthority'
  ]) {
    assert.equal(receipt.scenarios?.[key]?.status, 'PASS', `scenario ${key}`);
  }

  const out = path.resolve(
    'evidence/worlds-fair/operator-lab-runtime-receipt.json'
  );
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(receipt, null, 2) + '\n');

  console.log(
    `PROOF world_fair_operator_lab_nonce_after=${receipt.scenarios.staleAuthority.currentNonce}`
  );
  console.log('WORLD_FAIR_OPERATOR_LAB_RECEIPT_VALID=PASS');
  console.log(`WORLD_FAIR_OPERATOR_LAB_RECEIPT=${out}`);
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
