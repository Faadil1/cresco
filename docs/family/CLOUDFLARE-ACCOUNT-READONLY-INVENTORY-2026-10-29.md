# CRESCO Family — Cloudflare authenticated read-only account inventory
**29 October 2026 | DRAFT / NO DEPLOY / NO CUSTOMER ACCESS / NO REAL FUNDS**

## Purpose and current evidence

An **authenticated, read-only inspection of the actual Cloudflare account** is the next blocker after draft PR #105's green source checks. The currently connected tools give GitHub access, **not Cloudflare account access**. Public `workers.dev` responses and GitHub Wrangler configs **cannot attest** to current Worker ownership, deployed versions, Access configuration, routing, encrypted secrets, and live Durable Object namespaces. The original submitted Colosseum Workers `cresco` and `keys-api-stocklana` must not be touched.

This branch adds `scripts/family-cloudflare-readonly-inventory.mjs` and independent Node tests. It prepares the inspection **without executing it against the user's Cloudflare account** or requesting credentials in chat.

## What the script actually reads

Only three approved Cloudflare API endpoints, always via `GET` on `https://api.cloudflare.com/client/v4`:

- `GET /accounts/{account_id}/workers/scripts` — installed script identities (not SHA, routes, secrets, or permissions)
- `GET /accounts/{account_id}/access/apps?per_page=100` — Access application names/destinations and whether a directly matching Family Worker destination is present
- `GET /accounts/{account_id}/workers/durable_objects/namespaces` — observed class-name hints, **not** proof of the live Worker binding map

The program does not read Worker code, account credentials, secrets, private user emails, access-policy identities or financial data. It refuses incomplete Access pagination and invalid/unavailable API responses. Its report only prints a truncated account fingerprint and high-level Worker/Access/DO presence. The report is **always `launchVerdict: NO_GO`**. API token material, complete account ID, policy membership/PII and response bodies are not printed.

It has **no POST, PUT, PATCH, DELETE, Wrangler command, token creation, Access mutation, Worker deployment, Durable Object mutation or browser identity flow**.

### Official source references

- Workers list: https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/list/
- Access apps list: https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/applications/methods/list/
- DO namespace list: https://developers.cloudflare.com/api/resources/durable_objects/subresources/namespaces/methods/list/
- Worker-level Access: https://developers.cloudflare.com/workers/configuration/cloudflare-access/

## How an account owner can execute it **locally**, when prepared

1. Verify the Cloudflare account ID from the official dashboard and use a **short-lived, narrow, read-only API token** that permits the three necessary GET reads (Workers metadata/read and Access apps read). The precise Cloudflare permissions should be confirmed in the dashboard. Do **not** use a global API key or an existing deployment/finance secret.
2. Use a personal trusted computer with this **Family-only branch**, not the historical Colosseum `main`, and set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_READONLY_API_TOKEN` as environment variables in the local terminal. **Do not paste either value into ChatGPT, GitHub issues, screenshots or a PR comment.**
3. Run `node --test test/family-cloudflare-readonly-inventory.test.mjs` locally. This uses **only simulated Cloudflare API responses**.
4. Run `node scripts/family-cloudflare-readonly-inventory.mjs` locally in the same terminal. This is the only step that performs authenticated Cloudflare API GET requests.
5. Read the resulting report locally. The program returns nonzero if Cloudflare cannot confirm a complete read. Review anything marked `FAMILY_WORKERS_NOT_BOTH_PRESENT`, `FAMILY_ACCESS_APPS_NOT_BOTH_EVIDENCED`, `BROAD_ACCESS_SCOPE_REQUIRES_HISTORIC_WORKER_REVIEW`, `ACCESS_APPLICATION_PAGINATION_INCOMPLETE`, and `FAMILY_DURABLE_OBJECT_CLASSES_NOT_ALL_EVIDENCED`.
6. Share only the sanitized high-level report if desired, **after reviewing it for internal infrastructure metadata**. Preserve the raw inventory and any sensitive screenshots locally; never attach Cloudflare API tokens, Access policy user membership or secrets.

### Assumptions that this simple list cannot verify

- Whether the account is genuinely controlled by either founder; do not infer ownership from the Worker namespace/domain alone.
- Whether the Family Workers' published SHA/versions actually contain PR #105 code; script names are **not deploy provenance**.
- Whether a matching Access application is enabled and blocks **GET and POST** correctly, with approved founding-team identities.
- Whether `workers.dev` Access covers both Workers, **production and preview**, and does **not** broaden protection account-wide to historic Workers.
- Whether the cross-origin browser can correctly perform `OPTIONS` and send an authenticated Access cookie for the Family API.
- Whether WAF throttles guessing, logging redacts secrets, encrypted Worker secrets are provisioned, or backup/PITR data retention is acceptable.
- Whether Durable Object classes are correctly bound, active, deleted or inaccessible. Class-name presence is not a binding attestation.

## Decision matrix after reading actual account data

| Observation | Interpretation | Safe next action |
| --- | --- | --- |
| New Family Workers absent | Expected if staging was never deployed | Continue source/security review, **NO deployment** |
| New Family Workers already exist unexpectedly | Possible prior/manual installation | Verify owner, provenance and Access privately; do not assume safe or alter |
| Workers present, no direct matching Access apps | Private beta control missing | Independent Access configuration review, no users |
| Access apps present | Basic inventory signal only | Owner confirms exact destinations/policies + browser-level denial tests |
| Broad account/wildcard Access matching `*.workers.dev` | Potential impact on historic Colosseum Workers | Stop and review explicitly; no account-wide policy modifications |
| All three inventory calls succeed | A useful account evidence snapshot | Still **NO_GO**: manual controls and final live staging sign-off required |
| Any permission/API error or incomplete pagination | Inventory not trustworthy | Obtain correct read-only permissions or inspect in dashboard, no guessing |

## Separation / release guarantees

- Draft branch `family/cloudflare-readonly-inventory-2026-10-29`, stacked on **#105**, never on original Colosseum `main`.
- Script and test are read-only; **no cloud authentication was available to this assistant** during preparation.
- Existing `scripts/family-release-boundary.mjs` still pins historical Wrangler Git blobs.
- All original Colosseum Workers and version SHA remain untouched.
- Authenticated inventory **does not authorize** any Worker deployment, DNS/route change, Access policy setup, quota increase, real-money operation, research with actual minors, or external invitations.
- The real staging GO depends on co-founder sign-off, actual Access/CORS proof, independent security/privacy review, adult consent protocol and a separate deployment authorization.

**Current gate:** ACCOUNT_READONLY_INSPECTION_NOT_EXECUTED / PRIVATE_STAGING_NO_GO.
