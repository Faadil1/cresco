# CRESCO World’s Fair — PR #17 Pre-Receipt RPC Failure and Preflight Read Repair

Date: 2026-10-03  
Status: **LIVE VALIDATION FAILED / NEW NON-LIVE REPAIR PROVEN**  
Public redeployment: **NOT AUTHORIZED**

## Authorized validation

Repository: `Faadil1/cresco`  
Pull request: #17  
Authorized head: `6af66d051493b4c3d8ce820ee4f615d5723e1ea8`  
Base main: `27300a396d9f3049f19e7aed228acdb2f0bdf9d9`

The authorization covered opening PR #17 and the resulting World’s Fair 7/7 Solana Devnet validation only. It did not authorize merge or public redeployment.

## Non-live checks on PR #17

- root `test` run: `37148741598` — PASS
- `cloudflare-worker-ci` run: `37148741578` — PASS
- no deployment performed

## Live validation result

Workflow: `worlds-fair-operator-lab-live`  
Run: `37148741602`  
Job: `111277964299`  
Result: **FAIL**

Observed before the failure:
- public runtime bootstrap/read completed as `READY`;
- delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`;
- mandate nonce before the canonical sequence: `11`.

Observed failure:
- Solana public Devnet RPC returned repeated HTTP 429 responses;
- underlying client retries were logged at approximately 500 ms, 1 s, 2 s and 4 s;
- the canonical sequence then failed with `WORLD_FAIR_LIVE_RUN_UNCONFIRMED`;
- failure occurred before the scenario receipt was written;
- the receipt verification step was skipped;
- no receipt artifact was uploaded.

Truth boundary:
- the failed job does **not** prove a successful write;
- it also does **not** independently reconcile the complete on-chain effect set;
- because no scenario receipt exists, do not claim zero effects solely from this run;
- no merge or deployment followed.

## Engineering conclusion

The quote-read patch itself was not reached far enough to be live-validated in this run. The new bottleneck is a transient public-RPC failure in the pre-receipt initialization/state-read path.

The live provider performs safe reads before scenario receipt creation, including state, balance and token-account reads. Some of those reads were still using the shorter generic retry budget or library-internal retry behavior.

## New bounded non-live repair

Repository: `Faadil1/cresco`  
Branch: `fix/worlds-fair-preflight-read-backoff-v1`  
Exact head: `494818b67b0e2ab8cdb304c64422e36d89dc67f0`  
Base: exact PR #17 head `6af66d051493b4c3d8ce820ee4f615d5723e1ea8`

The branch preserves the quote-read repair and adds a dedicated bounded preflight/state read profile:
- attempts: `6`;
- base delay: `2 seconds`;
- only read operations are retried.

Covered safe reads include:
- World’s Fair state account batch reads;
- review-account lookup;
- delegate balance read;
- input-vault token account read;
- guardian token account state reads;
- allowance account read;
- public-state vault reads.

The hybrid `getOrCreateAssociatedTokenAccount` operation is deliberately **not** wrapped in a blind retry because it may perform a write when the ATA is absent.

Writes remain non-replayed.

## Non-live proof for the new head

Root workflow:
- run: `37148961794`
- result: **PASS**

The new tests prove:
- the preflight/state read profile is exactly 6 attempts / 2-second base delay;
- transient reads can recover on the sixth bounded attempt.

## Next protected checkpoint

Do not open a PR for `494818b67b0e2ab8cdb304c64422e36d89dc67f0` without fresh exact-head authorization because opening the PR will trigger another real World’s Fair 7/7 Solana Devnet validation.

PR #17 remains unmerged. No public redeployment is authorized.
