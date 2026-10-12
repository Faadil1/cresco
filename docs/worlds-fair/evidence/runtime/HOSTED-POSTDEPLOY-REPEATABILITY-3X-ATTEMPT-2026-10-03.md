# CRESCO World’s Fair — Post-Deploy Repeatability Attempt

Date: 2026-10-03  
Status: **STOPPED ON FIRST FAILURE**  
Requested live attempts: **3 maximum**  
Executed live attempts: **2**  
Third attempt: **NOT EXECUTED**

## Authorization boundary

The user authorized a bounded repeatability campaign after deployment:
- maximum 3 fresh-browser browser→API→Solana Devnet attempts;
- stop immediately on first UNKNOWN/FAIL;
- no blind replay of uncertain writes;
- no merge, redeploy or mainnet action.

## Workflow

- repository: `Faadil1/cresco-worlds-fair`
- workflow: `hosted-cresco-postdeploy-repeatability-3x`
- run: `37137899070`
- job: `111246075542`
- result: **FAILURE / STOPPED AS DESIGNED**
- artifact: `11279122090`
- digest: `sha256:a2fa25508234cc2f8f7adf252468b08c97cf36244d584ce1a4a17bdb951a4dfb`

## Attempt 1

Fresh browser context: **YES**

Observed:
- Runtime Ready before execution: PASS
- HTTP live run: 200
- receipt: PASS
- canonical scenarios: 7/7 PASS
- starting nonce: 8
- ending nonce: 9
- transaction links visible: 5
- browser request failures: 0

Verdict:
`PASS`

## Attempt 2

Fresh browser context: **YES**

Observed:
- Runtime Ready before execution: PASS
- HTTP live run: 503
- response status: UNKNOWN
- phase: `ORCA_CONTEXT`
- phase kind: `READ`
- failure class: `UNKNOWN_RUNTIME`
- reason code: `WORLD_FAIR_RUNTIME_FAILURE`
- confirmed effects: 0
- partial receipt: null
- browser request failures: 0

Verdict:
`UNKNOWN_OR_FAIL`

Because the failure happened before the live receipt was initialized and before any confirmed effect, the campaign stopped immediately.

## Attempt 3

`NOT EXECUTED`

The stop-on-first-failure boundary worked correctly.

## Engineering finding

The source shows that `ORCA_CONTEXT` already retries:
- `orcaClient.getPool(...)`;
- `pool.refreshData()`.

However, the subsequent Pyth Lazer storage read:

`rpc.getAccountInfo(PYTH_LAZER_STORAGE_ID, 'confirmed')`

was **not** wrapped in the same transient read retry helper.

This is a concrete reliability gap consistent with an intermittent pre-write `ORCA_CONTEXT` failure.

## Truth boundary

The post-deploy repair improved the path enough to pass one fresh-browser 7/7 attempt, but bounded repeatability is **not proven**.

Current status remains:

`HOSTED_SELF_SERVE_PARTIAL__INTERMITTENT_LIVE_RUN`

Next engineering action:
- wrap the Pyth storage account read in safe transient read retry;
- classify residual ORCA_CONTEXT read failure with a specific sanitized reason;
- prove non-live tests;
- require fresh authorization before another live Devnet validation.
