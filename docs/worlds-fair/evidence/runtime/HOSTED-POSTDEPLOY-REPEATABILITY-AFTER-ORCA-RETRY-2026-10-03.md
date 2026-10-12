# CRESCO World’s Fair — Post-Deploy Repeatability After ORCA_CONTEXT Retry

Date: 2026-10-03  
Status: **STOPPED ON FIRST FAILURE / NEXT READ BOTTLENECK OBSERVED**

## Authorized campaign

The user authorized one bounded repeatability campaign:
- maximum 3 fresh-browser live attempts;
- stop on first UNKNOWN/FAIL;
- no blind replay of uncertain writes;
- no merge/redeploy/mainnet action.

The existing bounded workflow was re-run as attempt 2 of run `37137899070`.

Workflow:
- repository: `Faadil1/cresco-worlds-fair`
- run: `37137899070`
- run attempt: `2`
- job: `111258111906`
- result: **FAILURE / STOPPED AS DESIGNED**
- artifact: `11280935944`
- digest: `sha256:7f5dabcef33682d4bc5f15e3bf72ce06a198089e87baa643a1cb7d5aff085583`

## Attempt 1

Fresh browser context: **YES**

Observed:
- runtime Ready before execution;
- HTTP live run: 200;
- receipt: PASS;
- canonical scenarios: 7/7 PASS;
- starting nonce: `10`;
- ending nonce: `11`;
- transaction links visible: 5;
- browser request failures: 0.

Verdict:
`PASS`

## Attempt 2

Fresh browser context: **YES**

Observed:
- runtime Ready before execution;
- HTTP live run: 503;
- response status: UNKNOWN;
- phase: `STANDING_1_QUOTE`;
- phase kind: `READ`;
- failure class: `TRANSIENT_RPC`;
- reason code: `SOLANA_RPC_TRANSIENT`;
- retry policy: `SAFE_RETRY_READ`;
- confirmed effects: `0`.

Public message:
`Solana Devnet RPC was temporarily rate-limited or unavailable.`

Verdict:
`UNKNOWN_OR_FAIL`

## Attempt 3

`NOT EXECUTED`

The stop-on-first-failure boundary worked correctly.

## Interpretation

The deployed PR #16 repair successfully moved the intermittent failure beyond `ORCA_CONTEXT`.

The remaining failure occurred later during the first Orca quote and was correctly classified as a transient **read-side** RPC failure before any confirmed write.

Current quote code already retries:
- `pool.refreshData()`;
- `swapQuoteByInputToken(...)`.

However the generic retry budget is currently:
- attempts: 4;
- base delay: 1.5 seconds;
- linear waiting budget before the final attempt: approximately 9 seconds.

After one complete 7/7 run, this proved insufficient against the public Devnet RPC throttling window.

## Next safe repair

Increase the retry/backoff budget **only for read-heavy Orca context and quote operations**, while:
- keeping retries bounded;
- keeping writes non-replayed;
- preserving fail-closed UNKNOWN if the read budget is exhausted;
- preserving the 120-second browser live-run boundary.

No further Devnet execution is authorized by this receipt.

Current hosted self-serve status remains:

`PARTIAL_INTERMITTENT_LIVE_RUN`
