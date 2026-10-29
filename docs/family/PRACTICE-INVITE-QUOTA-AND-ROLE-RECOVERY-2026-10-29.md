# CRESCO Family Practice — Invite Caps, Role Recovery, and Security Gate
**Date:** 2026-10-29 | **Status:** DRAFT / NO DEPLOY / adult fictional research only

## Scope and proof boundary

This is a separate security hardening PR *stacked on Family draft #103*, which in turn stacks on #102 and the isolated Family branch. The original Colosseum `cresco` and `keys-api-stocklana` Cloudflare Workers, historical Wrangler configs and production `main` are untouched. No actual minors, PII collection, real balances, USDC, stocks, yield, mainnet, Devnet transfers or investment authority.

## Controls implemented in source

**1. Single shared server-side invitation quota**

- `CrescoFamilyPracticeInviteGuard` is an independent SQLite-backed Durable Object, bound **only** to the new `cresco-family-api` Worker as `FAMILY_PRACTICE_INVITE_GUARD`.
- A **valid** invitation must reserve a slot *before* a practice is created. The shared singleton DO enforces **6 creations per UTC day and 20 per rolling 32-day window**, including concurrent requests. Guard unconfigured or DO failure returns 503 (no practice created); exhausted slots return 429.
- Reservations are consumed on later creation failure by design, to avoid uncontrolled issuance under failure/retry. This may reduce actual participant capacity. The 32-day state is automatically purged with an alarm.
- No names, IP addresses, child details, token secrets or wallet identifiers are stored in the guard.
- Invalid invites do **not** consume reservations; a separate Cloudflare WAF / abusive-rate policy before public exposure is still a blocker. High-entropy secret is mandatory. This cap is for a small adult-only research cohort, NOT general account creation.

**2. Parent-requested Teen role code replacement**

- An authenticated Parent-role holder can POST `/api/family-practice/v1/sessions/{uuid}/teen/rotate`. Edge generates a fresh 256-bit access token, DO stores only its domain-separated SHA-256 digest, and the old Teen code immediately loses authorization.
- The response shows the new Teen code only once in the Parent session. No code is put in URL, cookies, localStorage, analytics or public logs by application code. Parent code stays unchanged.
- If rotation response becomes UNKNOWN, the Parent can read the state and rotate again; old Teen code **may** already be invalid. The UI blocks follow-on actions until manual review.
- This is a bearer role permission, NOT child identity or guardianship.

**3. Compromised Parent: operator-only emergency shutdown**

- A separate, high-entropy Worker secret `CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN` can authorize `POST /api/family-practice/v1/sessions/{uuid}/emergency-close` with header `x-cresco-family-practice-operator`.
- Only the new Family edge Worker exposes this. It forwards an internal DO erase and refuses if the secret is missing/invalid. Neither the public UI nor browser bundles contain the operator secret.
- All active state and both role code digests are deleted if the DO confirms the request. **Emergency closure does not prove an unrelated person is a parent**. An operator needs the random practice UUID; an unauthorized caller cannot close it.
- No instant *recovery* of the compromised Parent code is promised. Emergency closure ends the research practice, then a new invite-created exercise is required.

**4. Release boundary**

- Dedicated third DO binding and class export in `wrangler.family-api.jsonc`.
- `scripts/family-release-boundary.mjs` checks the extra DO and disallows operator/invite secrets from committed Wrangler vars.
- All API states and actions remain fictional. `main` is untouched. This branch must not be merged into `main`.

## Planned verification

- Node: valid-invite creation cap under concurrent submissions; absent guard fail-closed; distinct role permissions; rotated Teen code invalid; Parent remains valid; operator secret invalid / missing refusal; emergency close invalidates both codes; existing replay, race and expiry tests.
- Web: TypeScript, lint, copy policy, unit tests, existing Colosseum WebKit.
- Family dry-runs: standalone web artifact and API bundle, NO DEPLOY.
- Mocked Family WebKit: two isolated mobile browsers and intercepted API. This is **not** a real hosted two-device proof.

## Unresolved independent release blockers

- Cloudflare account/Worker namespace identity, origin, DO bindings, exact deployment SHA and encrypted secret provisioning remain unverified; **do not deploy without owner sign-off**.
- High entropy of invitation/operator tokens, actual rotation procedure, audited issuance, WAF/rate limiting for invalid attempts and abuse reports require independent security review.
- SQLite DO Point-in-Time Recovery/backups can retain prior state after live `deleteAll()`; obtain verified provider retention policy and appropriate adult consent/privacy wording.
- Origin/CORS restrictions are not authentication. Guardian verification, participant identity, session consent, secure distribution and recovery are separate pending work.
- No actual child test enrollment, customer traction or financial product authorization. Adult volunteers should use only fictional child personas.
- Prior hosted Family/Colosseum read-only probe currently fails against intentionally frozen historical API. This must not be “fixed” by changing submitted Workers.

## Decision

**CODE REVIEW IN PROGRESS.** Even with green CI, **PRIVATE STAGING NO-GO until explicit environment, security and privacy approvals**. Financial product and real minor enrollment remain separate NO-GO gates.
