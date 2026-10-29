# Family Practice v1 — persisted fictional decisions across two isolated roles

**Date:** 2026-10-29
**Status:** SOURCE / DRAFT PR / NO DEPLOY / NO MINORS / NO REAL MONEY.
**Parent stack:** Family-only #101. The Colosseum-submitted Workers `cresco` and `keys-api-stocklana`, their settings and `main` are FROZEN.

## Product outcome

A consenting **adult researcher** can create an invitation-only fictional practice. Two *different role credentials* work from separate browser/device sessions against the same versioned practice state:

- Teen role: start with 100 fictitious credits; set aside exactly 20 per action (max 100); request to **discuss** diversified funds.
- Parent role: read the same fictitious credit history; approve or decline a specific request to **discuss**, with a finite explanation.
- Both roles: read request status and versioned activity history, including refusals. Automatic read refresh is GET-only while visible; an unverified read blocks writes. No actual financial permissions change.
- Credentials are returned only to the adult facilitator at practice creation; each participant must manually enter their own role code. No tokens in URL, cookie, localStorage or telemetry. Browser refresh loses access until code reentry.
- Invitation secret is a separate Cloudflare **Worker secret** `CRESCO_FAMILY_PRACTICE_INVITE_TOKEN`; it is NOT in Wrangler, source or client. No open public signup. This is NOT a legal guardian identity verifier.

## Architecture / isolation

- **New** Cloudflare-only API prefix: `/api/family-practice/v1` on **new** `cresco-family-api` Worker; explicitly intercepted before legacy workflow routing.
- **New** DO binding and export `FAMILY_PRACTICE_STATE` / `CrescoFamilyPracticeState` in `wrangler.family-api.jsonc` only. Each practice uses `idFromName('practice:' + randomUUID)`, a unique isolated state object. This is separate from `FAMILY_STATE` Devnet lab and the historic Colosseum DO.
- Stored data: random session ID, **hashed** role access tokens, fictional counts, finite enum-only prompts/decisions, timestamps, action IDs, sequence version. No names, ages, emails, financial profiles, wallets or agent access.
- 7-day logical expiry, maximum ten requests, fifty recent events, 80 idempotency keys; expiry refusal is not guaranteed physical storage deletion, so data-retention legal review is STILL needed.
- CORS only to the separate Family Web origin. Invite controls creation; bearer role credential controls every read/write. Teen cannot decide; Parent cannot create a Teen action. No wallet SDK, Solana RPC, asset, yield, investment or onchain writes.
- Each POST requires a fresh idempotency UUID. Exact replay returns same state; mutation with a reused key returns 409. Server validates amounts, topics, decisions and refusal reason enums.
- Family-only Web route `/family-practice` is unavailable in historical builds, while prior financial routes remain refused by isolated route guard.
- Only source/CI simulated tests today, **not hosted multi-device proof**.

## Known limitations (MUST NOT HIDE)

- A researcher creating a practice temporarily receives *both* role codes. This is appropriate only for facilitator-run adult usability tests, **not** proof that a real parent/child identity or trust boundary was verified.
- API is not deployed; URL, Worker secret, DO version, Cloudflare account authorization and live multi-device E2E all remain UNKNOWN.
- Role codes cannot be rotated and there is no verified parent/child identity, recovery, abuse handling, privacy deletion self-service or consent flow.
- Practice decision approval merely permits *conversation*. It does not constitute a spend/stock/ETF/crypto approval, even on Devnet.
- The old Family Devnet desk exists as a separate technical experiment. Practice API does not share its sessions, tokens, permissions, balances or storage.

## Acceptance tests (source / CI)

- Invitation invalid, absent or bad Origin refuses; unknown storage refuses; no historic API fallback.
- Teen save changes 100→80 / 0→20 across distinct role reads.
- Teen request becomes PENDING in Parent view; Parent declines or approves discussion; Teen subsequently reads decision and reason.
- Parent cannot save or request; Teen cannot decide; bad code, bad input, duplicate pending request and an already decided request refuse.
- Idempotent replay does not double debit imaginary credits; reused key with changed action refuses.
- No financial API or child PII is used; Cross-origin OPTIONS explicitly supports private invite and bearer headers.
- CI includes Node, Web and standalone Cloudflare Wrangler **dry run**; not a hosted release.

## Next gates

1. Review exact-head tests and security of practice state, invitation, rate/abuse limits, data lifecycle and role access. Fail any GO decision if unresolved.
2. Validate separate Cloudflare account/source/Worker bindings without altering historic Colosseum builds.
3. Owner-approved, separately provisioned **private staging** only after independent review; DO, secrets and hostname must be checked live. The release is currently **NO-GO**.
4. Two-browser/phone E2E against exact staging SHA; confirm failure/recovery and ask 5–8 consenting adult caregivers (fictional youth profiles). Only then call it tested by users.
5. Privacy and legal review before introducing actual minors. Financial product legal clearance remains a separate later gate.

**Truth labels:** SOURCE_IMPLEMENTED / NODE_TEST_PENDING / WEB_TEST_PENDING / HOSTED_NOT_DEPLOYED / REAL_USERS_NOT_TESTED / FINANCE_NOT_AUTHORIZED.
