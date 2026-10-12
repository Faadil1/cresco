# CRESCO World’s Fair — PR #18 Preflight/State Read Backoff Live Validation

Date: 2026-10-03  
Status: **PROVEN LIVE ON SOLANA DEVNET / NOT YET MERGED OR DEPLOYED PUBLICLY**

## Scope

Repository: `Faadil1/cresco`  
Pull request: #18  
Branch: `fix/worlds-fair-preflight-read-backoff-v1`  
Exact source head: `494818b67b0e2ab8cdb304c64422e36d89dc67f0`  
Base main: `27300a396d9f3049f19e7aed228acdb2f0bdf9d9`

Human authorization covered:
- opening PR #18;
- one resulting World’s Fair 7/7 Solana Devnet validation.

It explicitly did **not** authorize:
- merge;
- public redeployment;
- any action on PR #17.

## CI

PR-triggered checks:
- root `test`: run `37149230534` — **PASS**
- `cloudflare-worker-ci`: run `37149230535` — **PASS**
- no deployment performed

## Live Devnet validation

Workflow: `worlds-fair-operator-lab-live`  
Run: `37149230540`  
Job: `111279373905`  
Conclusion: **PASS**

Bound source:
- PR head: `494818b67b0e2ab8cdb304c64422e36d89dc67f0`
- GitHub pull-request merge ref used by the workflow: `b41b0a509ebfaaedc1bb302d8075fd1c562aa9ca`
- base main: `27300a396d9f3049f19e7aed228acdb2f0bdf9d9`

Runtime:
- network: Solana Devnet
- CRESCO program: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`
- starting Mandate nonce: `11`
- ending Mandate nonce: `12`
- runtime state before sequence: `READY`

The run encountered repeated HTTP 429 throttling from the public Solana Devnet RPC, including a prolonged burst during the live sequence. The bounded read-side recovery logic tolerated the throttling and the canonical run completed successfully.

## Canonical scenario receipt

Receipt validator: `WORLD_FAIR_OPERATOR_LAB_RECEIPT_VALID=PASS`

All seven canonical scenarios were explicitly verified as PASS:
1. `standingAutonomy`
2. `softBoundary`
3. `exactException`
4. `hardBoundary`
5. `evidenceFailure`
6. `rollback`
7. `staleAuthority`

Artifact:
- ID: `11283376180`
- name: `worlds-fair-operator-lab-runtime-receipt`
- artifact SHA-256: `sha256:383773aa09db6d5fe8cd562fc4ef80cb08aac3693181d2b7cdf216f871960f19`
- size: `2476 bytes`

## Engineering interpretation

This exact-head run proves:
- the quote read-backoff repair remains compatible with the full live sequence;
- the preflight/state read-backoff repair survives real public Devnet throttling;
- the complete 7/7 CRESCO→Orca World’s Fair sequence can complete on the exact PR #18 head under the observed 429 conditions;
- write paths remain outside the automatic read-retry wrapper.

This run does **not** prove:
- the public hosted Cloudflare runtime contains this repair;
- post-deploy repeatability;
- mainnet readiness;
- production custody/security;
- external operator demand, WTP or adoption.

## Promotion boundary

PR #18 is now eligible for a separate merge + affected Cloudflare Worker redeployment checkpoint.

Until that separate human authorization is granted and the deployed runtime is verified:
- PR #18 remains unmerged;
- public hosted reliability remains `PARTIAL / INTERMITTENT`;
- judge self-serve repeatability remains unpromoted.

PR #17 remains untouched by this checkpoint.
