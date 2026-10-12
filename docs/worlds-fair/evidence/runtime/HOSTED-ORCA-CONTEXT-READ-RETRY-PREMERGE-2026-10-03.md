# CRESCO World’s Fair — ORCA_CONTEXT Read Retry Repair Pre-Merge

Date: 2026-10-03  
Status: **PROVEN PRE-MERGE / NON-LIVE**  
Fresh Devnet live validation: **NOT EXECUTED**

## Triggering repeatability failure

Post-deploy repeatability workflow:
- run: `37137899070`
- job: `111246075542`
- artifact: `11279122090`
- digest: `sha256:a2fa25508234cc2f8f7adf252468b08c97cf36244d584ce1a4a17bdb951a4dfb`

Attempt 1:
- fresh browser: yes
- 7/7 PASS
- nonce `8 → 9`
- five Explorer links
- zero browser request failures

Attempt 2:
- Runtime Ready before run
- HTTP 503
- response status: UNKNOWN
- failed phase: `ORCA_CONTEXT`
- phase kind: READ
- confirmed effects: 0
- campaign stopped immediately
- attempt 3 was not executed

Evidence:
`evidence/runtime/HOSTED-POSTDEPLOY-REPEATABILITY-3X-ATTEMPT-2026-10-03.md`

## Root cause found in source

Inside `orcaContextState()`:
- `orcaClient.getPool(...)` already used bounded transient read retry;
- `pool.refreshData()` already used bounded transient read retry;
- the Pyth Lazer storage read `rpc.getAccountInfo(PYTH_LAZER_STORAGE_ID, 'confirmed')` did **not**.

This left one network/RPC read inside `ORCA_CONTEXT` outside the safe retry envelope.

## Repair

Product repository:
- `Faadil1/cresco`
- branch: `fix/worlds-fair-orca-context-read-retry-v1`
- exact proven head: `9eb857bb3c369a0ab412977a976c131afac6899f`
- base main: `0ef9dc9618d9cbdfac1e714b7349993f4292aff9`

Changes:
1. wrap Pyth storage `getAccountInfo` inside `withTransientRpcReadRetry`;
2. export the bounded read-retry helper for direct tests;
3. classify residual `ORCA_CONTEXT` read failures as:
   - failure class: `DEPENDENCY_FAILURE`
   - reason: `ORCA_CONTEXT_READ_UNAVAILABLE`
   - recovery: `REQUIRES_STATE_RECONCILIATION`
4. preserve sanitized diagnostics without leaking raw provider details.

The repair does not add blind write retries.

## Exact-head non-live proof

### Root regression

Workflow:
- `test`
- run: `37138454184`
- result: **PASS**

New tests prove:
- transient read failures retry and can recover;
- retry count remains bounded;
- residual ORCA_CONTEXT errors receive a specific sanitized diagnostic.

### Full non-live pre-merge gate

Workflow:
- `worlds-fair-orca-context-premerge`
- run: `37138454256`
- result: **PASS**

Backend/Worker job:
- backend regression: PASS
- backend Cloudflare Worker dry-run: PASS
- no deployment

Web job:
- full web check: PASS
- frontend vinext build: PASS
- frontend Worker packaging dry-run: PASS
- no deployment

## Truth boundary

This proves the source repair and all non-live regressions.

It does **not** yet prove that the intermittent hosted ORCA_CONTEXT failure is eliminated on real Devnet.

Opening a PR that touches `src/worlds-fair-orca-provider.mjs` will trigger the protected World’s Fair live provider workflow. A fresh exact-head human authorization is required before opening that PR.

No merge or public redeployment is authorized by this checkpoint.
