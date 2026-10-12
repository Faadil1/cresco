# CRESCO Reality Ledger

Date: 2026-10-02  
Status: ACTIVE

## Purpose

Keep product claims weaker than or equal to actual evidence.

Allowed evidence labels:
- LIVE
- LOCAL
- LOCAL_STUB
- PRESEEDED
- SIMULATED
- PARTIAL
- NOT_IMPLEMENTED

Truth labels:
- OBSERVED
- INFERRED
- UNKNOWN

## Current World’s Fair reality

| Claim / capability | Truth | Evidence state | Current note |
|---|---|---|---|
| Stocklana baseline Solana Devnet capital-path proof exists | OBSERVED | LIVE/BASELINE | Proven in original CRESCO repo/runtime; not equivalent to World’s Fair live product |
| Standing vs exceptional authority semantics exist in baseline | OBSERVED | LOCAL/LIVE-BASELINE | Exact one-time allowance path exists for current specialized action model |
| World’s Fair final wedge selected | OBSERVED | LOCAL | Locked 2026-10-01 as delegated trading / execution-bound delegated capital authority under explicit validation gap |
| Delegated Capital Authority is validated by users | UNKNOWN | PARTIAL | Still not validated by target operators; Concept Lock proceeded under explicit human validation-gap override |
| World’s Fair Live Core Loop exists | OBSERVED | LIVE | Proven on Solana Devnet and strengthened in bound workflow run `37037374212`; receipt: `evidence/runtime/FIRST-LIVE-VERTICAL-SLICE-2026-10-02.md` |
| Load-bearing World’s Fair trading integration exists | OBSERVED | LIVE | CRESCO program `7pgPuPZ…` executes through Orca Whirlpools Devnet pool `63cMwv…`; Pyth evidence is load-bearing where claimed |
| Real execution consequence exists | OBSERVED | LIVE | Standing swaps change Devnet state; exact exception executes once; failed Orca swap rolls back without consuming authority/counters |
| Organic adoption exists | UNKNOWN | NOT_IMPLEMENTED | Outreach/interviews do not equal adoption |
| x402 is part of CRESCO | UNKNOWN | N/A | Not currently in scope |
| LIVE_GATEWAY settlement exists | UNKNOWN | N/A | No load-bearing external payment gateway in current scope |
| Technical Reality Check for locked World’s Fair vertical | OBSERVED | LOCAL | PASS_WITH_BOUNDED_DELTA; no venue integration built yet |
| New World’s Fair on-chain runtime exists | OBSERVED | LIVE | Solana Devnet program `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`; not yet a judge-facing public product surface |
| Shared World’s Fair product core exists | OBSERVED | LIVE | Reusable server-side provider executed 7/7 canonical consequences live in run `37083019145`; receipt: `evidence/runtime/WORLDS-FAIR-OPERATOR-LAB-LIVE-2026-10-02.md` |
| Public World’s Fair v0.3 runtime GET exists | OBSERVED | LIVE | Cloudflare Worker deployment from merge `fa26ff0…` returned HTTP 200 with exact Program ID and program SHA; evidence: `HOSTED-PUBLIC-RUNTIME-FIRST-ATTEMPT-2026-10-02.md` |
| Public World’s Fair v0.3 live POST is reliable | OBSERVED | PARTIAL / INTERMITTENT | PR #18 is deployed and pre-merge exact-head 7/7 passed, but post-deploy reliability is still not repeatably proven. The browser timeout initially reconciled at nonce 12, then later shared-state evidence showed nonce 13 before PR #19 began, proving the immediate snapshot was premature. PR #19 non-live checks passed, but its single authorized live validation failed after READY and left a state-reconciled nonzero partial effect: post-failure runtime remained nonce 13 with input vault 1,300,000 after ensureReady had funded it to at least 1,500,000. Exact phase/signature remain unknown because the old smoke emitted no partial receipt. Evidence: `HOSTED-READ-RPC-RETRY-OWNERSHIP-LIVE-FAIL-PARTIAL-EFFECT-2026-10-03.md`. |
| World’s Fair web/operator surface is publicly hosted | OBSERVED | LIVE | Full CRESCO frontend is live at `https://cresco.faadil-casecraft.workers.dev`; hosted Chromium proof reached `/worlds-fair` and observed runtime state `Ready`; evidence: `CRESCO-CLOUDFLARE-CORS-AUTH-HOSTED-PASS-2026-10-03.md` |
| Judge self-serve World’s Fair technical flow exists | OBSERVED | PARTIAL / INTERMITTENT | A fresh Chromium run proved the complete path once, but a later manual browser run ended UNKNOWN. Treat self-serve as technically possible but not yet repeatably reliable. |
| Runtime/commit binding for World’s Fair build exists | OBSERVED | LIVE/PROVEN | Local rebuild and on-chain program dump are bit-identical: SHA-256 `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`, run `37037374212` |
| System Control Plane v1 reconciled into this active project | OBSERVED | LOCAL | Adopted prospectively on 2026-10-01; not backdated |
| Lifecycle coverage manifest exists | OBSERVED | LOCAL | `governance/LIFECYCLE-COVERAGE.yaml` |
| Claim→Runtime→Evidence Graph exists | OBSERVED | LIVE/PROVEN_WITH_VALIDATION_GAP | Live core, runtime binding, hosted API→Solana, hosted browser, exact CORS, login and browser-triggered 7/7 execution are bound to receipts. Independent external-human validation remains a separate non-runtime evidence gap. |
| Product Exploitation Loop is active now | OBSERVED | LIVE/PROCESS | ACTIVE after the proven first live vertical slice; depth review at `product/POST-VERTICAL-SLICE-DEPTH-GAP-REVIEW-2026-10-02.md` |
| Adevar pre-audit reference is adopted product scope | OBSERVED | N/A | False; currently CLASSIFIED / REFERENCE_ONLY in central Reference Intelligence inbox |

## Rule

Any future claim must add:
- exact evidence location;
- commit/runtime binding where relevant;
- truth label;
- evidence state;
- known limitation.

Missing evidence → **UNKNOWN**, never silent PASS.

## 2026-10-02 live-slice promotion

