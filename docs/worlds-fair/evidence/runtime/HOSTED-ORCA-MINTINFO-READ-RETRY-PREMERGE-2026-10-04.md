# CRESCO World’s Fair — Orca MintInfo Read Retry Repair

Date: 2026-10-04
Status: **PROVEN NON-LIVE / AWAITING EXPLICIT LIVE VALIDATION AUTHORIZATION**

## Root cause captured by PR #23

PR #23:
- branch: `fix/worlds-fair-quote-cause-diagnostic-v1-clean`
- exact head: `ae53370d3231e13f492ab9b2543fcf1a18ad7352`
- base: `1266756fb6a00318618daefe9db3d875387411b5`
- root test: PASS
- Cloudflare Worker CI: PASS
- single authorized live run: `37189936070` -> FAIL
- live job: `111399823764`
- artifact: `11298615484`
- digest: `sha256:a9e0173d2ca730a954336e060f2e6c813d4041843e1ab3e3650d288b4d68aa24`

The redacted underlying error captured at `STANDING_2_QUOTE` was:

`Unable to fetch MintInfo for mint - H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm`

That mint is the World’s Fair devUSDT output mint.

Orca source confirms this error is raised when its fetcher returns no MintInfo for one of the pool mints. This is a read-side dependency fetch failure, not a semantic policy refusal and not an uncertain write confirmation.

Confirmed write before failure:
- label: `standingAutonomy.1`
- signature: `Cr3YzVrN9ppUxUDHcdHCJW211chXFp132PLZsRUmAUR5LraSJ5ytDcqgwZ2fSQgvBStLHV8vKQ98QCrQf75DE2Y`

Runtime delta:
- spentThisPeriod: `5600000 -> 5800000`
- spentThisPeriodNotionalMicroUsd: `5599853 -> 5799848`
- input vault: `1500000 -> 1300000`
- output vault: `13298611 -> 13498590`
- mandate nonce unchanged.

Zero-effects is false. Blind replay is forbidden.

## Targeted repair

Repository: `Faadil1/cresco`
Branch: `fix/worlds-fair-orca-mintinfo-read-retry-v1-clean`
Exact head: `a1a25f861c435826c03dd773d6f7fef362f91d0b`
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

Topology:
- 1 commit ahead;
- 0 behind;
- directly reconstructed from deployed main;
- no ancestry through PR #19/#20/#21/#22/#23;
- no PR exists.

Change:
- add only `Unable to fetch MintInfo for mint` to the existing bounded transient read classification;
- reuse the existing bounded read retry profile;
- preserve all fail-closed semantics;
- preserve redacted underlying-error diagnostics;
- no broader unknown-error retry;
- no write retry.

Regression coverage:
- MintInfo fetch gaps can recover within bounded read retries;
- persistent MintInfo fetch gaps stop at the configured attempt bound.

## Non-live proof

Push run: `37203306546`
Result: **PASS**
Live workflows triggered: **NONE**

## Protected boundary

Not authorized:
- PR opening for `a1a25f861c435826c03dd773d6f7fef362f91d0b`;
- another World’s Fair live validation;
- merge;
- redeploy;
- mainnet;
- repeatability;
- mutation of PR #19/#20/#21/#22/#23.
