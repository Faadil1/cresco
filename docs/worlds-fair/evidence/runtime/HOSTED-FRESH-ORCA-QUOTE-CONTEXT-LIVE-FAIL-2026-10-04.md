# CRESCO World’s Fair — PR #22 Fresh Orca Quote Context Validation

Date: 2026-10-04
Status: **LIVE VALIDATION FAILED AT STANDING_2_QUOTE / PARTIAL EFFECT CONFIRMED / NO MERGE**

## Authorized scope

The user authorized:
- opening one new PR for exact head `90e1431dd1db975497d81e7cf3d223172aa3437a`;
- exactly one World’s Fair 7/7 live validation on Solana Devnet;
- no mutation of PR #19/#20/#21;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`
PR: **#22**
Head: `90e1431dd1db975497d81e7cf3d223172aa3437a`
Base: `1266756fb6a00318618daefe9db3d875387411b5`
Synthetic PR merge ref: `9465d251e6c7f478c7b9f4f70f540de99d1c7d72`

Topology:
- 1 commit ahead;
- 0 behind;
- directly based on deployed main;
- no ancestry through PR #19/#20/#21.

PR remains open and unmerged.

## Checks

- root test run `37186952848`: **PASS**
- Cloudflare Worker CI run `37186952837`: **PASS**
- protected operator-lab live run `37186952836`: **FAIL**
- live job `111390801070`
- additional live workflows: **NONE**

The old `worlds-fair-orca-devnet-proof` workflow remained manual-only and did not auto-trigger.

## Exact live failure

Runtime before canonical sequence:
- status: `READY`
- network: `solana-devnet`
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- Mandate version: `14`
- Mandate nonce: `13`
- spentThisPeriod: `5400000`
- spentThisPeriodNotionalMicroUsd: `5399862`
- input vault: `1500000`
- output vault: `13098632`

Completed phases:
- `BOOTSTRAP_READY`
- `STATE_LOAD`
- `ORCA_CONTEXT`
- `STANDING_1_MARKET_EVIDENCE`
- `STANDING_1_QUOTE`
- `STANDING_1_EXECUTE`
- `STANDING_1_EFFECT_OBSERVED`
- `STANDING_2_MARKET_EVIDENCE`

Failure:
- phase: `STANDING_2_QUOTE`
- phase kind: `READ`
- failure class: `DEPENDENCY_FAILURE`
- reason code: `ORCA_QUOTE_READ_UNAVAILABLE`
- retry policy: `REQUIRES_STATE_RECONCILIATION`
- message: `CRESCO could not obtain a fresh Orca quote from the current Devnet pool state.`

Confirmed effect before failure:
- label: `standingAutonomy.1`
- signature: `5hhyWuKa5udxxv5rersaoNKsoDa6bSuFZ8zKfLMVQrTbcMYd3fSpp6ypYbpRBxncZdNVUKtfnr3UrYGz48WQMZ86`

Runtime after failure:
- status: `READY`
- Mandate version: `14`
- Mandate nonce: `13`
- spentThisPeriod: `5600000`
- spentThisPeriodNotionalMicroUsd: `5599853`
- input vault: `1300000`
- output vault: `13298611`
- reconciliation error: none

Observed delta:
- spentThisPeriod: `+200000`
- spentThisPeriodNotionalMicroUsd: `+199991`
- input vault: `-200000`
- output vault: `+199979`
- Mandate nonce: unchanged

The partial effect is confirmed. Zero-effects is false and blind replay is forbidden.

## Failure artifact

- artifact id: `11297430734`
- artifact name: `worlds-fair-operator-lab-runtime-receipt`
- digest: `sha256:b415e5976d04ef90040a81c8e8412f653df1f5a9b2f9c72e47b1fd9078035ffe`
- size: `2051 bytes`

## Engineering interpretation

PR #22 removed the explicit post-write `ORCA_CONTEXT_AFTER_STANDING_1` refresh failure seen in PR #21.

The failure returned to `STANDING_2_QUOTE`, even though:
- the first write was confirmed;
- the state effect was observed before the second quote;
- Pyth evidence for standing action 2 succeeded;
- quote generation used a newly reacquired pool and `IGNORE_CACHE`.

Orca’s legacy SDK implementation of `swapQuoteByInputToken` itself refetches the Whirlpool and quote-side accounts using the provided fetcher/options. Therefore another generic “fresh context” rewrite is not justified without observing the underlying quote exception.

Next source-only step:
- persist a redacted structural summary of the underlying quote/read exception into the failure artifact;
- do not broaden read retries to unknown semantic errors;
- do not trigger another live validation until that diagnostic head is separately authorized.

## Protected boundary

- PR #22: OPEN / UNMERGED
- PR #19/#20/#21: untouched
- merge authorization: NOT GRANTED
- public redeploy: NOT AUTHORIZED
- mainnet: NOT AUTHORIZED
- repeatability: NOT AUTHORIZED
- another live validation: NOT AUTHORIZED