The World’s Fair vertical is now truthfully promotable to **FIRST_LIVE_VERTICAL_SLICE** on Solana Devnet.

Observed live path:
- standing autonomous Orca swaps;
- soft per-action notional refusal;
- exact one-use exceptional authority;
- semantic mutation refusal;
- replay refusal;
- unsupported-program hard refusal;
- missing Pyth evidence refusal;
- Orca failure rollback with allowance/counter preservation;
- stale-authority refusal after Mandate nonce change.

Preserved limits:
- no mainnet claim;
- no production custody claim;
- no audited-security claim;
- no institutional-trading claim;
- no operator-demand/WTP/adoption claim;
- no judge self-serve product-surface claim yet.

## 2026-10-02 / 2026-10-03 UTC shared-core promotion

Observed at source head `cedfbb400f00f28fbe4268fde46ab68933d42e3c`:
- reusable World’s Fair server-side provider is live on Solana Devnet;
- stable distinct delegate is `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`;
- stable Mandate is `CPdat8L1kNUZXAHd6smzeK14nRXD9p1kXU4pF6SSMBXG`;
- seven canonical consequences pass through the shared core;
- overlapping public-run semantics are serialized with a Durable Object lease and return `409 BUSY` in tests;
- Cloudflare Worker dry-run bundle passes;
- the web surface is implemented and build-tested.

Still **not observed**: public hosted Worker + public `/worlds-fair` + UI-triggered live Solana receipt. Therefore judge self-serve remains UNKNOWN/PARTIAL, not PROVEN.


## 2026-10-03 hosted browser 7/7 promotion

Observed in run `37124741369`:
- public frontend: `https://cresco.faadil-casecraft.workers.dev`;
- public API: `https://keys-api-stocklana.faadil-casecraft.workers.dev`;
- fresh Chromium browser opened `/worlds-fair`;
- runtime state: Ready;
- browser clicked the live authority control;
- UI displayed `7/7 live checks proven`;
- five Solana Explorer transaction links were visible;
- browser request failures: 0;
- starting Mandate nonce: 6;
- a second browser context with no cookies/storage also reached the public product, Runtime Ready state and live-run control.

External-human judge/operator use was **not** observed and must not be inferred from this technical clean-room proof.


## 2026-10-03 manual intermittent reliability downgrade

A later manual browser recording reached public `/worlds-fair`, observed Runtime Ready and Mandate nonce 7, then ended with `WORLD_FAIR_LIVE_RUN_UNCONFIRMED` after the user triggered the live sequence.

This is a real negative event. It does not erase the prior 7/7 PASS, but it downgrades repeatable technical self-serve from PROVEN to PARTIAL / INTERMITTENT until the failure is diagnosed and repaired.

See `evidence/runtime/HOSTED-MANUAL-INTERMITTENT-UNKNOWN-2026-10-03.md`.


## 2026-10-03 reliability repair deployment

PR #15 exact head `e868b1522c9fa28486777e3805f52a4c5d27093e` was merged as `0ef9dc9618d9cbdfac1e714b7349993f4292aff9`.

Observed production deployment:
- backend Worker `keys-api-stocklana`: SUCCESS, build `a3a7d586-8392-417f-a574-744e340ee469`;
- frontend Worker `cresco`: SUCCESS, build `2b755dc6-b38e-4a75-a5d1-d91ce01104fd`;
- post-deploy read-only `/worlds-fair`: HTTP 200;
- post-deploy read-only World’s Fair runtime: HTTP 200 / READY;
- no World’s Fair live authority sequence was executed by the read-only smoke.

An unrelated legacy `devnet-execution-bridge` workflow auto-triggered from the main-branch merge because `src/http-api.mjs` changed. It preserved a real period refusal, emitted no successful new on-chain execution signature in its logs, and failed closed on `PYTH_MARKET_EVIDENCE_UNAVAILABLE`. This side effect was outside the explicit merge/redeploy authorization and is recorded as a CI governance defect to gate before future protected merges.

Stable hosted self-serve remains PARTIAL / INTERMITTENT until separately authorized post-deploy live repeatability checks succeed.


## 2026-10-03 ORCA_CONTEXT read-retry deployment

PR #16 exact head `9eb857bb3c369a0ab412977a976c131afac6899f` was merged as `27300a396d9f3049f19e7aed228acdb2f0bdf9d9`.

Observed production deployment:
- backend Worker `keys-api-stocklana`: SUCCESS, build `35efb0a3-f66e-4e66-9839-57893ee75be4`;
- frontend Worker `cresco`: SUCCESS, build `b70afa8d-707a-4665-9a05-e29db714c98f`;
- post-deploy read-only `/worlds-fair`: HTTP 200;
- post-deploy read-only World’s Fair runtime: HTTP 200 / READY;
- no live authority sequence was executed by the read-only smoke;
- the legacy `devnet-execution-bridge` was not triggered because PR #16 did not touch its monitored paths.

Stable hosted self-serve remains PARTIAL / INTERMITTENT until a fresh bounded post-deploy browser live-repeatability campaign succeeds.


## 2026-10-03 post-PR16 quote-stage reliability finding

A separately authorized bounded repeatability campaign was rerun against the deployed PR #16 runtime.

Observed:
- attempt 1: fresh-browser 7/7 PASS, nonce `10 → 11`, five transaction links, zero browser request failures;
- attempt 2: HTTP 503 / UNKNOWN at `STANDING_1_QUOTE`;
- failure class: `TRANSIENT_RPC`;
- retry policy: `SAFE_RETRY_READ`;
- confirmed effects: `0`;
- attempt 3: not executed.

This proves the ORCA_CONTEXT repair moved the failure frontier forward, but public Devnet RPC throttling can still exhaust the quote-stage read retry budget after one full live run.

A source-only repair now increases the read-heavy Orca retry profile to six attempts with a 2-second linear base delay, for a maximum 30-second wait budget before the sixth attempt. Write paths remain non-replayed. This patch is non-live proven only and awaits a separate live-validation authorization.

