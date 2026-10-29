# CRESCO Family — Cloudflare Access Inventory Accuracy Review
**2026-10-29 | Source-only audit / no account connectivity / NO-GO**

## Why this follow-up exists

The first read-only account inventory (#106) was a useful controlled starting point, but a superficial Access app match could produce **false reassurance** about a Family staging release. This review makes that summary more conservative, based on the official Cloudflare API contracts.

### Source-grounded fixes

- **Immutable script tags:** `GET /accounts/{id}/workers/scripts` returns a script `id` (name) and optional `tag` (immutable identifier). Worker-level Access destinations use `type: worker` or `preview_worker` and `worker_id`. The inventory now matches either exact configured ID form to the observed script, and reports whether an immutable tag is available, rather than assuming the Access `worker_id` is always a script name.
- **Coverage distinctions:** An application with `preview_worker` covers preview URLs only, not production. `worker` covers both, subject to public overrides and additional policy hierarchy. Hostname-specific evidence is not enough to claim full Worker coverage. The summary distinguishes these observations and flags `FAMILY_FULL_WORKER_ACCESS_NOT_EVIDENCED`.
- **Potentially public routes:** Access destinations can contain `overrides: [{behavior: 'public', path_pattern: ...}]`. Any explicit public override on Family-targeting applications now triggers `FAMILY_ACCESS_PUBLIC_PATH_OVERRIDE_REVIEW`. This does **not** imply that every override is exploitable; the point is that the owner must inspect it.
- **Historical worker protection:** Detect typed account-wide destinations `all_workers` / `all_preview_workers` as well as wildcard hostnames. Do not add any account-wide Access policy for the Family project without separate review of historic Colosseum routes.
- **Pagination accuracy:** Access-app and DO-namespace pagination are separately classified. The first page of a paginated list is NOT complete evidence. Missing Access pagination metadata with a full 100 items also fails conservatively.
- **Same minimal permissions:** exactly three read-only GET calls, fixed `api.cloudflare.com` host, no secrets, policy membership details, Worker source or Durable Object contents printed. No deployments or cloud modifications.

Official Cloudflare source contracts:
- Workers script list: https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/list/
- Access destinations and overrides: https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/applications/methods/create/
- DO namespace list/pagination: https://developers.cloudflare.com/api/resources/durable_objects/subresources/namespaces/methods/list/
- Worker-level Access and `ctx.access`: https://developers.cloudflare.com/workers/configuration/cloudflare-access/

## What the evidence does NOT prove

1. The real Cloudflare account was **not accessed**. No Cloudflare connector is installed; no credentials were requested or received.
2. A listing is not proof that an Access policy is enabled/secure or that the Worker is private. Even `type: worker` plus a policy field cannot verify actual enforcement. A live deny test is essential after a separately authorized staging release.
3. A matching Durable Object class name is not proof of the specific binding, current storage contents, data isolation or deletion. This script never enumerates objects or reads user data.
4. No determination is made of actual current deployed code SHA, secret provisioning, WAF enforcement, CORS, authenticated Service Tokens, PITR retention or financial regulatory permission.
5. No real minor or real-money feature is authorized. Use fictional profiles and consenting adults only after proper research/security gates.

## Account owner's next safe action

Run the script **locally** from the Family branch using a separately issued, narrowly scoped, time-limited **read-only** Cloudflare API token and account ID in shell environment variables. Do not paste them into ChatGPT, GitHub or logs. Check the redacted output for risky or incomplete signals. Do not treat `launchVerdict: NO_GO` as a failure of the command; it is the intentionally permanent release safety verdict.

If the account inventory succeeds, a **separate review** must verify exact Worker namespace/routes/deploy SHA and Access configuration on both new Family Workers, including actual CORS behavior, restricted access and Cloudflare WAF, followed by an independent privacy/security review and an explicit owner release authorization.

**Status: SOURCE INVENTORY HARDENED; LIVE ACCOUNT NOT INSPECTED; PRIVATE STAGING NO-GO; HISTORICAL COLOSSEUM WORKERS FROZEN.**
