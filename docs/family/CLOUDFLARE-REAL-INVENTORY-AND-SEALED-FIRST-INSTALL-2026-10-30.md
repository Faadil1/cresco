# CRESCO Family — First installation must remain SEALED (not a deployment authorization)

**Date:** 2026-10-30 | **Source:** owner-executed Cloudflare GET-only inventory output | **Account ID:** withheld | **API token:** never recorded | **Production access:** not tested

## Observed facts — owner-supplied actual Cloudflare inventory

The owner ran the new read-only inventory using a short-lived, account-scoped Cloudflare token in a private Windows terminal. The script returned a complete JSON result, `launchVerdict: NO_GO`. This is an **owner-provided terminal transcript**, not an independent Cloudflare-account verification by this assistant. Do not store the full Cloudflare account ID or token in GitHub.

- Workers listed **present** in the reported account: historic `cresco`, `keys-api-stocklana`.
- Historic script name `cresco-api-stocklana` **not listed**. This was only an expected config identity in the historical repository; do not infer a missing production API from it since `keys-api-stocklana` is the actual observed live worker.
- New `cresco-family-web`, `cresco-family-api`: **not listed**.
- Directly matching Access applications for either Family Worker: **not evidenced**; this is expected if Workers do not exist.
- Family DO class names (`CrescoFamilyIsolatedState`, `CrescoFamilyPracticeState`, `CrescoFamilyPracticeInviteGuard`): **not evidenced**. Absence from this high-level class-name list alone is not a guarantee of zero historical state or proof of no aliases.
- Inventory did **not** verify account ownership, routes, version SHAs, Access policy identities, secrets, WAF rules, backup retention or deployed code. No real Parent/Teen sessions tested.

The report contained only the above anonymized outcomes. The current repository source was frozen at `Faadil1/cresco:main = 6464dd2ca88479963a536b6c44f178839d132eef` at the last GitHub check, and no historical Worker writes were performed.

## New initial deployment isolation — reviewed SOURCE only

Cloudflare's official Wrangler documentation: `workers_dev` defaults to true for Workers without custom routes; public version URLs also default according to `workers_dev`. A new Worker can therefore be publicly reachable after upload/deploy even if the Family API is partially fail-closed. Relevant: https://developers.cloudflare.com/workers/wrangler/configuration/ and https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/.

This PR changes **only the Family configs**:

| Source | Worker identity | Initial `workers_dev` | Initial `preview_urls` | Custom route |
| --- | --- | --- | --- | --- |
| `wrangler.family-api.jsonc` | `cresco-family-api` | `false` | `false` | none |
| `apps/web/wrangler.family.jsonc` | `cresco-family-web` | `false` | `false` | none |

`scripts/family-release-boundary.mjs` checks these values on both source configs **and on the built Web Wrangler artifact**, with regression tests against accidental `true` and routes. The Web build script now rejects a generated public artifact. The historical configs and the original submitted Workers remain unchanged. No secrets are committed, no Worker deployed, and no Cloudflare API writes were made.

**Do not run any `wrangler deploy`, `vinext-cloudflare deploy`, GitHub merge or account-level Access change based on this PR.** Source-only controls cannot certify that the account itself has no existing routes, scripts, or web deploy triggers.

## Proposed stages — each requires its own owner decision

**Stage 0 — complete offline readiness (current stage, NO-GO for deploy).**
- Verify exact candidate SHA, diff of historical configs and APIs, build outputs, CI, all route-disabled source configs.
- Review Cloudflare account permissions, billing and any existing Workers Builds/GitHub automatic deployment triggers.
- Write short security/privacy note for **adult-only fictional** sessions. No real minors or financial assets.
- Independently inspect whether the intended worker names are free of conflicting access/domain setup; the owner report suggests names are absent but is not a deployment authorization.

**Stage 1 — isolated unrouted first install (NOT AUTHORIZED).**
- Only after written founder approval and a separate, clearly scoped deployment authorization, create **only** the two named Family Workers using sealed configs, `workers_dev:false`, `preview_urls:false`, and **no** custom routes.
- Validate actual Worker immutable IDs, DO class bindings/namespace ownership, deployed version digest and source SHA; keep Family API credentials absent until privacy/Access controls are ready.
- Never select `cresco` or `keys-api-stocklana` as a deploy target. No automatic `main` merge.
- If the first install cannot be proven unrouted or any service name collides, STOP and do not expose a staging URL.

**Stage 2 — configure Worker-specific Access (NOT AUTHORIZED).**
- In Workers & Pages, on **each new Family Worker only**, select Access > Protect this Worker behind Access > **All traffic** with allowlisted adult research/cofounder identities. Do NOT select `Protect all Workers`, which would alter historic Colosseum access.
- Review all public path overrides, Service Token rules and preview/production scope. Verify denied requests without auth and valid signed-in identity `ctx.access` on API before enabling any public URL.
- Decide and test Access CORS using an exact Family Web origin. Cloudflare warns OPTIONS requests do **not** carry cookies; choose a **specific Access application CORS preflight response or other reviewed solution**. Avoid public bypass for state-changing routes.
- Require a distinct operator Access service token (CLI-only) and separate operator secret. No secrets in frontend, GitHub or this chat.

**Stage 3 — limited private activation (NOT AUTHORIZED).**
- Only after Stage 2 and separate owner approval, enable `workers_dev` and any reviewed preview URLs on the **dedicated Family configs only** (never legacy). Perform hosted authentication-denial tests and 2-device Safari/Chrome role exercises with consenting adults and fictional personas.
- Verify 100→80 / +20 fictitious credit practice, Parent approve/decline discussion, negative role authorization, loss/replay/UNKNOWN, code rotation, emergency stop, expiry, logging/WAF and retention.
- Review backup/PITR and Access identity retention before any real users. No child identity, real payments or financial advice.

## Operator decision

**NO-GO for any deployment right now.** Real account discovery is complete but returns 2/2 Family Workers absent; the code-first sealed first-install gate is ready for independent CI. Owner must separately authorize any Worker creation, Access policy changes and later publication.

Official documentation:
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/
