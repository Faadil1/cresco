# Family Practice: privacy lifecycle and isolated mobile browser rehearsal

Date: 2026-10-29
Status: DRAFT / NO DEPLOY / NO VERIFIED MINORS / FICTIONAL CREDITS ONLY.

## Purpose

Complete the next P0 verification gate after PR #102: **end a practice safely, actually schedule expiry, and rehearse separate Parent/Teen browser views** before inviting adult research participants. Neither this change nor the mocked browser tests proves a hosted Family product.

## Changes

- Every newly initialized independent Practice Durable Object schedules a seven-day expiry via Cloudflare `storage.setAlarm()`; `alarm()` purges stored practice state with `deleteAll()`.
- A Parent role holder can explicitly POST `/api/family-practice/v1/sessions/{id}/close` with `{ "confirm": "END_PRACTICE" }`. Teen cannot close. Successful closure deletes practice state and invalidates both role credentials on subsequent reads.
- Parent UI requires an affirmative checkbox before ending a session. An unverified closure stays unverified; it never claims deletion or revocation until the server confirms.
- Added Node tests for automatic purge, premature alarm, Parent-only close, wrong confirmation, and invalid old codes.
- Added distinct WebKit Playwright config and CI: **two independent mobile browser contexts**, each with its own role code, use one **fully mocked** in-memory API. Verify Teen save, Parent observe, Teen request, Parent approve, Teen observe, read outage fail-closed, explicit end, and mobile overflow. Absolutely no real Worker, user, wallet or Solana.
- No change to `cresco` or `keys-api-stocklana`, historical Wrangler, or production branch.

## Evidence hierarchy

| Claim | Required evidence |
| --- | --- |
| Source implements request/decision and TTL cleanup | Code review + Node tests |
| UI can rehearse separate roles in mocked browser | New Family-only WebKit CI for exact PR head |
| Hosted independent Family API/client works | **Not proven**. Needs owner-authorized isolated Worker deployment, SHA verification, real-role sessions |
| Physical two-device cross-location proof | **Not proven**. Run only after security, privacy and staging gates |
| Legal Parent/Teen identity | **Not proven**. Access codes are bearer permissions, not guardian/age verification |
| Financial launch or marketing to minors | **NOT AUTHORIZED** |

## Risk register / blockers before a private beta

1. **Durable storage backups.** Cloudflare SQLite-backed Durable Object Point-in-Time Recovery can retain historical recovery data for up to 30 days. `deleteAll()` removes live DO storage but a verified provider backup/retention position is still needed; do NOT promise immediate erasure of all backup copies. See Cloudflare official API docs.
2. **Invitation abuse / rate limits.** A leaked global invitation secret can create unbounded sessions. Add owner-controlled per-invite quotas, abuse/rate controls, and audited secret rotation before external access.
3. **Token compromise.** Role codes are bearer secrets with no individual token rotation, reissuance, or recovery. The Parent can end the whole exercise; compromise response and account recovery remain incomplete.
4. **No identity or age proof.** Code holder can impersonate role. Research must involve consenting adults operating fictional youth scenarios, not real children.
5. **No independent security review.** Do not enable financial/Devnet writes; do not broaden routing to legacy APIs.
6. **Host binding unknown.** Cloudflare account, DNS, secrets, DO binding and published build SHA remain unverified.
7. **Service unavailable.** An uncertain fake-credit action quarantines subsequent actions until explicit manual history read; test offline/reconnect under hosted staging later.
8. **Browser mocking is not hosting.** The two-context test intercepts every practice endpoint; no network proof, caregiver feedback, or user traction is established.

## GO / NO-GO

Development CI can pass while release is still **NO-GO**. Promotion to a privately invited adult-only research build needs an independent security/privacy review, dedicated Cloudflare account + Worker identity verification, rate controls, retention language, test plan, exact SHA binding and consented parent research protocol. Never modify the original Colosseum Workers.

**Current truth:** SOURCE_BETTER / TESTS_IN_PROGRESS / HOSTED_NO_GO / FAMILY_FINANCE_NO_GO.
