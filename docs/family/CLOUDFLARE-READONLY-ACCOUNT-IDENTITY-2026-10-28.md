# Cloudflare account identity and deployment freeze — Cresco Family
**Date:** 2026-10-28  
**State:** SOURCE prepared / Cloudflare authenticated account verification NOT PERFORMED  
**Release:** NO-GO; no Worker creation, deployment or historical Worker mutation

## Owner's freeze instruction

**DO NOT CHANGE OR REDEPLOY the Colosseum-submitted Workers**, their settings, Git repository/branch, route aliases, credentials, Durable Object state or version weights. Never merge Family into historical main to get an automatic Cloudflare build.

Historical public targets:

- Web: **cresco**, `https://cresco.faadil-casecraft.workers.dev`
- API observed host: **keys-api-stocklana**, `https://keys-api-stocklana.faadil-casecraft.workers.dev`
- Earlier historic Wrangler API name: **cresco-api-stocklana** (different name); discover whether it currently exists before making assumptions.
- Reserve ALL THREE names. The new Family names **must not collide** with any existing Worker.

**Historical Git record (NOT current production verification):**
- The release record from 2026-10-12 captures a successful Workers Build for Web `cresco` with version `04b59fda-2e6c-444f-9df1-7b99417dcb82`.
- The same record captures `keys-api-stocklana` with version `ced3ef0d-3f84-4abb-9310-54422304b904`.
- The record explicitly says the active live version could **not** be confirmed. Do NOT interpret those version IDs as live on 2026-10-28.
- Provenance: `state/CURRENT.yaml` and `docs/worlds-fair/RELEASE-LOCK-2026-10-12.md`.

## What can be read without changing Cloudflare?

The new local-only program `scripts/family-cloudflare-readonly-inventory.mjs` makes exclusively HTTPS **GET** requests to the official Cloudflare API:
1. GET Workers account subdomain.
2. GET Worker scripts metadata for the provided account.
3. GET last deployment metadata for each of `cresco`, `keys-api-stocklana` and (if present) `cresco-api-stocklana`.

The script compares the account subdomain with `faadil-casecraft`, verifies that historical Web/API Workers exist and have a deployment, flags any collision with the desired new `cresco-family-web` or `cresco-family-api` names, and prints a **sanitized** report with active deployment IDs and version traffic splits. It never prints the Cloudflare API token or raw API metadata, never reads or changes secrets, never issues POST/PUT/PATCH/DELETE, and refuses non-Cloudflare API URLs.

**A successful inventory is not deployment authorization.** It does not prove Git production branch, repository webhook, IAM, runtime commit binding or that the user holds the right account; those are separate checks.

### Run ONLY on the owner's machine (never paste the token in chat)

Use a Cloudflare **read-only** API token scoped to the exact account, with Workers Scripts **Read** permission, and obtain the account ID from the authenticated Cloudflare dashboard. Follow the official Cloudflare read-only permission model. Do not reuse global API keys or credentials from the Colosseum project.

Set two environment variables in a private shell/session, without entering token values in GitHub or chat:
- `CLOUDFLARE_ACCOUNT_ID`: the account's 32-character hexadecimal ID
- `CLOUDFLARE_API_TOKEN`: a newly scoped read-only token kept off source control

Then from the `family/cloudflare-readonly-inventory` branch (or after its reviewed merge into `family/standalone`) execute:

    node scripts/family-release-boundary.mjs
    node --test test/family-cloudflare-readonly-inventory.test.mjs
    node scripts/family-cloudflare-readonly-inventory.mjs

Expected outcomes (truth boundary):
- `BLOCKED_ACCOUNT_SUBDOMAIN_MISMATCH`: not the expected historical account.
- `BLOCKED_HISTORICAL_WORKERS_NOT_CONFIRMED`: historical Web or public API missing/without active deployment.
- `BLOCKED_FAMILY_WORKER_NAME_COLLISION`: at least one Family name already exists. Do not overwrite it.
- `ACCOUNT_METADATA_VERIFIED__DEPLOYMENT_STILL_REQUIRES_APPROVAL`: correct subdomain, historical scripts/active deployment metadata exist, new names appear unused. **Still NO-GO** without security and owner's separate deployment decision.

The script requires API access and has **not** been executed against the actual Cloudflare account in ChatGPT. Local tests use fake responses and fake tokens.

### Dashboard verification (no modifications)

Sign in to the intended [Cloudflare dashboard](https://dash.cloudflare.com/) and inspect in **Workers & Pages**:
- Account name and the Workers subdomain; ensure `faadil-casecraft` matches and the three reserved Worker names are accounted for.
- Open `cresco` → **Deployments**: record the currently serving deployment/version ID and any version traffic split.
- Open `keys-api-stocklana` → **Deployments**: record the same information; inspect `cresco-api-stocklana` if it exists.
- Open each historical Worker → **Settings → Build** (or equivalent Builds view) and record connected GitHub repository, production branch, *build command*, *deploy command*, and whether preview builds are enabled. Do not click Save, Redeploy, Rollback or Create.
- Confirm whether historical Workers' production branch is **main**. Cloudflare's documented default is the Git repository default branch, but the current setting must be observed (not inferred).
- Check access controls and automation triggers. Do not infer that GitHub branch protection alone freezes a Cloudflare Worker.

Capture only sanitized metadata; no tokens, cookie screenshots, private keys, secret values or Devnet funding data. A short evidence matrix is enough:

| Check | Web historic | API historic |
| --- | --- | --- |
| Cloudflare account + subdomain | UNKNOWN | UNKNOWN |
| Active version ID + split | UNKNOWN | UNKNOWN |
| Git source / production branch | UNKNOWN | UNKNOWN |
| Automatic deploy / preview settings | UNKNOWN | UNKNOWN |
| Secret values | NEVER COLLECT | NEVER COLLECT |

## Independent Family staging — future, NOT performed

Only after identifying the right account and completing independent security/abuse review:
- New Web Worker name: `cresco-family-web`
- New API Worker name: `cresco-family-api`
- New Durable Object class + namespace: `CrescoFamilyIsolatedState`
- Source branch: `family/standalone` (never the historical `main`)
- Distinct Family invitation secret; do NOT copy original keys, RPC URLs or state.
- Devnet/financial writes remain disabled. No real parents/teens onboarded.
- New Workers Builds settings must explicitly use the dedicated Family configs. Cloudflare defaults to `npx wrangler deploy`, which could otherwise read the historical Wrangler config; never rely on defaults for a new Family Worker.
- Never attach the historical `cresco`/API Worker to the Family Git branch or remap their routes.

Even if the Cloudflare inventory reports unused Worker names, it is **not** proof they were created or deployed. Require an explicit owner release approval after reviewing the account and deployment plan.

## Sources / evidence

- Cloudflare Workers Builds production/preview branches: https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- Cloudflare Workers Builds configuration: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Official API List Worker Scripts: https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/list/
- Official API Get Workers Subdomain: https://developers.cloudflare.com/api/resources/workers/subresources/subdomains/methods/get/
- Official API List Worker Deployments: https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/deployments/
- Issue: https://github.com/Faadil1/cresco/issues/95
- Historic release lock: `docs/worlds-fair/RELEASE-LOCK-2026-10-12.md`
- Family release lane: `docs/family/STANDALONE-BRANCH-RELEASE-2026-10-28.md`

**CURRENT DECISION: NO-GO DEPLOY. This runbook and script are additive and read-only.**
