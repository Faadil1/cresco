# CRESCO World’s Fair — PR #28 Pool-Null Quote Failure + Targeted Retry Repair

Date: 2026-10-04
Status: **LIVE VALIDATION FAILED AT STANDING_2_QUOTE / PARTIAL EFFECT CONFIRMED / NO RERUN**

## Authorized scope

The user authorized:
- opening one new PR for exact head `16f6374c6fbec1c9c39c0129c40f9f914cbf7a6f`;
- exactly one World’s Fair 7/7 live validation on Solana Devnet to validate safe MintInfo-null handling, safe Orca batch reads, targeted Whirlpool/MintInfo retries, and dynamic devUSDC refill;
- no mutation of PR #19/#20/#21/#22/#23/#24/#25/#26/#27;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`
PR: **#28**
Head: `16f6374c6fbec1c9c39c0129c40f9f914cbf7a6f`
Base: `1266756fb6a00318618daefe9db3d875387411b5`

PR remains open and unmerged.

## Checks

- root test run `37213621783`: **PASS**
- Cloudflare Worker CI run `37213621761`: **PASS**
- single authorized operator-lab live run `37213621817`: **FAIL**
- live job `111469600254`
- additional live workflows: **NONE**

## Live progress

The run completed:
- `BOOTSTRAP_READY`
- `STATE_LOAD`
- `ORCA_CONTEXT`
- `STANDING_1_MARKET_EVIDENCE`
- `STANDING_1_QUOTE`
- `STANDING_1_EXECUTE`
- `STANDING_1_EFFECT_OBSERVED`
- `STANDING_2_MARKET_EVIDENCE`

Confirmed current-run effect:
- label: `standingAutonomy.1`
- signature: `3YaqYzrNekRQ2MmbuLCmjg1y7h7uX7y84griPXSuB4qmuQLP7agC4fbAEQc8qMq6PS4Lnb1tq55iSPpZBaAAVSfR`

Failure:
- phase: `STANDING_2_QUOTE`
- phase kind: `READ`
- failure class: `DEPENDENCY_FAILURE`
- reason code: `ORCA_QUOTE_READ_UNAVAILABLE`
- retry policy: `REQUIRES_STATE_RECONCILIATION`

Underlying error:

`Invariant failed: Whirlpool data not found`

Runtime before:
- spentThisPeriod: `6000000`
- spentThisPeriodNotionalMicroUsd: `5999838`
- input vault: `1500000`
- output vault: `13698569`
- nonce: `13`

Runtime after:
- spentThisPeriod: `6200000`
- spentThisPeriodNotionalMicroUsd: `6199831`
- input vault: `1300000`
- output vault: `13898548`
- nonce: `13`
- reconciliation error: none

Observed current-run delta:
- spentThisPeriod: `+200000`
- spentThisPeriodNotionalMicroUsd: `+199993`
- input vault: `-200000`
- output vault: `+199979`

Zero-effects is false. Blind replay is forbidden.

## Failure artifact

- artifact id: `11307118527`
- digest: `sha256:e8b5014c4eafbdec4ad9f5c1a8a9454e1dfad8260bdd6ff335c1aa986eb68ccc`
- size: `2065 bytes`

## Orca source interpretation

Orca legacy `swapQuoteByInputToken()` refetches Whirlpool data through the supplied fetcher and then executes:

`invariant(!!whirlpoolData, "Whirlpool data not found")`

Therefore this exact invariant is a read-side dependency fetch gap when the known live pool returns null, not a CRESCO semantic refusal and not an uncertain write confirmation.

## Targeted source-only repair

Repository: `Faadil1/cresco`
Branch: `fix/worlds-fair-orca-quote-pool-null-retry-v1-clean`
Exact head: `b77b5378c6088c50c2912a4b4254c43b28f549fd`
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

Topology:
- 1 commit ahead;
- 0 behind;
- directly reconstructed from deployed main;
- no ancestry through PR #19/#20/#21/#22/#23/#24/#25/#26/#27/#28;
- no PR exists.

Repair:
- add only `Invariant failed: Whirlpool data not found` to the existing bounded transient read classifier;
- preserve safe MintInfo/TickArray unit-read ownership;
- preserve null-MintInfo SDK-style surfacing;
- preserve targeted Whirlpool/MintInfo retries;
- preserve dynamic devUSDC refill;
- preserve redacted diagnostics;
- no write retry;
- no broad invariant retry.

## Non-live proof

Push test run: `37213823352`
Result: **PASS**
Tests: **141 / 141 PASS**
Deterministic demo smoke: PASS
Live workflows triggered: **NONE**

## Protected boundary

Not authorized:
- opening a PR for `b77b5378c6088c50c2912a4b4254c43b28f549fd`;
- another live Devnet validation;
- merge;
- public redeploy;
- mainnet;
- repeatability;
- mutation of PR #19/#20/#21/#22/#23/#24/#25/#26/#27/#28.
