# CRESCO Family — Access-First Private Staging Preflight (NO DEPLOY)
**Date:** 2026-10-29 | **Review status:** draft, source tests only | **Live Cloudflare account:** not inspected | **External users:** none admitted

## Why this PR exists

The previously separate `cresco-family-web` and `cresco-family-api` Workers were assigned distinct names and Durable Objects but `workers.dev` exposure was not verified as private. A global invitation code and CORS restrictions are **not user authentication** and do not stop unauthorized Internet requests to the API.

As of October 2026, Cloudflare supports **Worker-level Access** policies that protect each Worker's production, preview and associated routes; see https://developers.cloudflare.com/workers/configuration/cloudflare-access/ (updated Oct 12, 2026). The official Access CORS guide explains why cross-origin preflights fail without explicit policy: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/ (updated Aug 25, 2026).

## Source gate

- `wrangler.family-api.jsonc` now explicitly commits nonsecret `CRESCO_FAMILY_STAGING_REQUIRE_ACCESS: "1"`. The Family release boundary requires exactly this value.
- The **new Family API Worker** refuses all non-OPTIONS requests with 503 if this setting is missing, and 403 when `ctx.access` is not present; **no unit-test bypass**. It does not trust an HTTP `CF-Access-Jwt-Assertion` header as proof of authentication. Only Cloudflare's authenticated Worker invocation can supply `ctx.access`.
- All accepted browser requests still need a valid role token for the appropriate practice, a valid invitation token to create one, and authorization checks for writes.
- `OPTIONS` is allowed without `ctx.access`, but the existing Family-only Origin allowlist must still pass. OPTIONS never moves credits or changes state. Cloudflare Access may block it at edge **unless configured**.
- The Family Web client sends `credentials: "include"` to the dedicated API origin. Exact-origin API CORS sets `Access-Control-Allow-Credentials: true`, never `Access-Control-Allow-Origin: *`. Cloudflare Access must be separately configured to permit/preanswer the preflight request. Tests with mocked browser API are not evidence this works on actual Chrome/Safari.
- The operator emergency-close CLI requires **both** a separate operator action secret and an Access service token (client ID + client secret) from environment variables, never stored in git. Service-token Access policy and host identity must be approved before use. Any missing credential fails closed.

## Non-code gates that remain UNVERIFIED

1. **Account identity:** owner must inspect Cloudflare dashboard or use an authorized read-only API query to verify account, Worker names, deployment triggers, DO class/namespace identity, `workers.dev` routes and source SHA. This assistant does not have authenticated Cloudflare account tools. No live Cloudflare account operations occurred.
2. **Protect BOTH workers:** in Workers & Pages open the separate `cresco-family-api` and `cresco-family-web` Workers, select **Access**, protect production **and** previews, and restrict Access to the founder/researcher list. Do not enable an **account-wide** Access setting that could change historic Colosseum services.
3. **Access CORS setup:** API is on a different `workers.dev` origin. Cloudflare warns that Access blocks browser OPTIONS preflights regardless of login; configure API's Access application to respond to or allow OPTIONS with the *exact Family Web Origin, credentials, allowed methods and explicit headers*. Verify the browser's actual Access cookie and third-party cookie behavior. **Do not bypass or weaken user access control for GET/POST.**
4. **Test two devices after authorized staging:** confirm API `403` unauthenticated despite supplying a valid-looking role token; valid identity + wrong role token denied; valid Access + valid role works. Test CORS preflight, login redirect/401, logout, session expiry, replay/UNKNOWN, lost phone/Teen code rotation, operator closure, and actual DO expiry.
5. **Secret lifecycle:** `CRESCO_FAMILY_PRACTICE_INVITE_TOKEN`, `CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN`, and `CRESCO_FAMILY_ACCESS_SERVICE_CLIENT_ID/SECRET` (CLI only) must be generated, provisioned and rotated independently. No attempt was made to access or set secrets; all absent until owner acts.
6. **Privacy & retention:** provider SQLite DO PITR may restore previous state for 30 days, despite `deleteAll()` active deletion; Access sign-in also creates identity/audit data. Determine notice, retention, adult consent and access policy with legal/privacy expertise.
7. **Abuse protection:** Family singleton quota caps **valid invited sessions** but does not throttle invalid codes, guesses or API bursts. Add provider WAF/rate and logs redaction before admitting users.

## Host & source boundaries

- Never modify historical `cresco`, `keys-api-stocklana`, historical Wrangler configs, `main` or deployment triggers.
- Only distinct `cresco-family-web` and `cresco-family-api` Workers may be considered for a future owner-approved private staging release.
- Access policy setup must be restricted to those Workers, never account-wide.
- No native Solana mainnet or Devnet write path is enabled here. The learning flow is fictional.
- No customer, verified guardian, child, investor, broker or licensed financial role claim.

## Evidence semantics

| Signal | Meaning | NOT proof of |
| --- | --- | --- |
| Node Access-context mock test PASS | local API rejects missing Access context | live Access policy correctly configured |
| Family WebKit with intercepted API PASS | simulated Parent/Teen browser experience | live API cookies, CORS or two physical devices |
| Wrangler dry-run PASS | source bundles with Family config | resources, identity, Access, WAF or secrets exist |
| Cloudflare dashboard/Access screenshots + exact SHA | owner-reviewed live configuration | legal right to provide financial services |
| Real hosted two-device E2E | research UX and auth verified in private staging | product-market fit or real minor onboarding |

## Release verdict

**NO-GO** until actual Access policies on both new Workers, Access CORS, security/privacy/retention and secret review, independent account attestation and owner authorization are complete. This PR is a preparation artifact and **never deploys**.

Official source references:
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/
- https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/
- https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/
