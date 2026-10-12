# CRESCO World’s Fair — Orca Quote Read Backoff Repair Pre-Merge

Date: 2026-10-03  
Status: **PROVEN PRE-MERGE / NON-LIVE**  
Fresh Devnet live validation: **NOT EXECUTED**

## Triggering repeatability failure

Bounded post-deploy campaign after PR #16 deployment:
- workflow run: `37137899070`
- run attempt: `2`
- job: `111258111906`
- artifact: `11280935944`
- digest: `sha256:7f5dabcef33682d4bc5f15e3bf72ce06a198089e87baa643a1cb7d5aff085583`

Attempt 1:
- fresh browser: yes
- 7/7 PASS
- nonce `10 → 11`
- five Explorer links
- zero browser request failures

Attempt 2:
- Runtime Ready before execution
- HTTP 503
- response status: UNKNOWN
- phase: `STANDING_1_QUOTE`
- phase kind: READ
- failure class: `TRANSIENT_RPC`
- reason code: `SOLANA_RPC_TRANSIENT`
- retry policy: `SAFE_RETRY_READ`
- confirmed effects: 0
- attempt 3: not executed

Evidence:
`evidence/runtime/HOSTED-POSTDEPLOY-REPEATABILITY-AFTER-ORCA-RETRY-2026-10-03.md`

## Engineering conclusion

The deployed ORCA_CONTEXT repair worked: the intermittent failure moved past ORCA_CONTEXT.

The next bottleneck occurred during the first Orca quote. The failure was correctly classified as a transient read-side RPC failure and happened before any confirmed write.

The generic read retry budget was:
- attempts: 4;
- base delay: 1.5 seconds;
- total wait before the final attempt: about 9 seconds.

That budget proved insufficient against the observed public Devnet RPC throttling window following a complete 7/7 run.

## Repair source

- repository: `Faadil1/cresco`
- branch: `fix/worlds-fair-orca-quote-read-backoff-v1`
- exact proven head: `6af66d051493b4c3d8ce820ee4f615d5723e1ea8`
- base main: `27300a396d9f3049f19e7aed228acdb2f0bdf9d9`

## Repair

A dedicated bounded read profile is now used for Orca context and quote reads:

- attempts: `6`
- base delay: `2 seconds`
- bounded linear backoff before the sixth/final attempt: `2 + 4 + 6 + 8 + 10 = 30 seconds`

Applied only to read-heavy operations:
- Orca pool load;
- Orca pool refresh;
- Pyth storage account read;
- quote refresh;
- `swapQuoteByInputToken`.

Write paths remain unchanged and are **not** automatically replayed.

Semantic failures still abort on the first attempt.

## Exact-head non-live proof

### Root regression

Workflow:
- `test`
- run: `37142542533`
- result: **PASS**

New tests prove:
- the Orca read profile is exactly 6 attempts / 2-second base delay;
- a transient read can recover on the sixth bounded attempt;
- semantic failures are not retried.

### Full non-live pre-merge gate

Workflow:
- `worlds-fair-orca-quote-read-premerge`
- run: `37142542593`
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

It does **not** yet prove that the observed quote-stage public-RPC failure is eliminated on real Devnet.

Opening a pull request that modifies `src/worlds-fair-orca-provider.mjs` will trigger the protected World’s Fair live provider workflow.

Fresh exact-head human authorization is required before opening that PR.

No merge or public redeployment is authorized by this checkpoint.
