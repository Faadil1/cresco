# CRESCO World’s Fair — Reliability / Observability Merge + Deploy

Date: 2026-10-03  
Status: **MERGED + CLOUDFLARE DEPLOYED**  
Hosted repeatability: **NOT YET RE-PROVEN**

## Exact source promotion

- product repository: `Faadil1/cresco`
- PR: #15 — `Harden World’s Fair live-run reliability and observability`
- authorized exact head: `e868b1522c9fa28486777e3805f52a4c5d27093e`
- merge commit: `0ef9dc9618d9cbdfac1e714b7349993f4292aff9`

Authorized scope:
- merge PR #15 at the exact proven head;
- redeploy affected CRESCO Cloudflare Workers only for the reliability / observability repair.

## Cloudflare production builds

Backend:
- Worker: `keys-api-stocklana`
- result: **SUCCESS**
- build id: `a3a7d586-8392-417f-a574-744e340ee469`

Frontend:
- Worker: `cresco`
- result: **SUCCESS**
- build id: `2b755dc6-b38e-4a75-a5d1-d91ce01104fd`

Legacy:
- `Cloudflare Pages / cresco-visual-lab` remains failed/obsolete and is not the current CRESCO frontend runtime.

## Merge checks

Observed on merge commit:
- node: PASS
- cresco-web: PASS
- webkit-iphone: PASS
- dry-run: PASS
- hosted-market-discovery: PASS
- both current Workers builds: PASS

## Read-only hosted smoke

A separate read-only verification was run after deployment.

Workflow:
- repository: `Faadil1/cresco-worlds-fair`
- run: `37128446709`
- job: `111218484824`
- result: **PASS**

Observed:
- public `/worlds-fair` route: HTTP 200
- public `GET /api/v0.3/worlds-fair/runtime`: HTTP 200
- runtime status: `READY`
- network: `solana-devnet`
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- live authority sequence in this smoke: **NOT EXECUTED**

## Protected boundary

The merge/redeploy authorization is consumed.

This authorization did **not** include additional Devnet execution after deployment.

A separate legacy workflow `devnet-execution-bridge` was auto-triggered by the merge because `src/http-api.mjs` changed:
- run: `37128260113`
- job: `111217931150`
- result: **FAILURE**
- `Build client IDL only`: PASS
- `Bootstrap stable demo runtime`: PASS
- `Execute real HTTP-to-devnet smoke`: FAIL

Observed smoke behavior:
- existing stable demo runtime reported READY;
- standing-key proof preserved a real period refusal: `DEVNET_STANDING_KEY_PROOF=REAL_PERIOD_REFUSE`;
- no successful new on-chain execution signature was emitted in the workflow logs;
- the smoke then failed closed because its tamper expectation encountered `PYTH_MARKET_EVIDENCE_UNAVAILABLE` instead of the expected allow-once tamper refusal.

This workflow was outside the explicit merge/redeploy authorization. The connected GitHub tool did not expose a workflow-cancel action, so it could not be stopped after the auto-trigger was detected. This is a governance/CI side-effect defect and should be gated before a future protected main-branch merge.

## Truth boundary

The reliability / observability repair is now deployed publicly.

Stable hosted self-serve reliability remains **PARTIAL / INTERMITTENT** until multiple post-deploy hosted browser attempts succeed.

No additional live Devnet run, mainnet action, custody change, adoption, WTP or external-human validation is proven by this deployment receipt.
