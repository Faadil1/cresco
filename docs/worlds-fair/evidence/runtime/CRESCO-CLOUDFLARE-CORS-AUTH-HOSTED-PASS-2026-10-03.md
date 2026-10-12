# CRESCO — Hosted Cloudflare CORS + Login Recovery PASS

Date: 2026-10-03  
Status: **PROVEN HOSTED**  
Truth state: **OBSERVED**

## Authorized product change

- Product repository: `Faadil1/cresco`
- PR: #14 — `Fix Cloudflare frontend CORS and sign-in recovery`
- Authorized exact head: `8fcc5300dfcd86b90c27be379d96df2e7af8b879`
- Merge commit: `f6c71177155ccd3ebeaebb1aff9897aaf1758aac`

Authorized scope:
- add the new Faadil-controlled Cloudflare frontend origin to exact CORS;
- preserve the historical Vercel origin;
- fix child/parent login busy-state recovery;
- redeploy affected CRESCO Cloudflare Workers only.

## Production deployments

Cloudflare checks on merge commit:

- `Workers Builds: keys-api-stocklana` → **SUCCESS**
  - build: `819f0895-5058-4159-923a-492957a80b3f`
- `Workers Builds: cresco` → **SUCCESS**
  - build: `7491d3f6-74bd-463d-bac6-284c9b142bd7`

GitHub regression checks:
- node: PASS
- dry-run: PASS
- cresco-web: PASS
- webkit-iphone: PASS

The remaining red `Cloudflare Pages` check belongs to legacy project `cresco-visual-lab`, which targeted removed `apps/visual-lab` and is not the current full CRESCO frontend runtime.

## Hosted browser proof

Frontend:
`https://cresco.faadil-casecraft.workers.dev`

API:
`https://keys-api-stocklana.faadil-casecraft.workers.dev`

Proof workflow:
- repository: `Faadil1/cresco-worlds-fair`
- run: `37124397821`
- job: `111206672658`
- result: **SUCCESS**
- artifact: `11274134281`
- artifact digest: `sha256:fb2a9d53c3de6bb81247f07387b51fa80e002a98321b97fddec6bd1a1b4554db`

Observed:
- exact CORS preflight from the new frontend origin: PASS
- real `POST /api/v0.2/auth/demo-session`: HTTP 200 / PASS
- Chromium browser `/start → /home`: PASS
- hosted `/worlds-fair`: runtime state **READY**
- screenshots captured for start, home, and World’s Fair runtime state

The smoke intentionally did **not** trigger a new World’s Fair live authority sequence.

## CORS truth boundary

Allowed exact origins now include:
- `https://cresco-lac.vercel.app`
- `https://cresco.faadil-casecraft.workers.dev`

A third-party arbitrary origin is not granted `Access-Control-Allow-Origin`.

## Product truth boundary

Proven:
- new Cloudflare CRESCO frontend is publicly deployed;
- browser login works against the real hosted backend;
- the prior indefinite `Setting up…` symptom is no longer reproduced on the hosted child-demo path;
- the browser can read the World’s Fair runtime and sees `Ready`;
- hosted API→Solana had already been independently proven PASS.

Not yet proven by this smoke:
- a fresh browser-triggered seven-scenario World’s Fair execution;
- clean-room external judge execution by a third party.

No mainnet, production custody, audited security, adoption, WTP, or submission claim follows from this receipt.
