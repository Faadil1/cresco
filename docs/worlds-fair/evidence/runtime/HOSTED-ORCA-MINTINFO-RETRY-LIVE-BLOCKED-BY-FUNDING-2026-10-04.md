# CRESCO World’s Fair — PR #24 MintInfo Retry Validation Blocked by Bootstrap Funding

Date: 2026-10-04
Status: **LIVE VALIDATION BLOCKED BEFORE CANONICAL SEQUENCE / NO RERUN**

## Authorized scope

The user authorized:
- opening one new PR for exact head `a1a25f861c435826c03dd773d6f7fef362f91d0b`;
- exactly one World’s Fair 7/7 live validation on Solana Devnet to validate the targeted Orca MintInfo retry;
- no mutation of PR #19/#20/#21/#22/#23;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`
PR: **#24**
Head: `a1a25f861c435826c03dd773d6f7fef362f91d0b`
Base: `1266756fb6a00318618daefe9db3d875387411b5`
Synthetic PR merge ref: `d081f6b6b6c6844bc2babf065d843418e2d40d53`

PR remains open and unmerged.

## Checks

- root test run `37205911964`: **PASS**
- Cloudflare Worker CI run `37205912001`: **PASS**
- single authorized operator-lab live run `37205911937`: **FAIL**
- live job `111446932307`
- additional live workflows: **NONE**

## Failure boundary

The run failed before `runtimeBefore` and before `runCanonicalSequence()`, inside:

`getPublicState({ ensure: true }) -> ensureReady() -> ensureInputVaultFunding()`

The bootstrap SOL→devUSDC funding transaction failed simulation:

`Transfer: insufficient lamports 35657296, need 101488440`

This came from the current hard-coded funding swap input of `100_000_000` lamports plus transaction/account overhead.

The existing shared runtime state was still readable after the failed bootstrap:
- status: `READY`
- network: `solana-devnet`
- program: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- mandate version: `14`
- mandate nonce: `13`
- spentThisPeriod: `5800000`
- spentThisPeriodNotionalMicroUsd: `5799848`
- input vault: `1300000`
- output vault: `13498590`

The canonical sequence did not begin, so this run does **not** validate or invalidate the MintInfo retry behavior.

The bootstrap swap itself was rejected in simulation. No CRESCO shared runtime-state change is observed in this run.

## Artifact

- artifact id: `11304259326`
- digest: `sha256:df740ab9b33d9ce0e9b38caf8daedef1eb23d3e22b150ef25e3fd364ceddd2ab`
- size: `1382 bytes`

## Engineering implication

The current bootstrap always quotes/swaps `100_000_000` lamports when the guardian devUSDC balance is insufficient, even when the vault deficit is much smaller.

For this run:
- vault target: `1500000` base units;
- observed vault: `1300000`;
- actual deficit: only `200000` devUSDC base units.

The next source-only repair should size the SOL→devUSDC bootstrap dynamically from:
1. the exact devUSDC deficit;
2. a live read-only Orca quote;
3. the quote’s slippage-adjusted minimum output;
4. the guardian’s actual SOL balance minus a bounded fee/rent reserve.

No live rerun is authorized.

## Protected boundary

- PR #24: OPEN / UNMERGED
- PR #19/#20/#21/#22/#23: untouched
- merge: NOT AUTHORIZED
- public redeploy: NOT AUTHORIZED
- mainnet: NOT AUTHORIZED
- repeatability: NOT AUTHORIZED
- another live validation: NOT AUTHORIZED
