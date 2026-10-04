import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  WORLD_FAIR_PROGRAM_ID,
  configuredWorldFairOrcaProviderFromEnv
} from '../src/worlds-fair-orca-provider.mjs';

const OUT = path.resolve(
  'evidence/worlds-fair/operator-lab-runtime-receipt.json'
);

function writeEvidence(value) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(value, null, 2) + '\n');
}

function runtimeSummary(runtime) {
  if (!runtime) return null;
  return {
    status: runtime.status ?? null,
    network: runtime.network ?? null,
    programId: runtime.programId ?? null,
    mandate: runtime.mandate ?? null,
    assetRule: runtime.assetRule ?? null,
    vaults: runtime.vaults ?? null
  };
}

async function main() {
  const provider = configuredWorldFairOrcaProviderFromEnv();
  assert(
    provider,
    'World’s Fair provider requires DEVNET_KEYPAIR_JSON and PYTH_PRO_API_KEY'
  );

  let runtimeBefore = null;

  try {
    runtimeBefore = await provider.getPublicState({ ensure: true });
    assert.equal(runtimeBefore.network, 'solana-devnet');
    assert.equal(
      runtimeBefore.programId,
      WORLD_FAIR_PROGRAM_ID.toBase58()
    );
    assert.equal(runtimeBefore.status, 'READY');

    console.log(
      `PROOF world_fair_operator_lab_program=${runtimeBefore.programId}`
    );
    console.log(
      `PROOF world_fair_operator_lab_delegate=${runtimeBefore.delegate}`
    );
    console.log(
      `PROOF world_fair_operator_lab_nonce_before=${runtimeBefore.mandate?.nonce}`
    );
    console.log('WORLD_FAIR_OPERATOR_LAB_RUNTIME=READY');

    const receipt = await provider.runCanonicalSequence();
    assert.equal(receipt.status, 'PASS');
    assert.equal(
      receipt.productState,
      'WORLD_FAIR_OPERATOR_LAB_LIVE'
    );

    for (const key of [
      'standingAutonomy',
      'softBoundary',
      'exactException',
      'hardBoundary',
      'evidenceFailure',
      'rollback',
      'staleAuthority'
    ]) {
      assert.equal(
        receipt.scenarios?.[key]?.status,
        'PASS',
        `scenario ${key}`
      );
    }

    writeEvidence(receipt);

    console.log(
      `PROOF world_fair_operator_lab_nonce_after=${receipt.scenarios.staleAuthority.currentNonce}`
    );
    console.log('WORLD_FAIR_OPERATOR_LAB_RECEIPT_VALID=PASS');
    console.log(`WORLD_FAIR_OPERATOR_LAB_RECEIPT=${OUT}`);
  } catch (error) {
    let runtimeAfter = null;
    let reconciliationError = null;

    try {
      runtimeAfter = await provider.getPublicState();
    } catch (reconcileError) {
      reconciliationError =
        reconcileError instanceof Error
          ? reconcileError.message
          : String(reconcileError);
    }

    const diagnostic = error?.worldFairDiagnostic ?? null;
    const partialReceipt = error?.worldFairPartialReceipt ?? null;
    const code =
      error?.code ??
      error?.name ??
      'WORLD_FAIR_LIVE_RUN_UNCONFIRMED';

    writeEvidence({
      schemaVersion: 2,
      type: 'CRESCO_WORLD_FAIR_OPERATOR_LAB_FAILURE_EVIDENCE',
      status: 'UNKNOWN',
      observedAt: new Date().toISOString(),
      code,
      diagnostic,
      partialReceipt,
      runtimeBefore,
      runtimeAfter,
      reconciliationError
    });

    console.error(
      'WORLD_FAIR_OPERATOR_LAB_FAILURE=' +
        JSON.stringify({
          code,
          diagnostic,
          partialProgress: partialReceipt?.progress ?? null,
          runtimeBefore: runtimeSummary(runtimeBefore),
          runtimeAfter: runtimeSummary(runtimeAfter),
          reconciliationError
        })
    );
    console.log(`WORLD_FAIR_OPERATOR_LAB_RECEIPT=${OUT}`);

    throw error;
  }
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
