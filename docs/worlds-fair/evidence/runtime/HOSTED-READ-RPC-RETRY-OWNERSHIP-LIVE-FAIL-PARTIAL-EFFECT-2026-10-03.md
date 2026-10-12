# CRESCO World’s Fair — PR #19 Live Validation Failure With Delayed/Partial Effects

Date: 2026-10-03  
Status: **LIVE VALIDATION FAILED / PARTIAL EFFECT RECONCILED / NO MERGE**

## Authorized scope

The user authorized:
- opening one PR for exact head `127da0c98f2860f1b285c8c651a8be6c2a0b43fa`;
- one World’s Fair 7/7 live validation on Solana Devnet;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`  
PR: **#19**  
Head: `127da0c98f2860f1b285c8c651a8be6c2a0b43fa`  
Base: `1266756fb6a00318618daefe9db3d875387411b5`  
Synthetic PR merge ref executed by GitHub: `e08d4f9f3e80259d7c21d1dd4c03ec064d1e240a`

PR remains open and unmerged.

## Checks

- root test run `37152497599`: **PASS**
- Cloudflare Worker CI run `37152497604`: **PASS**
- protected live Devnet run `37152497520`: **FAIL**
- live job `111289071719`

Only one protected World’s Fair live run was created for this authorization.

## Live run observations

Before `runCanonicalSequence()`:
- runtime: `READY`;
- network: Solana Devnet;
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`;
- delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`;
- Mandate nonce: **13**.

The live provider then failed after the sequence had started:
- `WorldFairRunError: The live sequence stopped before CRESCO could prove a complete outcome.`
- receipt verification was skipped;
- the receipt upload step ran but found no file;
- no complete receipt artifact was created;
- no automatic rerun was triggered.

The old smoke harness printed only the stack and did not serialize:
- `worldFairDiagnostic`;
- `worldFairPartialReceipt`;
- runtime reconciliation after failure.

Therefore the exact failing phase is not directly observable from this run.

## Delayed reconciliation of the previous browser timeout

The immediate read-only checkpoint after repeatability run `37137899070`, attempt 3, had observed:
- nonce `12`;
- version `13`;
- `spentThisPeriod=3650000`;
- `spentThisPeriodNotionalMicroUsd=3649888`;
- input vault `350000`;
- output vault `11348815`.

PR #19 later observed **nonce 13 before calling `runCanonicalSequence()`**.

Because:
- the prior state already had the expected policy values;
- `ensureReady()` only reconfigures policy when those values do not match;
- the World’s Fair canonical sequence increments the Mandate nonce during the late stale-authority policy transition;

the earlier “no observable mutation” snapshot was provisional. The timed-out hosted POST had continued after the browser lost contact and advanced the shared Devnet state before PR #19 began.

Truth classification:
- delayed state advancement after the timed-out POST: **INFERRED_HIGH_CONFIDENCE**, grounded in nonce/version progression and deterministic code ordering;
- a complete 7/7 PASS for that timed-out POST: **NOT PROVEN** because no receipt was captured.

## Fresh public runtime after PR #19 failure

A fresh live fetch after the failed PR #19 run observed:
- status: `READY`;
- network: `solana-devnet`;
- Mandate version: **14**;
- Mandate nonce: **13**;
- `spentThisPeriod=5000000`;
- `spentThisPeriodNotionalMicroUsd=4999871`;
- input vault: **1300000**;
- output vault: **12698674**.

The public runtime still reports mainnet=false.

## Partial-effect reconciliation for PR #19

`getPublicState({ ensure: true })` runs `ensureInputVaultFunding()` before printing `READY`.

That function guarantees the World’s Fair input vault is at least:
- `VAULT_TARGET_BASE_UNITS = 1500000`.

The post-failure runtime shows:
- input vault: `1300000`.

The canonical sequence’s first successful vault-consuming action is:
- the first standing swap;
- input amount: `200000`.

Therefore the state is strongly consistent with one successful first standing action occurring after READY and before the failure.

Truth classification:
- at least a 200000-base-unit input-vault delta after READY: **STATE_RECONCILED**;
- exact transaction signature: **UNKNOWN**;
- exact failing phase: **UNKNOWN**;
- complete scenario outcome: **UNKNOWN**;
- “zero effects”: **FALSE**.

No blind replay is permitted.

## Follow-up source-only repair

A separate non-live branch was prepared:

Repository: `Faadil1/cresco`  
Branch: `fix/worlds-fair-partial-receipt-pyth-retry-v1`  
Exact head: `e56f0953b815b207be02d4928f26ca8ddcff4d03`

It adds:
1. bounded transient retry for Pyth evidence reads:
   - 4 attempts;
   - 1-second linear base delay;
   - retries only transient/stale evidence conditions;
   - auth/entitlement failures remain fail-closed and are not retried;
2. failure artifact persistence for the live smoke:
   - diagnostic;
   - partial receipt;
   - runtime before;
   - runtime after;
   - reconciliation error, if any;
3. syntax-check coverage for the live smoke script.

Non-live proof:
- root test run `37152851105`: **PASS**.

No PR has been opened for this follow-up head and no additional live Devnet run is authorized.

## Current boundary

- PR #19: OPEN / UNMERGED
- PR #19 live validation: FAILED
- PR #19 merge authorization: NOT GRANTED
- public redeploy authorization: NOT GRANTED
- mainnet: NOT AUTHORIZED
- post-deploy repeatability: NOT AUTHORIZED
- next candidate repair head: `e56f0953b815b207be02d4928f26ca8ddcff4d03`
- next live action requires fresh exact-head authorization.


## Clean replacement branch to avoid PR ancestry side effects

The first follow-up head `e56f0953b815b207be02d4928f26ca8ddcff4d03` was built on top of PR #19’s exact head.

To avoid repeating the prior PR #17/#18 topology problem, the same effective file contents were reconstructed directly from deployed `main` without PR #19 ancestry.

Canonical clean replacement:
- repository: `Faadil1/cresco`;
- branch: `fix/worlds-fair-retry-observability-v2-clean`;
- exact head: `65a9fea6cbd0535ea867690a848bc1a50ccbe08d`;
- base main: `1266756fb6a00318618daefe9db3d875387411b5`;
- compare: 1 commit ahead / 0 behind;
- no PR exists for this branch;
- root test run `37153090829`: **PASS**;
- no live Devnet workflow was triggered by the branch creation/push.

This clean head supersedes `e56f0953…` as the only candidate for a future replacement PR/live validation.

No PR #19 mutation was issued.
