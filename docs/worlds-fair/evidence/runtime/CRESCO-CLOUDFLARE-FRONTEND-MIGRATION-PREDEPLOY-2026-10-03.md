# CRESCO — Full Frontend Cloudflare Migration Pre-Deploy Receipt

Date: 2026-10-03 UTC  
Status: **PROVEN PRE-DEPLOY — PUBLIC FRONTEND NOT YET CREATED**

## Objective

Move the **full CRESCO frontend** under Faadil-controlled Cloudflare hosting while preserving the product logic and route surface of the historical `cresco-lac.vercel.app`.

This is not a standalone World’s Fair microsite.

## Source

- Repository: `Faadil1/cresco`
- Migration PR: #13 — `Cloudflare-host full CRESCO frontend`
- Proven PR head: `f567c2b5ebcb1ab04ae8bb63e1c06fcd72f92469`
- Merge commit: `6f7b9010d09f15e4b90ed2afbbf8a136397ce4d5`
- Frontend root: `apps/web`
- Cloudflare Worker identity in committed config: `cresco`

## Compatibility and regression proof

### Cloudflare compatibility

Workflow:
- `cresco-cloudflare-frontend-compat`
- run: `37089930185`
- result: **PASS**

Observed:
- historical Next.js baseline: PASS
- `vinext check`: **100% compatible**
- supported: 11
- partial: 0
- issues: 0
- non-destructive vinext init: PASS
- Next.js build after migration: PASS
- full CRESCO vinext/Workers build: PASS
- Cloudflare Worker packaging dry-run: PASS

### Historical frontend regression

Workflow:
- `web`
- run: `37089933084`
- result: **PASS**

Observed:
- typecheck: PASS
- lint: PASS
- copy lint: PASS
- tests: PASS
- Next.js production build: PASS
- WebKit suite: PASS

Repository regression:
- run `37089933086`
- result: PASS

## Runtime configuration

Committed under `apps/web`:

- `vite.config.ts`
- `wrangler.jsonc`
- `package.json`
- synchronized `package-lock.json`

Pinned compatibility stack:
- vinext 1.0.1
- @vinext/cloudflare 1.0.1
- React / React DOM 19.2.8
- react-server-dom-webpack 19.2.8
- Vite 8.3.0
- @vitejs/plugin-rsc 0.5.34
- @cloudflare/vite-plugin 1.50.0
- Wrangler 4.118.0
- Node >=22

Historical Next.js scripts remain available in parallel with vinext.

## Product continuity

The target is the complete CRESCO app:
- home/start/onboarding;
- child and parent flows;
- dynamic explore/invest/learning routes;
- existing state and design system;
- integrated `/worlds-fair` route.

Production frontend defaults to the already-proven API:

`https://keys-api-stocklana.faadil-casecraft.workers.dev`

No browser secret is required.

## Legacy Cloudflare Pages project

GitHub still has an attached Cloudflare Pages project:

`cresco-visual-lab`

Historical evidence shows it deployed successfully while `apps/visual-lab` existed:
- commit `715c040…` → Pages PASS
- commit `593f2a6…` → Pages PASS

Between `593f2a6…` and `7ef67d3…`, the entire legacy `apps/visual-lab` static project was removed. Pages began failing after that removal.

Therefore the current red `Cloudflare Pages` check is classified **LEGACY_OBSOLETE**, not a regression in `apps/web`.

It must not be confused with the new full CRESCO Workers/vinext runtime.

## CORS dependency

The public API currently allows only:

`https://cresco-lac.vercel.app`

via `CRESCO_CORS_ORIGIN`.

The new frontend origin must be observed first. Then the backend allowlist can be expanded to the exact new Cloudflare origin without removing the historical Vercel origin.

## Next protected action

Create/import a new Cloudflare **Workers** application for the complete CRESCO frontend:

- repository: `Faadil1/cresco`
- production branch: `main`
- root directory: `apps/web`
- Worker/application name: `cresco`
- Node 22+
- build: `npm run build:vinext`
- deploy: `npm run deploy:vinext`

After the resulting public URL is known:
1. verify historical routes and `/worlds-fair`;
2. add that exact origin to backend CORS if needed;
3. prove browser → API → Solana Devnet;
4. run clean-room judge self-serve.

No mainnet, new Solana Program ID, custody, submission or paid-infrastructure claim follows from this receipt.
