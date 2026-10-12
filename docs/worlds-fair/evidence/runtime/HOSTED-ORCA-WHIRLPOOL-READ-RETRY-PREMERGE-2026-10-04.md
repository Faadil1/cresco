# CRESCO World’s Fair — PR #25 Dynamic Refill Validation + Whirlpool Read Failure

Date: 2026-10-04
Status: **DYNAMIC REFILL PROVEN / CANONICAL SEQUENCE BLOCKED AT ORCA_CONTEXT / NO RERUN**

## Authorized scope

The user authorized:
- opening one new PR for exact head `1fd7f5fc52d486e5f42d095f7115860b4745ceb5`;
- exactly one World’s Fair 7/7 live validation on Solana Devnet to jointly validate the dynamic devUSDC refill and targeted Orca MintInfo read retry;
- no mutation of PR #19/#20/#21/#22/#23/#24;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`
PR: **#25**
Head: `1fd7f5fc52d486e5f42d095f7115860b4745ceb5`
Base: `1266756fb6a00318618daefe9db3d875387411b5`

PR remains open and unmerged.

## Checks

- root test run `37207143535`: **PASS**
- Cloudflare Worker CI run `37207143531`: **PASS**
- single authorized operator-lab live run `37207143575`: **FAIL**
- live job `111450587632`
- additional live workflows: **NONE**

## What the live run proved

The previous runtime input vault was `1300000` base units against target `1500000`.

PR #25 successfully crossed the bootstrap funding boundary:
- runtimeBefore status: `READY`;
- input vault at runtimeBefore: `1500000`;
- spentThisPeriod at runtimeBefore: `5800000`;
- output vault at runtimeBefore: `13498590`.

Therefore the dynamic SOL→devUSDC refill successfully restored the exact input-vault target without requiring the old hard-coded `100000000` lamport swap.

This is a real bootstrap funding effect. It must not be described as a zero-effect run.

## Canonical-sequence failure boundary

After bootstrap and runtimeBefore capture, the run failed at:

- phase: `ORCA_CONTEXT`
- phase kind: `READ`
- failure class: `DEPENDENCY_FAILURE`
- reason code: `ORCA_CONTEXT_READ_UNAVAILABLE`
- retry policy: `REQUIRES_STATE_RECONCILIATION`

Redacted underlying error:

`Unable to fetch Whirlpool at address at 63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg`

Runtime after:
- status: `READY`;
- spentThisPeriod: `5800000`;
- input vault: `1500000`;
- output vault: `13498590`;
- reconciliation error: none.

No standing action in `runCanonicalSequence()` executed. The MintInfo retry therefore was not exercised by this run.

## Orca source interpretation

Orca’s legacy SDK `WhirlpoolClientImpl.getPool()` calls `ctx.fetcher.getPool(poolAddress, opts)` and raises:

`Unable to fetch Whirlpool at address at ...`

when the fetcher returns no pool account.

Given that this same Devnet pool was successfully read and used in prior live runs, this observed failure is treated as a bounded read-side dependency fetch gap, not as a semantic CRESCO refusal and not as uncertain write confirmation.

## Failure artifact

- artifact id: `11304354063`
- digest: `sha256:2103cb2c265e135235bb694987e8fa213ab92e3f9335df3f579c2e5754957e3b`
- size: `1749 bytes`

## Targeted source-only repair

Repository: `Faadil1/cresco`
Branch: `fix/worlds-fair-orca-whirlpool-read-retry-v1-clean`
Exact head: `28304f9d74ea7c00518ba74cd815c0afc3e7e639`
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

Topology:
- 1 commit ahead;
- 0 behind;
- directly reconstructed from deployed main;
- no ancestry through PR #19/#20/#21/#22/#23/#24/#25;
- no PR exists.

Change:
- add only `Unable to fetch Whirlpool at address at` to the existing bounded transient read classifier;
- preserve the dynamic devUSDC refill;
- preserve MintInfo retry;
- preserve redacted diagnostics;
- do not broaden unknown-error retries;
- do not retry writes.

## Non-live proof

Push test run: `37207328384`
Result: **PASS**
Tests: **134 / 134 PASS**
Deterministic demo smoke: PASS
Live workflows triggered: **NONE**

## Protected boundary

Not authorized:
- opening a PR for `28304f9d74ea7c00518ba74cd815c0afc3e7e639`;
- another live Devnet validation;
- merge;
- public redeploy;
- mainnet;
- repeatability;
- mutation of PR #19/#20/#21/#22/#23/#24/#25.
