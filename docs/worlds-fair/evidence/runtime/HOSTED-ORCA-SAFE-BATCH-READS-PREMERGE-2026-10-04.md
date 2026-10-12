# CRESCO World’s Fair — PR #26 Raw 429 Escape + Safe Orca Batch Read Repair

Date: 2026-10-04
Status: **LIVE VALIDATION FAILED ON RAW RPC 429 / EXACT INTERNAL PHASE NOT RECEIPT-PROVEN / NO RERUN**

## Authorized scope

The user authorized:
- opening one new PR for exact head `28304f9d74ea7c00518ba74cd815c0afc3e7e639`;
- exactly one World’s Fair 7/7 live validation on Solana Devnet to jointly validate the targeted Orca Whirlpool retry, MintInfo retry, and dynamic devUSDC refill;
- no mutation of PR #19/#20/#21/#22/#23/#24/#25;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`
PR: **#26**
Head: `28304f9d74ea7c00518ba74cd815c0afc3e7e639`
Base: `1266756fb6a00318618daefe9db3d875387411b5`
Synthetic PR merge ref: `75ac8f5a8de2c23125c2347738a2936360bafe7c`

PR remains open and unmerged.

## Checks

- root test run `37208383889`: **PASS**
- Cloudflare Worker CI run `37208383842`: **PASS**
- single authorized operator-lab live run `37208383952`: **FAIL**
- live job `111454304677`
- additional live workflows: **NONE**

## Live failure

The smoke runner successfully printed:
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- Delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`
- nonce before: `13`
- `WORLD_FAIR_OPERATOR_LAB_RUNTIME=READY`

The process then terminated on a raw Solana RPC error:

`429 Too Many Requests: Connection rate limits exceeded`

The exception escaped directly from `@solana/web3.js` and terminated Node before the World Fair failure wrapper could persist a receipt.

Therefore:
- no failure receipt was produced;
- no artifact was uploaded;
- the exact internal World Fair phase is **not receipt-proven**;
- no rerun is authorized.

Because the canonical receipt is initialized only after `ORCA_CONTEXT`, this failure occurred before receipt initialization. Do not overclaim a more precise phase from the available evidence.

## Upstream mechanism

CRESCO already constructs `WhirlpoolContext` with the bounded `readRpc`.

The remaining escape comes from Orca legacy common-sdk batch reads.

Upstream `getMultipleAccounts()` creates each chunk using:

`new Promise<void>(async (resolve) => { await connection.getMultipleAccountsInfo(...) ... })`

A rejection thrown inside that async Promise executor can escape the Promise expected by the caller and become an unhandled process-level failure.

Orca quote generation uses affected batch paths including:
- `fetcher.getMintInfos(...)` from TokenExtensionUtil;
- `fetcher.getTickArrays(...)` from SwapUtils.

This explains why a raw 429 can bypass CRESCO’s outer bounded retry despite using `readRpc`.

## Safe batch-read repair

Repository: `Faadil1/cresco`
Branch: `fix/worlds-fair-orca-safe-batch-reads-v1-clean`
Exact head: `4a5d9bdf556aa53b9ac668d96348e180ef1de59b`
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

Topology:
- 1 commit ahead;
- 0 behind;
- directly reconstructed from deployed main;
- no ancestry through PR #19/#20/#21/#22/#23/#24/#25/#26;
- no PR exists.

Repair:
- preserve Orca’s default fetcher for ordinary reads;
- proxy only `getMintInfos()` into controlled unit `getMintInfo()` calls;
- proxy only `getTickArrays()` into controlled unit `getTickArray()` calls;
- preserve all unrelated fetcher methods and their `this` binding;
- keep dynamic devUSDC refill;
- keep targeted Whirlpool and MintInfo retry classes;
- keep redacted diagnostics;
- no node_modules patch;
- no write retry;
- no broader unknown-error retry.

The unit read paths used by Orca’s SimpleAccountFetcher catch connection errors and return null, allowing the SDK to produce the known semantic read messages that CRESCO’s bounded outer retry owns.

## Non-live proof

Push run: `37208646758`
Result: **PASS**
Tests: **137 / 137 PASS**
Deterministic demo smoke: PASS
Live workflows triggered: **NONE**

## Protected boundary

Not authorized:
- opening a PR for `4a5d9bdf556aa53b9ac668d96348e180ef1de59b`;
- another live Devnet validation;
- merge;
- public redeploy;
- mainnet;
- repeatability;
- mutation of PR #19/#20/#21/#22/#23/#24/#25/#26.