See:
- `evidence/runtime/HOSTED-POSTDEPLOY-REPEATABILITY-AFTER-ORCA-RETRY-2026-10-03.md`
- `evidence/runtime/HOSTED-ORCA-QUOTE-READ-BACKOFF-PREMERGE-2026-10-03.md`


## 2026-10-03 PR #18 exact-head live reliability validation

PR #18 source head `494818b67b0e2ab8cdb304c64422e36d89dc67f0` was validated live on Solana Devnet before merge.

Observed:
- root PR test run `37149230534`: PASS;
- Cloudflare Worker CI run `37149230535`: PASS;
- World’s Fair live-provider run `37149230540`: PASS;
- live job `111279373905`;
- runtime state before execution: READY;
- starting Mandate nonce: `11`;
- ending Mandate nonce: `12`;
- all seven canonical scenarios: PASS;
- receipt artifact: `11283376180`;
- artifact digest: `sha256:383773aa09db6d5fe8cd562fc4ef80cb08aac3693181d2b7cdf216f871960f19`.

A substantial burst of public Solana Devnet RPC HTTP 429 responses occurred during the successful run. The bounded read-side retry repair recovered and completed the canonical sequence. This is direct evidence that the new preflight/state + quote read budgets improve resilience under the observed failure mode.

Truth boundary:
- this is LIVE exact-head Devnet evidence;
- it is not evidence that the public Cloudflare runtime contains the repair;
- it is not post-deploy repeatability evidence;
- public hosted self-serve remains PARTIAL / INTERMITTENT until PR #18 is separately authorized, merged, deployed and re-verified;
- PR #17 remains untouched/superseded.

See `evidence/runtime/HOSTED-PREFLIGHT-STATE-READ-BACKOFF-LIVE-VALIDATION-PASS-2026-10-03.md`.


## 2026-10-03 PR #18 merge and public deployment

PR #18 exact head `494818b67b0e2ab8cdb304c64422e36d89dc67f0` was merged to `main` as `1266756fb6a00318618daefe9db3d875387411b5`.

Cloudflare Git integration observed:
- `keys-api-stocklana`: SUCCESS, build `d53d266e-6e95-4bf0-8b04-1da9fd57dc73`, version `89081162-c598-421c-a782-713a4c254176`;
- `cresco`: SUCCESS, build `69e33e84-bc5d-4c78-bdf6-39bc33e5f93d`, version `85118cba-c28e-4270-9bad-b3d941785564`;
- legacy `cresco-visual-lab` Pages check: FAIL / obsolete and not the active frontend runtime.

Merge checks:
- root test run `37151328912`: PASS;
- Cloudflare Worker CI run `37151328955`: PASS.

