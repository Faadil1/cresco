# CRESCO World’s Fair — Reliability / Observability Live Validation PASS

Date: 2026-10-03  
Status: **PROVEN LIVE PRE-MERGE**  
Production deployment: **UNCHANGED**

## Exact source

- repository: `Faadil1/cresco`
- PR: #15
- branch: `fix/worlds-fair-live-reliability-observability-v1`
- exact head: `e868b1522c9fa28486777e3805f52a4c5d27093e`
- base main: `f6c71177155ccd3ebeaebb1aff9897aaf1758aac`
- PR state after validation: **Draft / open**

## Protected authorization consumed

The user explicitly authorized:
- opening the PR for this exact head;
- triggering **one** World’s Fair 7/7 live validation on Solana Devnet;
- only to validate the reliability / observability repair.

Not authorized by that action:
- merge;
- public Worker redeployment;
- additional Devnet live runs;
- mainnet or broader execution scope.

## Live validation

Workflow:
- `worlds-fair-operator-lab-live`
- run: `37127681552`
- job: `111216233302`
- result: **SUCCESS**

Artifact:
- id: `11275770747`
- name: `worlds-fair-operator-lab-runtime-receipt`
- digest: `sha256:2764b817a451142177bb944408bf21c0cbccb32f9668e9aa91592378d2f7e8d0`

Observed:
- runtime READY before execution;
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`;
- delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`;
- starting Mandate nonce: `7`;
- final Mandate nonce: `8`;
- receipt schema version: `2`;
- receipt status: **PASS**;
- product state: `WORLD_FAIR_OPERATOR_LAB_LIVE`;
- progress current phase: `COMPLETE`;
- all canonical phases completed;
- six confirmed effects recorded.

## Canonical scenario ledger

1. standing autonomy — PASS
2. soft boundary — PASS / REFUSE / `PythNotionalExceeded`
3. exact exception — PASS
4. hard boundary — PASS / REFUSE / `InvalidOrcaProgram`
5. evidence failure — PASS / REFUSE / `PythMessageInvalid`
6. rollback — PASS / REFUSE / `AmountOutBelowMinimum`
7. stale authority — PASS / REFUSE / `StaleNonce`

Representative confirmed signatures:

- standing #1:
  `YM8HQTVnMrbTXyqdAGsgysejByVY2A496ZnzMxjmhTVD3WmCFdkMtGydZkcKUPitTjrZMTr2PeA49F1HJaoDEM7`
- standing #2:
  `3fHUNZamkyAsW4cuVZRkZLHosSXNSFAYMmf6ZqDwRK8rMLGjBjpXtZ1vgzRG5ss1NvgmoGKrxG4u1Sf8bYuvyLA6`
- exact exception grant:
  `2YWgvmQHvGKP4GpKCSb9c3hBMZmt53YniMNTuziTEAaUw5dkF1DUnhfKjECCBWmbMkLq5SR6Kw9VjqdB7FXoR9TX`
- exact exception execution:
  `29JA3nCzqZj2nBiKxxtBVHh6LvfYKeeFxSSsTpLpQVYL5yJmeVZY8uLRKhjzipVLWLUnpv1Vd8MLV2ePRCGybdTf`
- rollback grant:
  `odEdqN8nYJUKvaJ9xnKH92gT8wScwNENUnBLx9K4yzMnb3Mhv1qn6LL64gtaPnM6WTU2vSe631Xhg8FoMLCG3uF`
- stale-authority policy transition:
  `6NzZaZEpx7sjUqZ8KRA1yd4g3MrC1nVLdjQbevCSTWrcqnFbYGhqm4ieuHrg6GYPQuHZtsFhK1uNQFHnTjbXFqg`

## PR check matrix

All PR checks for the exact head passed:

- `cloudflare-worker-ci` run `37127681543`: PASS
- `test` run `37127681544`: PASS
- `web` run `37127681547`: PASS
- `worlds-fair-operator-lab-live` run `37127681552`: PASS

## Truth boundary

This proves that the reliability / observability repair:
- compiles and bundles;
- preserves backend and frontend regressions;
- can complete the real seven-scenario Devnet sequence at the exact branch head;
- emits the new schema-v2 progress ledger through a successful live run.

It does **not** yet prove:
- the fix is deployed to the public Cloudflare runtime;
- repeatable hosted-browser reliability across multiple post-deploy attempts;
- the prior manual intermittent UNKNOWN is eliminated in production;
- independent external-human use;
- adoption, demand, WTP, mainnet readiness, custody or audited security.

Therefore hosted self-serve remains **PARTIAL / INTERMITTENT** until the exact head is separately authorized for merge/redeploy and then re-proven on the public browser runtime.
