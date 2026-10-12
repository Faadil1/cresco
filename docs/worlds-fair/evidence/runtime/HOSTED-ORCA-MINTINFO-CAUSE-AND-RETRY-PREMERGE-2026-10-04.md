# CRESCO World’s Fair — PR #23 Underlying Orca Quote Cause

Date: 2026-10-04
Status: **CAUSE IDENTIFIED / TARGETED NON-LIVE REPAIR PREPARED / NO MERGE**

## Authorized validation

PR #23:
- repository: `Faadil1/cresco`
- head: `ae53370d3231e13f492ab9b2543fcf1a18ad7352`
- base: `1266756fb6a00318618daefe9db3d875387411b5`
- state: OPEN / UNMERGED

Checks:
- root test `37189936066`: PASS
- Cloudflare Worker CI `37189936104`: PASS
- single authorized live run `37189936070`: FAIL
- live job: `111399823764`
- no additional live workflow triggered

## Exact failure

Failure phase:
`STANDING_2_QUOTE`

Sanitized classification:
- failureClass: `DEPENDENCY_FAILURE`
- reasonCode: `ORCA_QUOTE_READ_UNAVAILABLE`
- retryPolicy: `REQUIRES_STATE_RECONCILIATION`

Captured underlying cause:
`Unable to fetch MintInfo for mint - H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm`

This address is the configured World’s Fair devUSDT output mint.

The same canonical run had already:
- reached READY;
- obtained the first quote;
- executed standing action 1;
- confirmed the first write;
- observed the first write in state;
- obtained standing action 2 Pyth market evidence.

Confirmed effect before failure:
- signature: `Cr3YzVrN9ppUxUDHcdHCJW211chXFp132PLZsRUmAUR5LraSJ5ytDcqgwZ2fSQgvBStLHV8vKQ98QCrQf75DE2Y`

Runtime before:
- spentThisPeriod: `5600000`
- spentThisPeriodNotionalMicroUsd: `5599853`
- input vault: `1500000`
- output vault: `13498590`

Runtime after:
- spentThisPeriod: `5800000`
- spentThisPeriodNotionalMicroUsd: `5799848`
- input vault: `1300000`
- output vault: `13698569`

Observed delta:
- spentThisPeriod: `+200000`
- input vault: `-200000`
- output vault: `+199979`
- nonce unchanged

Partial effect is confirmed. Blind replay remains forbidden.

Failure artifact:
- id: `11298615484`
- digest: `sha256:a9e0173d2ca730a954336e060f2e6c813d4041843e1ab3e3650d288b4d68aa24`

## Source confirmation

Orca legacy SDK quote generation calls `TokenExtensionUtil.buildTokenExtensionContext`, which calls `fetcher.getMintInfos([...], opts)` for the pool mints.

The SDK emits `Unable to fetch MintInfo for mint - <mint>` when a required mint-info read returns no data.

Because the same known World’s Fair mint had already participated successfully in quote 1 during the same run, this exact second-quote failure is classified as a bounded read-dependency miss rather than evidence that the mint itself is invalid.

## Targeted repair

Clean branch:
`fix/worlds-fair-mintinfo-read-retry-v1-clean`

Exact head:
`9bb159f89cd02b47e35a79607f12dffd2df679d1`

Base:
`1266756fb6a00318618daefe9db3d875387411b5`

Topology:
- 1 commit ahead
- 0 behind
- directly from deployed main
- no PR opened

Behavior:
- only the two configured World’s Fair pool mint-info miss messages are promoted to transient read-retry eligibility;
- retries remain bounded by the existing Orca read profile;
- unknown mint-info failures are not promoted;
- no write is retried;
- exhausted known mint-info failures remain fail-closed and diagnostically classified.

Non-live proof:
- push test run `37190098564`: PASS
- live workflows triggered: NONE

## Protected boundary

Not authorized:
- opening a PR for `9bb159f89cd02b47e35a79607f12dffd2df679d1`;
- another live Devnet run;
- merge;
- public redeploy;
- mainnet;
- repeatability;
- mutation of PR #19/#20/#21/#22/#23.
