# CRESCO World’s Fair — Read RPC Retry Ownership Repair (Pre-PR)

Date: 2026-10-03  
Status: **PROVEN NON-LIVE / AWAITING EXPLICIT LIVE-VALIDATION AUTHORIZATION**

## Trigger

Post-deploy repeatability run `37137899070`, attempt `3`, stopped on its first fresh-browser attempt after the browser observed no World’s Fair POST response within 240 seconds.

Evidence:
- `evidence/runtime/HOSTED-POSTDEPLOY-REPEATABILITY-CLIENT-TIMEOUT-2026-10-03.md`

Read-only reconciliation after the timeout observed no mutation on the tracked public invariants:
- Mandate nonce: `12`
- spentThisPeriod: `3650000`
- spentThisPeriodNotionalMicroUsd: `3649888`
- input vault: `350000`
- output vault: `11348815`

No absolute zero-effect claim is made because the timed-out POST produced no response receipt or signature set.

## Product repair

Repository: `Faadil1/cresco`  
Branch: `fix/worlds-fair-read-rpc-retry-ownership-v1`  
Exact head: `127da0c98f2860f1b285c8c651a8be6c2a0b43fa`  
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

The patch separates safe reads from write-capable RPC operations.

Safe-read connection:
- commitment: `confirmed`
- `disableRetryOnRateLimit: true`

CRESCO’s explicit bounded read retry remains:
- attempts: `6`
- base delay: `2 seconds`

Safe reads moved to the dedicated connection include:
- World’s Fair state batch reads;
- review-account reads;
- delegate balance reads;
- token-account reads;
- Orca pool/context/quote reads through a read-only Orca context;
- Pyth storage-account reads;
- allowance reads.

Write-capable operations remain on the existing write connection, including:
- transaction submission / confirmation;
- `getOrCreateAssociatedTokenAccount`, which may write when an ATA is missing.

This prevents web3.js HTTP-429 auto-retry delays from stacking under CRESCO’s explicit read backoff while preserving write-side behavior.

## Non-live proof

Root workflow:
- run: `37152132080`
- result: **PASS**

Branch relationship:
- 2 commits ahead of main;
- 0 commits behind;
- changed files only:
  - `src/worlds-fair-orca-provider.mjs`
  - `test/worlds-fair-orca-context-retry.test.mjs`

No PR has been opened, so no protected World’s Fair Devnet 7/7 validation has been triggered.

## Repeatability harness repair

Repository: `Faadil1/cresco-worlds-fair`  
Branch: `fix/postdeploy-repeatability-timeout-classification-v1`  
Exact head: `b95b7f847e189cc1c5048c7cd3be95a2c06bdc27`

The harness repair:
- removes the `push: main` trigger from the live repeatability workflow, leaving explicit `workflow_dispatch` only;
- reduces the no-response observation window from 240s to 150s;
- converts a no-response timeout into a structured `CLIENT_TIMEOUT_OR_NO_RESPONSE` failure;
- performs read-only runtime reconciliation and records nonce/counters/vault balances;
- writes a failure screenshot and updated summary before exiting;
- preserves stop-on-first-failure and no blind write replay.

No workflow run was triggered by pushing this branch.

## Truth boundary

This checkpoint proves only the non-live source repair and regression tests.

It does **not** prove:
- live Devnet behavior of the new RPC retry ownership;
- deployed Cloudflare behavior;
- post-deploy repeatability;
- mainnet readiness.

## Next protected checkpoint

Opening a PR from `fix/worlds-fair-read-rpc-retry-ownership-v1` will touch `src/worlds-fair-orca-provider.mjs` and therefore trigger the protected World’s Fair live Devnet validation.

Fresh exact-head authorization is required before opening that PR.

The harness branch should remain separate and must not itself auto-trigger a live campaign when eventually promoted.
