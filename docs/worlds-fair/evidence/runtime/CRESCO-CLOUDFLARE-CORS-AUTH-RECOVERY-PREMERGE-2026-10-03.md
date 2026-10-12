# CRESCO — Cloudflare CORS + Sign-In Recovery Pre-Merge Receipt

Date: 2026-10-03  
Status: **PROVEN PRE-MERGE — REDEPLOY NOT YET AUTHORIZED**

## Product source

- Repository: `Faadil1/cresco`
- PR: #14 — `Fix Cloudflare frontend CORS and sign-in recovery`
- Exact proven head: `8fcc5300dfcd86b90c27be379d96df2e7af8b879`
- Base main: `6f7b9010d09f15e4b90ed2afbbf8a136397ce4d5`

## Repair

### Exact multi-origin CORS

Allowed browser origins:
- historical Vercel: `https://cresco-lac.vercel.app`
- Faadil-controlled Cloudflare frontend: `https://cresco.faadil-casecraft.workers.dev`

Untrusted origins are not granted `Access-Control-Allow-Origin`.

Configuration remains backward compatible with `CRESCO_CORS_ORIGIN` and adds exact comma-separated `CRESCO_CORS_ORIGINS`.

### Sign-in recovery

Observed production symptom:
- child sign-in could remain on `Setting up…` after backend/CORS failure;
- parent sign-in had the analogous permanent busy-state risk.

Repair:
- backend/session failure is caught;
- busy state is cleared in `finally`;
- user sees a retryable error;
- no failed session is dispatched and no navigation occurs.

## Exact-head verification

### Web
- run: `37123496978`
- job: `111204087521`
- result: PASS
- typecheck: PASS
- lint: PASS
- copy lint: PASS
- Vitest: PASS
- production build: PASS
- WebKit: PASS

### Root regression
- run: `37123497058`
- job: `111204088040`
- result: PASS

### Cloudflare Worker
- run: `37123498821`
- job: `111204093363`
- backend tests: PASS
- Wrangler bundle: PASS
- bundle proof: PASS

Targeted test coverage:
- old Vercel origin accepted;
- new Cloudflare origin accepted;
- third-party origin refused;
- child sign-in UI recovers after backend failure;
- parent sign-in UI recovers after backend failure.

## Promotion boundary

This repair is proven before merge.

Merging PR #14 will trigger public deployment behavior:
- backend Worker `keys-api-stocklana` will rebuild/redeploy from main;
- frontend Worker `cresco`, connected to main, may rebuild as well.

Therefore a fresh exact-head human authorization is required.

No Solana Program ID, mainnet state, custody, World’s Fair mechanism, submission or paid-infrastructure change is included.
