# CRESCO World’s Fair — Fresh Orca Quote Context Repair

Date: 2026-10-04  
Status: **PROVEN NON-LIVE / AWAITING EXPLICIT LIVE VALIDATION AUTHORIZATION**

## Context

PR #21 at exact head `d64e483c5cc662aca15b7293eca054073e38230c` moved the live failure boundary from `STANDING_2_QUOTE` to `ORCA_CONTEXT_AFTER_STANDING_1`.

Observed PR #21 live run:
- workflow run: `37185513936`
- job: `111386475304`
- result: FAIL
- confirmed write before failure: `standingAutonomy.1`
- signature: `2SWLbjfDTiaDh2QdfqPTMgCVHTM6BDdJGZM7pixxKxvUA4wfMQ77hVz4Pzc86BfC1n39RedAuitau3pNmYd3XhnX`
- failure phase: `ORCA_CONTEXT_AFTER_STANDING_1`
- artifact: `11296822574`
- digest: `sha256:3f277f72160318c5300174fed17571d86a7b683cb969e9c7dcdbe35682b6e15f`

The post-write explicit Orca context refresh became the new failure boundary.

## Repair strategy

Do not add a broader retry budget and do not blindly replay writes.

Instead:
1. remove explicit `pool.refreshData()` calls from the World’s Fair Orca read path;
2. remove separate `ORCA_CONTEXT_AFTER_*` post-write refresh phases;
3. reacquire a fresh Whirlpool using `orcaClient.getPool(..., IGNORE_CACHE)` inside every quote operation;
4. keep `swapQuoteByInputToken(..., IGNORE_CACHE)`;
5. preserve post-write state reconciliation before moving to the next quote;
6. classify residual Orca quote failures as `ORCA_QUOTE_READ_UNAVAILABLE`;
7. preserve `worlds-fair-orca-devnet-proof` as manual `workflow_dispatch` only.

This reduces duplicate read paths after confirmed writes while ensuring each quote is based on a newly fetched pool snapshot.

## Clean replacement topology

Repository: `Faadil1/cresco`  
Branch: `fix/worlds-fair-fresh-quote-context-v2-clean`  
Exact head: `90e1431dd1db975497d81e7cf3d223172aa3437a`  
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

Topology:
- 1 commit ahead;
- 0 behind;
- reconstructed directly from deployed main;
- incorporates the intended PR #21 source changes without PR #21 ancestry;
- no PR exists for this branch.

Changed files:
- `.github/workflows/worlds-fair-orca-devnet-proof.yml`
- `scripts/worlds-fair-operator-lab-smoke.mjs`
- `src/worlds-fair-orca-provider.mjs`
- `test/worlds-fair-orca-context-retry.test.mjs`

## Non-live proof

Push workflow:
- run: `37186819903`
- result: **PASS**
- tests: **124 / 124 PASS**
- deterministic demo smoke: PASS
- live workflows triggered: **NONE**

Added regression coverage:
- post-write Orca context phase receives dependency classification;
- residual quote failure receives `ORCA_QUOTE_READ_UNAVAILABLE`;
- existing bounded read/Pyth/post-write reconciliation tests remain green.

## Protected boundary

Not authorized:
- opening a PR for this exact head;
- any new World’s Fair live 7/7;
- merge;
- redeploy;
- mainnet;
- repeatability campaign;
- PR #19/#20/#21 mutation.

A fresh exact-head authorization is required before the clean replacement PR can be opened, because the PR workflow will trigger the protected operator-lab live Devnet validation.