Read-only public verification after deployment:
- public World’s Fair frontend route served;
- public World’s Fair runtime status: READY;
- network: solana-devnet;
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`;
- Mandate nonce: `12`;
- mainnet truth flag remains false;
- no new live authority sequence was triggered by this verification.

Branch-topology side effect:
- PR #18 was stacked on exact PR #17 head `6af66d051493b4c3d8ce820ee4f615d5723e1ea8`;
- merging PR #18 necessarily landed those PR #17 commits on main;
- GitHub automatically marked PR #17 merged/closed;
- no separate PR #17 merge/close mutation command was issued.

Future protected replacement PRs should avoid stacking on an excluded open PR when the authorization requires that earlier PR to remain untouched.

Hosted self-serve reliability remains **PARTIAL / INTERMITTENT** until a separately authorized post-deploy live repeatability campaign succeeds.

See `evidence/runtime/HOSTED-PREFLIGHT-STATE-READ-BACKOFF-MERGE-DEPLOY-2026-10-03.md`.


## 2026-10-03 post-deploy client-timeout finding and retry-ownership repair

The separately authorized bounded post-deploy repeatability campaign was executed as run `37137899070`, attempt `3`.

Observed:
- fresh-browser attempt 1 reached the hosted World’s Fair surface and Runtime Ready;
- after triggering the live sequence, the harness observed no POST response event within `240000 ms`;
- the workflow stopped on that first non-PASS outcome;
- attempts 2 and 3 were not executed;
- no response receipt, partial receipt, or signature set was captured;
- evidence artifact: `11284247154`;
- artifact digest: `sha256:9441331039e847dd1c6e4036b0ad6434c575b6719ce0a800ad8aa636c542619a`.

Read-only reconciliation after the timeout observed:
- runtime: READY;
- Mandate nonce: `12`;
- spentThisPeriod: `3650000`;
- spentThisPeriodNotionalMicroUsd: `3649888`;
- input vault: `350000`;
- output vault: `11348815`.

Those tracked invariants were unchanged at the **immediate** post-timeout checkpoint. This observation was later superseded: PR #19 began with Mandate nonce `13` before its own canonical sequence started, showing that the timed-out POST had continued after browser loss and advanced shared Devnet state. The immediate nonce-12 snapshot must therefore not be treated as a terminal no-effect verdict.

The timing defect has two layers:
1. the browser client abort boundary is `120000 ms`;
2. safe Solana reads were layering web3.js internal 429 retries underneath CRESCO’s explicit bounded six-attempt retry.

A source-only product repair now exists on `Faadil1/cresco`:
- branch: `fix/worlds-fair-read-rpc-retry-ownership-v1`;
- exact head: `127da0c98f2860f1b285c8c651a8be6c2a0b43fa`;
- base main: `1266756fb6a00318618daefe9db3d875387411b5`;
- safe reads use a dedicated connection with `disableRetryOnRateLimit: true`;
- CRESCO’s explicit 6-attempt / 2-second-base policy is the single safe-read retry owner;
- write-capable operations remain on the existing write connection;
- root test run `37152132080`: PASS;
- live validation: NOT AUTHORIZED / NOT RUN.

A separate governance-harness repair exists at exact head `b95b7f847e189cc1c5048c7cd3be95a2c06bdc27`:
- live repeatability is now `workflow_dispatch` only;
- client/no-response timeout becomes a structured UNKNOWN;
- read-only reconciliation is captured before exit;
- merging the harness change itself cannot auto-trigger a live campaign.

Hosted self-serve reliability therefore remains **PARTIAL / INTERMITTENT**. Fresh exact-head authorization is required before opening the product PR because that PR will trigger a real World’s Fair 7/7 Devnet validation.

See:
- `evidence/runtime/HOSTED-POSTDEPLOY-REPEATABILITY-CLIENT-TIMEOUT-2026-10-03.md`
- `evidence/runtime/HOSTED-READ-RPC-RETRY-OWNERSHIP-PREMERGE-2026-10-03.md`


## 2026-10-03 PR #19 read-retry-ownership validation failure with partial effect

PR #19 was opened at exact source head `127da0c98f2860f1b285c8c651a8be6c2a0b43fa` against deployed base `1266756fb6a00318618daefe9db3d875387411b5`.

Observed checks:
- root test run `37152497599`: PASS;
- Cloudflare Worker CI run `37152497604`: PASS;
- single authorized World’s Fair live Devnet run `37152497520`: FAIL;
- live job `111289071719`;
- PR remains OPEN / UNMERGED.

GitHub executed synthetic PR merge ref `e08d4f9f3e80259d7c21d1dd4c03ec064d1e240a`, composed from exact head `127da0c…` and base `1266756…`.

Before `runCanonicalSequence()`, the live smoke observed:
- runtime READY;
- Program ID `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`;
- delegate `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`;
- Mandate nonce `13`.

The run then failed with `WorldFairRunError`. Receipt verification was skipped, and the artifact uploader found no complete receipt file.

A fresh public runtime fetch after failure observed:
- READY on Solana Devnet;
- Mandate version `14`;
- Mandate nonce `13`;
- spentThisPeriod `5000000`;
- spentThisPeriodNotionalMicroUsd `4999871`;
- input vault `1300000`;
- output vault `12698674`;
- mainnet truth flag false.

The code path matters: `getPublicState({ ensure: true })` runs `ensureInputVaultFunding()` before printing READY, and that function guarantees the input vault is at least `1500000` base units. The post-failure state of `1300000` therefore proves a nonzero state delta after READY and is exactly consistent with one `200000` standing input amount. Without a persisted partial receipt or signature set, the exact transaction signature and exact failure phase remain UNKNOWN.

Truth boundary:
- “zero effects” for PR #19 is false;
- complete 7/7 PASS is not proven;
- exact failure phase is not proven;
- blind replay is forbidden;
- the earlier timeouted browser run’s immediate nonce-12 checkpoint is superseded by delayed shared-state evidence showing nonce 13 before PR #19’s sequence.

A source-only follow-up repair now exists:
- branch `fix/worlds-fair-partial-receipt-pyth-retry-v1`;
- exact head `e56f0953b815b207be02d4928f26ca8ddcff4d03`;
- bounded Pyth evidence retry: 4 attempts, 1-second linear base delay, transient/stale cases only;
- auth/entitlement failures remain fail-closed with no retry;
- live smoke now persists diagnostic, partial receipt and runtime before/after on failure;
- smoke syntax check is part of the root test;
- root test run `37152851105`: PASS;
- PR: NOT OPENED;
- live validation: NOT AUTHORIZED.

See `evidence/runtime/HOSTED-READ-RPC-RETRY-OWNERSHIP-LIVE-FAIL-PARTIAL-EFFECT-2026-10-03.md`.


## 2026-10-03 clean replacement topology correction

The first non-live follow-up repair after PR #19 used head `e56f0953b815b207be02d4928f26ca8ddcff4d03`, which was built on top of PR #19’s head.

That topology is now **superseded** to avoid repeating the PR #17/#18 ancestry side effect.

Canonical replacement:
- repository: `Faadil1/cresco`;
- branch: `fix/worlds-fair-retry-observability-v2-clean`;
- exact head: `65a9fea6cbd0535ea867690a848bc1a50ccbe08d`;
- base: deployed `main` at `1266756fb6a00318618daefe9db3d875387411b5`;
- compare: 1 commit ahead / 0 behind;
- PR: NOT OPENED;
- root test run `37153090829`: PASS;
- live validation: NOT AUTHORIZED / NOT RUN.

The clean head reproduces the intended repair contents without PR #19 ancestry:
- explicit CRESCO ownership of safe Solana read retries;
- bounded transient/stale Pyth evidence retry;
- no retry for auth/entitlement failures;
- failure artifact persistence for diagnostic, partial receipt and runtime before/after;
- smoke syntax check in the root test.

PR #19 remains open and unmerged. No PR #19 mutation was issued.

Fresh exact-head authorization is required before opening a clean replacement PR or triggering another World’s Fair Devnet 7/7 validation.


## 2026-10-03 PR #20 clean retry/observability validation

PR #20 was opened at exact head `65a9fea6cbd0535ea867690a848bc1a50ccbe08d` directly from deployed `main`.

Observed checks:
- root test `37153482193`: PASS;
- Cloudflare Worker CI `37153482173`: PASS;
- Orca Devnet discovery `37153482180`: PASS / read-only;
- authorized operator-lab live run `37153482247`: FAIL;
- live job `111291962294`.

The clean failure-evidence path worked as intended.

Before canonical execution:
- READY;
- Mandate version `14`;
- nonce `13`;
- spentThisPeriod `5000000`;
- spentThisPeriodNotionalMicroUsd `4999871`;
- input vault `1500000`;
- output vault `12698674`.

Completed phases:
- BOOTSTRAP_READY;
- STATE_LOAD;
- ORCA_CONTEXT;
- STANDING_1_MARKET_EVIDENCE;
- STANDING_1_QUOTE;
- STANDING_1_EXECUTE;
- STANDING_2_MARKET_EVIDENCE.

Failure:
- phase: `STANDING_2_QUOTE`;
- phase kind: READ;
- class: `UNKNOWN_RUNTIME`;
- reason: `WORLD_FAIR_RUNTIME_FAILURE`;
- retry policy: `NOT_AUTOMATICALLY_RETRYABLE`.

Confirmed effect before failure:
- `standingAutonomy.1`;
- signature `ttsTwumZDbZGf55mHNpyhhdSshji59jLc5wYnEa1GVY88YJrTf6zke3MpzZ1DWp9esfwEGYjmLaj2dHWGdGhPXo`.

Runtime after failure:
- READY;
- nonce `13`;
- spentThisPeriod `5200000`;
- spentThisPeriodNotionalMicroUsd `5199869`;
- input vault `1300000`;
- output vault `12898653`.

Therefore:
- partial effect is PROVEN;
- zero-effects is false;
- blind replay is forbidden;
- the new bottleneck is precisely the second Orca quote after a confirmed first swap.

Failure artifact:
- id `11285206479`;
- digest `sha256:19cbf99083fb7bd69d830e466d5521855736c5adc14660b3d92793abda27076a`.

### Authorization conflict discovered

Because PR #20 also changes `package.json`, GitHub automatically triggered `worlds-fair-orca-devnet-proof` run `37153482170`.

That workflow can execute a separate live Orca vertical slice on Solana Devnet. This is outside the explicit one-live-run authorization.

At the latest observed checkpoint:
- run `37153482170`: IN_PROGRESS;
- job `111291961939`;
- current step: Install Anchor CLI;
- live Orca slice step: PENDING / NOT EXECUTED.

The connected GitHub action set exposes no cancel-workflow mutation. Manual cancellation was requested immediately.

Until that run is cancelled or otherwise terminates before its live step, no additional live action should be initiated.

See `evidence/runtime/HOSTED-CLEAN-RETRY-OBSERVABILITY-LIVE-FAIL-STANDING2QUOTE-2026-10-03.md`.


## 2026-10-03 automatic devnet-proof run final disposition

The automatically triggered `worlds-fair-orca-devnet-proof` run `37153482170` was not cancelled before its live step.

Final observations:
- result: FAIL;
- program `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z` was reused, not redeployed;
- runtime binary binding remained PASS at SHA-256 `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`;
- the proof script generated a random delegate and derived isolated Charter/Mandate/AssetRule/vault PDAs from it;
- isolated setup writes completed before the final failure;
- the live-slice failed at the bootstrap SOL→devUSDC transaction simulation;
- payer had `35,717,296` lamports remaining while the simulated transaction required `101,488,440`;
- the bootstrap swap itself did not land because simulation rejected it before send;
- no receipt artifact was created.

This run was outside the explicit one-live authorization and is classified as an **automatic workflow-scope violation**. It is not counted as a canonical operator-lab validation.

The shared operator-lab accounts used by the hosted runtime were not the PDAs touched by this proof script because its delegate is randomly generated per run.

Future replacement PRs must avoid `package.json` changes, or must first repair the path-trigger relationship, so opening a PR cannot silently launch this separate live proof workflow.


## 2026-10-04 PR #22 fresh Orca quote context validation

PR #22 at exact head `90e1431dd1db975497d81e7cf3d223172aa3437a` remained open and unmerged.

Observed:
- root test `37186952848`: PASS;
- Cloudflare Worker CI `37186952837`: PASS;
- single authorized operator-lab live run `37186952836`: FAIL;
- additional auto live workflows: none.

The live run completed `STANDING_1_EXECUTE` and `STANDING_1_EFFECT_OBSERVED`, then failed at `STANDING_2_QUOTE` with:
- class: `DEPENDENCY_FAILURE`;
- reason: `ORCA_QUOTE_READ_UNAVAILABLE`;
- confirmed signature: `5hhyWuKa5udxxv5rersaoNKsoDa6bSuFZ8zKfLMVQrTbcMYd3fSpp6ypYbpRBxncZdNVUKtfnr3UrYGz48WQMZ86`.

State moved:
- spentThisPeriod `5400000 -> 5600000`;
- input vault `1500000 -> 1300000`;
- output vault `13098632 -> 13298611`.

Failure artifact:
- id `11297430734`;
- digest `sha256:b415e5976d04ef90040a81c8e8412f653df1f5a9b2f9c72e47b1fd9078035ffe`.

The failure proves that removing explicit post-write context refreshes and reacquiring a fresh pool per quote did not make the second quote reliable. Do not widen unknown-error retry semantics from this evidence alone.

A diagnostic-only clean branch now exists:
- branch `fix/worlds-fair-quote-cause-diagnostic-v1-clean`;
- exact head `ae53370d3231e13f492ab9b2543fcf1a18ad7352`;
- base deployed main `1266756fb6a00318618daefe9db3d875387411b5`;
- test run `37187193966`: PASS;
- PR: NOT OPENED;
- live validation: NOT AUTHORIZED.

It adds redacted structural evidence for the underlying quote/read exception and does not broaden retry behavior.

See:
- `evidence/runtime/HOSTED-FRESH-ORCA-QUOTE-CONTEXT-LIVE-FAIL-2026-10-04.md`;
- `evidence/runtime/HOSTED-ORCA-QUOTE-CAUSE-DIAGNOSTIC-PREMERGE-2026-10-04.md`.


## 2026-10-04 PR #23 underlying quote cause + MintInfo retry repair

PR #23 at exact head `ae53370d3231e13f492ab9b2543fcf1a18ad7352` remained open and unmerged.

Observed:
- root test `37189936066`: PASS;
- Cloudflare Worker CI `37189936104`: PASS;
- single authorized operator-lab live run `37189936070`: FAIL;
- additional auto live workflows: none.

The live run failed at `STANDING_2_QUOTE` after a confirmed first swap.

Redacted underlying error:
`Unable to fetch MintInfo for mint - H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm`

This mint is the World’s Fair devUSDT output mint.

Orca source confirms this error is raised when its fetcher returns no MintInfo for one of the pool mints. This is therefore classified as a read-side dependency fetch failure, not a semantic policy refusal and not uncertain write confirmation.

Confirmed signature:
`Cr3YzVrN9ppUxUDHcdHCJW211chXFp132PLZsRUmAUR5LraSJ5ytDcqgwZ2fSQgvBStLHV8vKQ98QCrQf75DE2Y`

State delta:
- spentThisPeriod `5600000 -> 5800000`;
- input vault `1500000 -> 1300000`;
- output vault `13298611 -> 13498590`;
- mandate nonce unchanged.

Failure artifact:
- id `11298615484`;
- digest `sha256:a9e0173d2ca730a954336e060f2e6c813d4041843e1ab3e3650d288b4d68aa24`.

A targeted clean repair now exists:
- branch `fix/worlds-fair-orca-mintinfo-read-retry-v1-clean`;
- exact head `a1a25f861c435826c03dd773d6f7fef362f91d0b`;
- base deployed main `1266756fb6a00318618daefe9db3d875387411b5`;
- push test run `37203306546`: PASS;
- PR: NOT OPENED;
- live validation: NOT AUTHORIZED.

The repair adds only `Unable to fetch MintInfo for mint` to the existing bounded transient read classifier. It does not broaden unknown-error retries and does not retry writes.

See:
- `evidence/runtime/HOSTED-ORCA-QUOTE-CAUSE-DIAGNOSTIC-PREMERGE-2026-10-04.md`;
- `evidence/runtime/HOSTED-ORCA-MINTINFO-READ-RETRY-PREMERGE-2026-10-04.md`.


## 2026-10-04 PR #24 blocked by bootstrap funding + dynamic refill repair

PR #24 at exact head `a1a25f861c435826c03dd773d6f7fef362f91d0b` remains open and unmerged.

Observed:
- root test `37205911964`: PASS;
- Cloudflare Worker CI `37205912001`: PASS;
- single authorized operator-lab live `37205911937`: FAIL;
- additional live workflows: none.

The run failed before `runtimeBefore` and before `runCanonicalSequence()`, inside `ensureInputVaultFunding()`.

Simulation log:
`Transfer: insufficient lamports 35657296, need 101488440`

The bootstrap was still hard-coded to swap `100000000` lamports whenever guardian devUSDC was below the exact vault deficit. At this checkpoint the input vault was `1300000` against a target of `1500000`, so the immediate deficit was only `200000` devUSDC base units.

Failure artifact:
- id `11304259326`;
- digest `sha256:df740ab9b33d9ce0e9b38caf8daedef1eb23d3e22b150ef25e3fd364ceddd2ab`.

No CRESCO canonical sequence write occurred. The shared runtime remained readable at spentThisPeriod `5800000`, input vault `1300000`, output vault `13498590`. Therefore PR #24 did not test the MintInfo retry.

A clean dynamic-refill repair now exists:
- branch `fix/worlds-fair-dynamic-devusdc-refill-v1-clean`;
- exact head `1fd7f5fc52d486e5f42d095f7115860b4745ceb5`;
- base deployed main `1266756fb6a00318618daefe9db3d875387411b5`;
- push test `37206189688`: PASS, 132/132;
- PR: NOT OPENED;
- live validation: NOT AUTHORIZED.

The repair uses the exact devUSDC deficit, a live read-only Orca quote’s slippage-adjusted minimum output, a 10% sizing safety margin, actual guardian SOL balance and a 5000000-lamport reserve. It caps spend to available SOL and refuses before write if the deficit cannot be safely covered.

See:
- `evidence/runtime/HOSTED-ORCA-MINTINFO-RETRY-LIVE-BLOCKED-BY-FUNDING-2026-10-04.md`;
- `evidence/runtime/HOSTED-DYNAMIC-DEVUSDC-REFILL-PREMERGE-2026-10-04.md`.


## 2026-10-04 PR #25 dynamic refill proven + Whirlpool read retry repair

PR #25 at exact head `1fd7f5fc52d486e5f42d095f7115860b4745ceb5` remains open and unmerged.

Observed:
- root test `37207143535`: PASS;
- Cloudflare Worker CI `37207143531`: PASS;
- single authorized operator-lab live `37207143575`: FAIL;
- additional live workflows: none.

The dynamic bootstrap refill succeeded. The input vault moved from the prior `1300000` base units to the target `1500000` before `runtimeBefore`. This is a real bootstrap funding effect.

After bootstrap, the canonical sequence stopped at `ORCA_CONTEXT` with:
- class `DEPENDENCY_FAILURE`;
- reason `ORCA_CONTEXT_READ_UNAVAILABLE`;
- underlying error `Unable to fetch Whirlpool at address at 63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg`.

No standing action executed:
- spentThisPeriod remained `5800000`;
- output vault remained `13498590`;
- input vault remained `1500000` after bootstrap;
- reconciliation error: none.

Failure artifact:
- id `11304354063`;
- digest `sha256:2103cb2c265e135235bb694987e8fa213ab92e3f9335df3f579c2e5754957e3b`.

Orca source confirms `WhirlpoolClientImpl.getPool()` raises this message when its fetcher returns no pool account.

A targeted clean repair now exists:
- branch `fix/worlds-fair-orca-whirlpool-read-retry-v1-clean`;
- exact head `28304f9d74ea7c00518ba74cd815c0afc3e7e639`;
- base deployed main `1266756fb6a00318618daefe9db3d875387411b5`;
- push test `37207328384`: PASS, 134/134;
- PR: NOT OPENED;
- live validation: NOT AUTHORIZED.

The repair adds only `Unable to fetch Whirlpool at address at` to the existing bounded transient read classifier. It preserves dynamic refill, MintInfo retry, redacted diagnostics and no-write-retry semantics.

See:
- `evidence/runtime/HOSTED-DYNAMIC-DEVUSDC-REFILL-PREMERGE-2026-10-04.md`;
- `evidence/runtime/HOSTED-ORCA-WHIRLPOOL-READ-RETRY-PREMERGE-2026-10-04.md`.


## 2026-10-04 PR #26 raw 429 escape + safe Orca batch reads

PR #26 at exact head `28304f9d74ea7c00518ba74cd815c0afc3e7e639` remains open and unmerged.

Observed:
- root test `37208383889`: PASS;
- Cloudflare Worker CI `37208383842`: PASS;
- single authorized operator-lab live `37208383952`: FAIL;
- additional live workflows: none.

The run reached `WORLD_FAIR_OPERATOR_LAB_RUNTIME=READY` with nonce 13 and then the Node process terminated on a raw Solana RPC 429:
`Connection rate limits exceeded`.

No World Fair failure receipt was persisted and the upload step found no receipt file. Therefore the exact internal phase is not receipt-proven.

Source investigation found an upstream reliability hole in Orca legacy common-sdk:
`getMultipleAccounts()` creates request chunks with an async Promise executor. A rejection from `connection.getMultipleAccountsInfo()` can escape the Promise awaited by the SDK caller and terminate the process outside CRESCO's outer retry wrapper.

Quote generation uses affected batch paths, notably:
- `getMintInfos()`;
- `getTickArrays()`.

A clean source-only repair now exists:
- branch `fix/worlds-fair-orca-safe-batch-reads-v1-clean`;
- exact head `4a5d9bdf556aa53b9ac668d96348e180ef1de59b`;
- base deployed main `1266756fb6a00318618daefe9db3d875387411b5`;
- push test `37208646758`: PASS, 137/137;
- PR: NOT OPENED;
- live validation: NOT AUTHORIZED.

The repair proxies only Orca's quote-critical batch reads into controlled unit reads while preserving the rest of the fetcher and its method bindings. Dynamic refill, Whirlpool retry, MintInfo retry, diagnostics and no-write-retry semantics remain intact.

See:
- `evidence/runtime/HOSTED-ORCA-WHIRLPOOL-READ-RETRY-PREMERGE-2026-10-04.md`;
- `evidence/runtime/HOSTED-ORCA-SAFE-BATCH-READS-PREMERGE-2026-10-04.md`.


## 2026-10-04 PR #27 safe batch reads + MintInfo null guard

PR #27 at exact head `4a5d9bdf556aa53b9ac668d96348e180ef1de59b` remains open and unmerged.

Observed:
- root test `37212796164`: PASS;
- Cloudflare Worker CI `37212796165`: PASS;
- single authorized operator-lab live `37212796167`: FAIL;
- additional live workflows: none.

The process-level raw 429 from PR #26 did not recur. The run produced a normal CRESCO receipt and reached:
- BOOTSTRAP_READY;
- STATE_LOAD;
- ORCA_CONTEXT;
- STANDING_1_MARKET_EVIDENCE.

It failed at `STANDING_1_QUOTE` with:
- class `DEPENDENCY_FAILURE`;
- reason `ORCA_QUOTE_READ_UNAVAILABLE`;
- underlying `TypeError: Cannot read properties of null (reading 'tlvData')`.

No PR #27 canonical write occurred:
- confirmedEffects empty;
- spentThisPeriod `6000000 -> 6000000`;
- input vault `1500000 -> 1500000`;
- output vault `13698569 -> 13698569`.

Artifact:
- id `11306858165`;
- digest `sha256:b24c35fdebc13a28e657dd193a6b2584dc8bbfbf02175022be9df970e3873eae`.

### Intervening prior state advancement

PR #25 ended at:
- spentThisPeriod `5800000`;
- spentThisPeriodNotionalMicroUsd `5799848`;
- output vault `13498590`.

PR #27 began at:
- spentThisPeriod `6000000`;
- spentThisPeriodNotionalMicroUsd `5999838`;
- output vault `13698569`.

Observed delta:
- spent `+200000`;
- notional `+199990`;
- output `+199979`.

The state advancement is OBSERVED. Attribution to intervening PR #26 live run `37208383952` is INFERRED_HIGH_CONFIDENCE because it was the only known intervening protected live run, but PR #26 produced no receipt. Therefore do not claim its signature, exact phase, or zero-effect.

### Targeted MintInfo null repair

A clean source-only repair now exists:
- branch `fix/worlds-fair-orca-safe-mint-batch-null-v1-clean`;
- exact head `16f6374c6fbec1c9c39c0129c40f9f914cbf7a6f`;
- base deployed main `1266756fb6a00318618daefe9db3d875387411b5`;
- push test `37212992396`: PASS, 139/139;
- PR: NOT OPENED;
- live validation: NOT AUTHORIZED.

The repair preserves safe unit ownership for Orca batch reads but converts a null MintInfo unit result into the SDK-compatible `Unable to fetch MintInfo for mint - <mint>` error. That error is already handled by CRESCO’s bounded read retry. TickArray null semantics remain nullable because Orca explicitly interpolates uninitialized arrays.

See:
- `evidence/runtime/HOSTED-ORCA-SAFE-BATCH-READS-PREMERGE-2026-10-04.md`;
- `evidence/runtime/HOSTED-ORCA-SAFE-MINT-BATCH-NULL-PREMERGE-2026-10-04.md`.


## 2026-10-04 PR #28 quote pool-null invariant + targeted retry repair

PR #28 at exact head `16f6374c6fbec1c9c39c0129c40f9f914cbf7a6f` remains open and unmerged.

Observed:
- root test `37213621783`: PASS;
- Cloudflare Worker CI `37213621761`: PASS;
- single authorized operator-lab live `37213621817`: FAIL;
- additional live workflows: none.

The run completed through:
- BOOTSTRAP_READY;
- STATE_LOAD;
- ORCA_CONTEXT;
- STANDING_1_MARKET_EVIDENCE;
- STANDING_1_QUOTE;
- STANDING_1_EXECUTE;
- STANDING_1_EFFECT_OBSERVED;
- STANDING_2_MARKET_EVIDENCE.

Confirmed current-run effect:
- label `standingAutonomy.1`;
- signature `3YaqYzrNekRQ2MmbuLCmjg1y7h7uX7y84griPXSuB4qmuQLP7agC4fbAEQc8qMq6PS4Lnb1tq55iSPpZBaAAVSfR`.

It failed at `STANDING_2_QUOTE` with:
- class `DEPENDENCY_FAILURE`;
- reason `ORCA_QUOTE_READ_UNAVAILABLE`;
- underlying `Invariant failed: Whirlpool data not found`.

Runtime delta:
- spentThisPeriod `6000000 -> 6200000`;
- spentThisPeriodNotionalMicroUsd `5999838 -> 6199831`;
- input vault `1500000 -> 1300000`;
- output vault `13698569 -> 13898548`;
- nonce unchanged at 13.

Artifact:
- id `11307118527`;
- digest `sha256:e8b5014c4eafbdec4ad9f5c1a8a9454e1dfad8260bdd6ff335c1aa986eb68ccc`.

Orca legacy `swapQuoteByInputToken()` refetches Whirlpool data and raises this exact invariant when the fetcher returns null for the known pool. This is a read-side dependency fetch gap.

A targeted clean repair now exists:
- branch `fix/worlds-fair-orca-quote-pool-null-retry-v1-clean`;
- exact head `b77b5378c6088c50c2912a4b4254c43b28f549fd`;
- base deployed main `1266756fb6a00318618daefe9db3d875387411b5`;
- push test `37213823352`: PASS, 141/141;
- PR: NOT OPENED;
- live validation: NOT AUTHORIZED.

The repair adds only `Invariant failed: Whirlpool data not found` to the existing bounded transient read classifier. It preserves all prior safe-read ownership and no-write-retry boundaries.

See:
- `evidence/runtime/HOSTED-ORCA-SAFE-MINT-BATCH-NULL-PREMERGE-2026-10-04.md`;
- `evidence/runtime/HOSTED-ORCA-QUOTE-POOL-NULL-RETRY-PREMERGE-2026-10-04.md`.


## 2026-10-04 PR #29 exact-head 7/7 live PASS

PR #29 at exact head `b77b5378c6088c50c2912a4b4254c43b28f549fd` remains open and unmerged.

Observed:
- root test `37214175228`: PASS;
- Cloudflare Worker CI `37214175272`: PASS;
- single authorized operator-lab live `37214175230`: PASS;
- receipt verification: PASS;
- additional live workflows: none.

Artifact:
- id `11307628144`;
- digest `sha256:e2f93357e79d89a40ae864df76b7f7dce81ea837de1b12fab06a689cfb5a65ce`.

The receipt is schema v2, status PASS, network Solana Devnet, bound to Program ID
`7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z` and program SHA-256
`084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`.

All seven canonical scenarios passed in one live run:
1. standingAutonomy — two live standing swaps;
2. softBoundary — REFUSE / PythNotionalExceeded;
3. exactException — exact one-use grant, mutation refusal, live execution, consumed, replay refusal, standing mandate unchanged;
4. hardBoundary — REFUSE / InvalidOrcaProgram;
5. evidenceFailure — REFUSE / PythMessageInvalid;
6. rollback — REFUSE / AmountOutBelowMinimum with allowance unconsumed and counters unchanged;
7. staleAuthority — nonce transition 13 -> 14 followed by REFUSE / StaleNonce.

Confirmed signatures:
- standingAutonomy.1: `2DrhXGfBN7wfke6TFYMh3rryMsUrnHad3bDBJJF2Pi57jjzHPxdUgwHpRfKiN5VNuzbHZSTLGpkjvfhqreEwQz64`;
- standingAutonomy.2: `5EaSJBjteoHoHrKzdsFav1gHuo9mMn4R3YhZHDNFmS1uUUsZB8RfwwtoarKm6W9FCiHZcJBQJ3nLcfkZxZDscfTp`;
- exactException.grant: `5ee9AngLGBEzKwQ6udLjnDh7xadtyy1vgreJgFnyP6LnoJaP81FT8ZDq24Br4duHY8gWMMzCvvJ55UaDHRSbyQ6c`;
- exactException.execute: `fNm9RuUdWyazeaR9pj38w4aHQAYGqsnqFXcCEUAkeRcjdcdeHv7RV15832Dtfz89JXBGTvXWdemk7ymsinFcUoY`;
- rollback.grant: `F7Pd1Q8rqfRG3xFw56LvvYbn1qf3LQskeb6JoKTZeFpvh4WzygTcDBK18s4Y6wssZdvggejdTWGbsKmgwkd3jtc`;
- staleAuthority.policyTransition: `5ip16267fPUdKAe182UDJfQUyPeMdeKsx5p3sjYLh6seBYua7m4Hf16RvPMnrqgQpDgRRzKP9m5nCFnPCjy2oDzh`.

Canonical classification: **PREMERGE_EXACT_HEAD_7_OF_7_LIVE_PROVEN**.

Truth boundary:
- exact PR #29 head live behavior: PROVEN;
- merge to main: NOT DONE;
- public runtime redeploy with this repair: NOT DONE;
- post-deploy repeatability: NOT PROVEN;
- independent external-human validation / WTP / adoption: NOT PROVEN;
- mainnet readiness: NOT PROVEN.

See `evidence/runtime/HOSTED-PR29-EXACT-HEAD-7-OF-7-LIVE-PASS-2026-10-04.md`.


## 2026-10-04 PR #29 merged to main; automatic post-merge CI PASS

PR #29 was merged under explicit authorization.

Source promotion:
- authorized PR head: `b77b5378c6088c50c2912a4b4254c43b28f549fd`;
- previous main: `1266756fb6a00318618daefe9db3d875387411b5`;
- merge commit / main head: `b81133c6e3c57c36f6baedcfcce3cf9b8d46d3e3`;
- merged_at: `2026-10-04T19:51:31Z`.

Automatically triggered GitHub workflows:
- `test` run `37229869661`: PASS;
- `cloudflare-worker-ci` run `37229869664`: PASS;
- Cloudflare packaging in that workflow was dry-run only;
- no GitHub Actions World’s Fair live workflow was observed for the merge commit.

No manual redeploy, live run, repeatability campaign or mainnet action was triggered.

Relationship to prior proof:
- exact PR head live 7/7: PROVEN via run `37214175230`;
- receipt artifact: `11307628144`;
- digest: `sha256:e2f93357e79d89a40ae864df76b7f7dce81ea837de1b12fab06a689cfb5a65ce`;
- main now contains that repair;
- post-merge source/CI integrity: PROVEN;
- public hosted deployment of merge commit: NOT PROVEN in this checkpoint;
- post-deploy live/repeatability: NOT PROVEN.

Canonical classification:
**MAIN_PROMOTED_FROM_7_OF_7_PROVEN_HEAD__POSTMERGE_CI_PROVEN__PUBLIC_RUNTIME_VALIDATION_PENDING**.

See:
- `evidence/runtime/HOSTED-PR29-EXACT-HEAD-7-OF-7-LIVE-PASS-2026-10-04.md`;
- `evidence/runtime/HOSTED-PR29-MERGE-MAIN-CI-PASS-2026-10-04.md`.
