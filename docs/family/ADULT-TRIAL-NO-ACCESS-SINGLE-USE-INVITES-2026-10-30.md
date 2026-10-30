# CRESCO Family — Adult-only, no-login, one-use research invitation
**Date:** 2026-10-30 | **DRAFT / SOURCE TESTS ONLY / NO DEPLOYMENT / NO REAL MINORS / NO REAL MONEY**

## Decision
The founders want a low-friction invitation for a small number of consenting adults. **Cloudflare Access is not required for testers** in this research edition. Instead of claiming the site is private, treat its eventual `workers.dev` URL as **publicly reachable** once enabled, with every **fictional practice** guarded by signed, expiring, single-use codes and role-specific access codes.

This is materially different from disabling authentication for a financial product: the new Family Worker **hard-blocks every old Devnet/workspace/Capital/transaction route**. Only `/api/family-practice/v1/` is reachable in `CRESCO_FAMILY_RESEARCH_ONLY=1`; without the flag all requests fail closed with 503. No Solana writes, wallets, financial accounts or actual youth onboarding.

## How an adult tester experiences it

1. Receives a Family practice URL and one personal research code from the cofounders, shared privately. They **do not** register, provide email, connect a wallet, or log into Cloudflare.
2. Opens the Family practice page, enters the code **once** to create a fictional practice. Default invitation expiration is 72 hours; owner can issue codes for 1–168 hours. No PII, age or guardian identity is part of invitation validation.
3. Receives one 7-day fictional practice ID plus separate cryptographically random **Parent** and **Teen** role codes. Adult testers use fictional roles on separate devices. These role codes are NOT a legal guardian relationship check.
4. Teen role can save exactly 20 of 100 pretend credits and ask a diversified-funds discussion question. Parent can approve/decline that **discussion**, rotate Teen role code or end session; no investment authority.
5. Both roles can view a persistent fictional history, refresh state and handle retries. Parent closure revokes both codes; automatic deletion after day 7. Active DO erasure does not assert backups/PITR erasure.

## Invitation security and limits

- Per-adult invite format `fi1.<expiry-base36>.<128-bit-random-nonce>.<HMAC-SHA256>`. HMAC secret is generated and provisioned only by the operator for the **new Family API Worker** as `CRESCO_FAMILY_PRACTICE_INVITE_TOKEN` (historical name retained, now used only as a signing key). It is NEVER included in the frontend or source.
- Signature verified by WebCrypto; max 7 days validity, rejects tampering/expired/different key. Random nonce means each generated invitation is independent.
- The shared isolated invite quota DO atomically records only the **SHA-256 hash of each consumed invitation**, not the invitation string or identities. Replaying the same code returns HTTP **409**, even if used simultaneously. Global cap remains **6 new practices per UTC day / 20 per 32 days**. A reserved code is consumed even if subsequent session initialization is uncertain, for anti-replay safety.
- Invitation failure is 401 (invalid/expired), 409 (already used), 429 (valid research quota reached), or 503 (API/DO unavailable). UI gives readable guidance; no auto-resubmit after uncertain writes.
- Operator recovery remains independently protected by a distinct high-entropy `CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN`, exact new Family API host, CLI confirmation and **no Origin**. There is no Cloudflare Access service token requirement for testers or the operator.
- Browser CORS remains restricted to the exact Family Web origin; CORS is not authentication. Codes are not placed in query strings or localStorage. Parent and Teen codes are role-scoped and hashed at rest.
- Rate limiting for **invalid** invitations, IP-based bursts and operator guessing remains **unverified** until actual Cloudflare security configuration (WAF/rate rules/observability) is reviewed. Do NOT assume a secret invite URL makes the endpoint private. No blanket security/financial/child privacy claim.

## Issue individual invitation offline (not authorized until a deployment plan exists)

On a trusted owner device with Node 22 and a freshly generated **strong separate signing key** held in a private environment variable:

```powershell
# Signing key must be in your trusted local shell environment already,
# equal to the separately provisioned NEW Family API Worker secret.
node scripts/family-practice-mint-one-use-invite.mjs --hours 72
```

The CLI issues one standalone invitation and **does not contact Cloudflare**. Share only that generated code, privately with a consenting **adult** tester. Do not paste the underlying signing key in chat, git, a PR, a browser client, or a publicly indexed document. Do not send a real minor a code.

This is **not** a provisioning command. No secret has been installed in Cloudflare, no Worker created, no approved public URL exists.

## Release sequence and hard NO-GO

- Source and CI: validate exact branch SHA, fail-closed test cases, two-role mocked WebKit, isolated API/web dry-run and historical config freeze. Review any failure.
- Future first install: **separate explicit owner authorization** to create `cresco-family-api` and `cresco-family-web` **with `workers_dev:false`, `preview_urls:false` and zero routes**. Never modify historic `cresco` or `keys-api-stocklana`; no `main` merge.
- Future provisioning: owner separately provisions fresh **invite signing key** and **operator secret** ONLY to the new API Worker; WAF/rate limits, basic request-size caps, Cloudflare logs redaction, retention/PITR privacy notice. Obtain cofounder sign-off for adult research consent.
- Future limited trial: after another separate approval and review, enable **only the new dedicated Family Web and API `workers.dev` URLs**, leaving preview URLs disabled. At that moment the URLs are publicly reachable; Access is deliberately absent. Verify no unauthenticated practice creation, invalid/expired/reused invite, role 403, 100→80/20 fictional credit flow and recovery across two devices. Record host/SHA/privacy-safe evidence.
- **No real minors, no real assets, no financial advice, no claims of legal guardianship, no automated AI trader** in this trial.

## Supersedes source-era Access proposal

Stacked PRs #105/#106/#107/#108/#109 recorded a more complicated Access-first plan. This branch intentionally changes that **only for the small fictional adult research product**. Access documents remain historical decision records; the current code/release boundary and this runbook govern the no-login proposal, subject to approval.

Sources:
- Cloudflare workers.dev is publicly reachable when enabled: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- Preview URL setting can remain separately disabled: https://developers.cloudflare.com/workers/previews/custom-domains/
- API structure in this repository: `src/cloudflare-family-practice-api.mjs`, `src/cloudflare-family-practice-invite-guard.mjs`, `src/cloudflare-family-practice-invitation.mjs`
