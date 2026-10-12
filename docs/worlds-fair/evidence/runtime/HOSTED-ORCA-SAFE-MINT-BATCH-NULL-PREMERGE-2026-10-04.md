# CRESCO World’s Fair — PR #27 Safe Batch Reads Validation + MintInfo Null Guard

Date: 2026-10-04
Status: **LIVE VALIDATION FAILED AT STANDING_1_QUOTE / NO CURRENT-RUN WRITE / INTERVENING PRIOR STATE ADVANCEMENT OBSERVED**

## Authorized scope

The user authorized:
- opening one new PR for exact head `4a5d9bdf556aa53b9ac668d96348e180ef1de59b`;
- exactly one World’s Fair 7/7 live validation on Solana Devnet to validate safe Orca batch-read ownership plus the Whirlpool, MintInfo and dynamic devUSDC refill fixes;
- no mutation of PR #19/#20/#21/#22/#23/#24/#25/#26;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`
PR: **#27**
Head: `4a5d9bdf556aa53b9ac668d96348e180ef1de59b`
Base: `1266756fb6a00318618daefe9db3d875387411b5`

PR remains open and unmerged.

## Checks

- root test run `37212796164`: **PASS**
- Cloudflare Worker CI run `37212796165`: **PASS**
- single authorized operator-lab live run `37212796167`: **FAIL**
- live job `111467195415`
- additional live workflows: **NONE**

## What PR #27 proved

The raw process-level 429 seen in PR #26 did not recur.

PR #27 produced a normal CRESCO failure receipt, proving that the safe-batch ownership change brought the quote failure back inside CRESCO’s observable failure path.

The run completed:
- `BOOTSTRAP_READY`
- `STATE_LOAD`
- `ORCA_CONTEXT`
- `STANDING_1_MARKET_EVIDENCE`

It then failed at:
- phase: `STANDING_1_QUOTE`
- phase kind: `READ`
- failure class: `DEPENDENCY_FAILURE`
- reason code: `ORCA_QUOTE_READ_UNAVAILABLE`
- retry policy: `REQUIRES_STATE_RECONCILIATION`

Underlying error:
`TypeError: Cannot read properties of null (reading 'tlvData')`

No current-run write was confirmed:
- confirmedEffects: empty
- runtimeBefore spentThisPeriod: `6000000`
- runtimeAfter spentThisPeriod: `6000000`
- runtimeBefore input vault: `1500000`
- runtimeAfter input vault: `1500000`
- runtimeBefore output vault: `13698569`
- runtimeAfter output vault: `13698569`
- reconciliation error: none

Therefore PR #27 itself had no canonical sequence write effect.

## Intervening state advancement reconciliation

PR #25 ended with:
- spentThisPeriod: `5800000`
- spentThisPeriodNotionalMicroUsd: `5799848`
- output vault: `13498590`

PR #27 began with:
- spentThisPeriod: `6000000`
- spentThisPeriodNotionalMicroUsd: `5999838`
- output vault: `13698569`

Observed intervening delta:
- spentThisPeriod: `+200000`
- spentThisPeriodNotionalMicroUsd: `+199990`
- output vault: `+199979`

This delta is consistent with one standing `200000` swap.

The only known intervening protected live run in this controlled sequence was PR #26 run `37208383952`, which terminated on a raw process-level 429 before a receipt was persisted.

Canonical truth:
- the state advancement itself is **OBSERVED** at PR #27 runtimeBefore;
- attribution to PR #26 is **INFERRED_HIGH_CONFIDENCE**, not receipt-proven;
- do not claim a PR #26 signature or exact phase;
- do not claim PR #26 zero-effect.

## Artifact

- artifact id: `11306858165`
- digest: `sha256:b24c35fdebc13a28e657dd193a6b2584dc8bbfbf02175022be9df970e3873eae`
- size: `1983 bytes`

## Root cause of current PR #27 failure

The CRESCO safe batch wrapper converted Orca `getMintInfos()` into sequential `getMintInfo()` calls, but initially preserved a `null` result in the returned Map.

Orca TokenExtensionUtil later assumes the MintInfo Map entry is non-null and accesses `tlvData`, producing the observed TypeError.

This is a wrapper semantic mismatch, not a write failure.

## Targeted source-only repair

Repository: `Faadil1/cresco`
Branch: `fix/worlds-fair-orca-safe-mint-batch-null-v1-clean`
Exact head: `16f6374c6fbec1c9c39c0129c40f9f914cbf7a6f`
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

Topology:
- 1 commit ahead;
- 0 behind;
- directly reconstructed from deployed main;
- no ancestry through PR #19/#20/#21/#22/#23/#24/#25/#26/#27;
- no PR exists.

Repair:
- preserve safe unit-read ownership for MintInfo and TickArray batch paths;
- when a unit MintInfo read returns `null`, throw the exact SDK-style
  `Unable to fetch MintInfo for mint - <mint>` error;
- let the existing bounded outer CRESCO read retry own recovery;
- preserve nullable TickArray semantics, because Orca explicitly interpolates uninitialized tick arrays;
- preserve dynamic refill, Whirlpool retry, MintInfo retry, redacted diagnostics and no-write-retry semantics.

## Non-live proof

Push run: `37212992396`
Result: **PASS**
Tests: **139 / 139 PASS**
Deterministic demo smoke: PASS
Live workflows triggered: **NONE**

## Protected boundary

Not authorized:
- opening a PR for `16f6374c6fbec1c9c39c0129c40f9f914cbf7a6f`;
- another live Devnet validation;
- merge;
- public redeploy;
- mainnet;
- repeatability;
- mutation of PR #19/#20/#21/#22/#23/#24/#25/#26/#27.
