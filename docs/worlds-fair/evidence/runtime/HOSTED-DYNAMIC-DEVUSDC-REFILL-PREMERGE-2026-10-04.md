# CRESCO World’s Fair — Dynamic devUSDC Refill Repair

Date: 2026-10-04
Status: **PROVEN NON-LIVE / AWAITING EXPLICIT LIVE VALIDATION AUTHORIZATION**

## Trigger

PR #24 at exact head `a1a25f861c435826c03dd773d6f7fef362f91d0b` opened successfully and consumed the single authorized live validation.

Checks:
- root test `37205911964`: PASS;
- Cloudflare Worker CI `37205912001`: PASS;
- operator-lab live `37205911937`: FAIL;
- additional live workflows: none.

The live run failed before the canonical sequence, during:

`getPublicState({ ensure: true }) -> ensureReady() -> ensureInputVaultFunding()`

Simulation error:

`Transfer: insufficient lamports 35657296, need 101488440`

The current bootstrap hard-coded a `100_000_000` lamport SOL→devUSDC swap whenever the guardian devUSDC balance was insufficient.

Observed runtime after the rejected simulation:
- status: READY;
- mandate version: 14;
- nonce: 13;
- spentThisPeriod: 5800000;
- spentThisPeriodNotionalMicroUsd: 5799848;
- input vault: 1300000;
- output vault: 13498590.

The vault target is `1500000`, so the immediate deficit was only `200000` devUSDC base units.

Failure artifact:
- id `11304259326`;
- digest `sha256:df740ab9b33d9ce0e9b38caf8daedef1eb23d3e22b150ef25e3fd364ceddd2ab`.

Because `runCanonicalSequence()` never began, PR #24 does **not** validate or invalidate the MintInfo retry.

## Dynamic refill repair

Repository: `Faadil1/cresco`
Branch: `fix/worlds-fair-dynamic-devusdc-refill-v1-clean`
Exact head: `1fd7f5fc52d486e5f42d095f7115860b4745ceb5`
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

Topology:
- 1 commit ahead;
- 0 behind;
- directly reconstructed from deployed main;
- no ancestry through PR #19/#20/#21/#22/#23/#24;
- no PR exists.

Behavior:
1. compute the exact devUSDC deficit;
2. read the guardian SOL balance;
3. preserve a bounded `5_000_000` lamport fee/rent reserve;
4. obtain a small read-only SOL→devUSDC probe quote;
5. size the funding input from the quote’s slippage-adjusted minimum output and a 10% safety margin;
6. cap the input at spendable SOL;
7. re-quote the sized input and verify minimum output covers the remaining deficit before any write;
8. fail closed if the available SOL cannot cover the deficit;
9. preserve bounded blockhash recovery and all existing MintInfo/read retry behavior.

No unknown error class was made retryable and no write is blindly retried.

## Non-live proof

Push run: `37206189688`
Result: **PASS**
Tests: **132 / 132 PASS**
Deterministic demo smoke: PASS
Live workflows triggered: **NONE**

## Protected boundary

Not authorized:
- opening a PR for `1fd7f5fc52d486e5f42d095f7115860b4745ceb5`;
- another live Devnet validation;
- merge;
- public redeploy;
- mainnet;
- repeatability;
- mutation of PR #19/#20/#21/#22/#23/#24.
