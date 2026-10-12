# CRESCO World’s Fair — Post-Deploy Repeatability Attempt 3 Client Timeout

Date: 2026-10-03  
Status: **STOPPED ON FIRST FAILURE / CLIENT HTTP TIMEOUT / NO RESPONSE RECEIPT**

## Authorized bounded campaign

The user authorized the already-announced post-deploy repeatability checkpoint.

Canonical bounds:
- maximum 3 fresh-browser live attempts;
- stop on first UNKNOWN/FAIL;
- no blind replay of uncertain writes;
- no mainnet;
- no new merge/redeploy or product-scope change.

Existing workflow:
- repository: `Faadil1/cresco-worlds-fair`
- workflow: `hosted-cresco-postdeploy-repeatability-3x`
- run: `37137899070`
- run attempt: `3`
- job: `111286432675`
- result: **FAILURE / STOPPED**

## Attempt 1

Fresh browser context: **YES**

Observed before click:
- public World’s Fair surface loaded;
- runtime reached `Ready`.

Observed after click:
- the harness waited for the public POST response;
- no HTTP response event was observed within `240000 ms`;
- Playwright ended with `page.waitForResponse: Timeout 240000ms exceeded`;
- no `attempt-1-response.json` was produced;
- no PASS receipt was produced;
- attempt 2 and attempt 3 were not executed.

Artifact:
- id: `11284247154`
- digest: `sha256:9441331039e847dd1c6e4036b0ad6434c575b6719ce0a800ad8aa636c542619a`
- contents observed: `repeatability-summary.json` and `attempt-1-01-ready.png`;
- the summary remained `IN_PROGRESS` because the timeout occurred outside the workflow’s structured non-PASS response branch.

## Read-only reconciliation

The public runtime was read after the timeout and remained:
- status: `READY`;
- network: `solana-devnet`;
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`;
- Mandate nonce: `12`;
- `spentThisPeriod`: `3650000`;
- `spentThisPeriodNotionalMicroUsd`: `3649888`;
- input vault: `350000` base units;
- output vault: `11348815` base units.

These observable invariants match the read-only checkpoint captured while the campaign was pending. No nonce progression, period-counter change, or vault-balance change was observed across those checkpoints.

Truth boundary:
- no on-chain effect is confirmed by the failed campaign;
- no absolute “zero effects” claim is made because there is no response/partial receipt/signature set from the timed-out POST;
- the outcome remains **UNKNOWN with no observable mutation on the reconciled invariants**;
- no automatic replay is permitted.

## Root-cause finding

The public frontend currently aborts the World’s Fair POST after `120000 ms` using `AbortSignal.timeout(120_000)`.

The repeatability harness waits up to `240000 ms` specifically for the HTTP response event. If the browser client aborts first, the harness can spend the remaining window waiting for a response event that will never arrive and then exits before writing a structured failure snapshot.

The deployed World’s Fair read recovery also currently layers:
1. `@solana/web3.js` built-in HTTP 429 rate-limit retries; and
2. CRESCO’s explicit six-attempt / 2-second-base read retry policy.

This creates a hidden compounded delay under sustained public-RPC throttling. The read policy is therefore not as tightly time-bounded as the outer CRESCO retry profile alone suggests.

## Safe next repair

Prepare a source-only repair that:
- gives safe reads a dedicated Solana connection with `disableRetryOnRateLimit: true`;
- retains the existing bounded CRESCO read retry as the single explicit read retry owner;
- leaves write-capable operations on the existing write connection;
- does not blindly retry writes;
- keeps the 120-second client fail-closed boundary;
- separately repairs the repeatability harness so a client/no-response timeout is recorded as structured UNKNOWN with read-only reconciliation rather than leaving the summary `IN_PROGRESS`;
- removes any workflow trigger that could cause an unintended live run merely from merging the harness repair.

No further Devnet execution is authorized by this evidence.
