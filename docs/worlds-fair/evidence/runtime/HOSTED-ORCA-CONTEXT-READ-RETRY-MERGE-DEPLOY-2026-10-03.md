# CRESCO World’s Fair — ORCA_CONTEXT Read Retry Merge + Deploy

Date: 2026-10-03  
Status: **MERGED + CLOUDFLARE DEPLOYED**  
Hosted repeatability: **NOT YET RE-PROVEN POST-DEPLOY**

## Exact source promotion

- product repository: `Faadil1/cresco`
- PR: #16 — `Retry transient ORCA_CONTEXT reads in World’s Fair live path`
- authorized exact head: `9eb857bb3c369a0ab412977a976c131afac6899f`
- merge commit: `27300a396d9f3049f19e7aed228acdb2f0bdf9d9`

Authorized scope:
- merge PR #16 at the exact proven head;
- redeploy affected CRESCO Cloudflare Workers only for the ORCA_CONTEXT read-retry repair.

## Cloudflare production builds

Backend:
- Worker: `keys-api-stocklana`
- result: **SUCCESS**
- build id: `35efb0a3-f66e-4e66-9839-57893ee75be4`

Frontend:
- Worker: `cresco`
- result: **SUCCESS**
- build id: `b70afa8d-707a-4665-9a05-e29db714c98f`

Legacy:
- `Cloudflare Pages / cresco-visual-lab` remains failed/obsolete and is not the current CRESCO frontend runtime.

## Merge checks

Observed on merge commit:
- `node`: PASS
- `dry-run`: PASS
- current backend Worker build: PASS
- current frontend Worker build: PASS

The legacy `Cloudflare Pages` check remains red because it targets the removed `apps/visual-lab` project.

## Devnet side-effect check

Before merge, the legacy `devnet-execution-bridge` trigger paths were verified.

PR #16 does not modify any of those monitored paths:
- `src/devnet-execution-provider.mjs`
- `src/http-api.mjs`
- `scripts/bootstrap-devnet-demo-runtime.cjs`
- `scripts/devnet-execution-smoke.mjs`
- `package.json`
- `.github/workflows/devnet-execution-bridge.yml`

Therefore that legacy Devnet bridge workflow was not triggered by this promotion.

## Read-only hosted smoke

A separate read-only verification was run after deployment.

Workflow:
- repository: `Faadil1/cresco-worlds-fair`
- run: `37141529993`
- job: `111256798620`
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

This checkpoint did **not** authorize:
- a new browser-triggered World’s Fair live sequence;
- another Devnet 7/7 validation;
- mainnet, custody, or broader execution scope.

## Truth boundary

The ORCA_CONTEXT read-retry patch is now:
- non-live tested;
- exact-head live-validated pre-merge;
- merged to main;
- deployed to both current Cloudflare Workers;
- read-proven publicly after deployment.

Stable hosted self-serve reliability remains **PARTIAL / INTERMITTENT** until the bounded post-deploy browser repeatability campaign is run again under a fresh authorization and succeeds.

No adoption, WTP, independent external-human validation, mainnet readiness, custody or audited-security claim follows from this deployment receipt.
