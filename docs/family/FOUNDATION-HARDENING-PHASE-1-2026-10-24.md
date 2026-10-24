# Family foundations, phase 1 — truthful demo entry and funding recovery

Date: 2026-10-24 | Branch: fix/family-foundations-demo-truth-20261024
Status: DRAFT / SOURCE_PATCHED / CI_AND_EXTERNAL_VALIDATION_NOT_YET_PROVEN
Work type: Source code and negative-path tests. No merge or deploy authorized. No real user recruitment authorized yet.

## Existing product preserved
- Historical Stocklana Vercel submission untouched, original Family Key premise preserved.
- Current Cloudflare editorial restoration, Core Family practice flow, Solana Devnet lab, World's Fair campaigns, capital path and prior PRs untouched.
- No new banking rail, custody, tokenized security, financial instrument or authority widening.
- Historical proof (5/5 Orca Devnet) is path-specific and does not validate the legacy Family transfer exception.

## Exactly what this patch does
| Existing source reality on main @ 6464dd2 | Proposed change on this branch | Evidence/limitation |
| --- | --- | --- |
| `/start` asks for a child-facing email, but calls `auth.signInDemo` (no email sent) | Remove misleading email collection; offer guided vs quick demo using fixed fictional alias Alex | Unit tests proposed; demo backend remains unverified |
| `/parent/sign-in` asks for parent email but calls unverified demo guardian endpoint | Remove misleading email collection; explicit shared/unverified guardian access using fixed alias Sam | Unit tests proposed; any person can still obtain demo parent role |
| `/onboarding/about` asks for first name and age 10–15 | Use fictional learner profile; no real minor personal information requested in that onboarding step | Unit tests proposed; older localStorage records may still hold previous demo data |
| `/parent/add-money` has transparent small-print disclaimer, but heading suggests actual money, and rejection can strand `busy=true` | Heading and nav use demo credit; only confirmed matching funding response mutates client balance; error resets busy and allows retry | Unit tests proposed; backend state is still shared Devnet test balance |

**Truth boundary:** This is a better-marked DEMO, NOT real parent/child authentication, account isolation, legal parental consent or secure real funding. Displayed simulation / demo token assets have no real purchase/ownership value. These changes must not be described as family readiness.

## Priority blockers after this patch — product-deepening sequence
### P0 — actual household identity and authority
1. Decide compliant target pilot model with counsel: adult-only practice-first. Do not onboard real minors until relevant jurisdiction-specific consent mechanics are established.
2. Use verified adult auth (for example WebAuthn/passkeys or properly verified email OTP via a selected identity provider), not a `demo-session` endpoint. Provider selection and tenant architecture NOT DECIDED. Do not hardcode pseudo-tokens.
3. Server-side persistent household registry keyed to verified adult identity. Separate household ID from demo-global Durable Object. Verify each request by verified session subject + household membership + role + resource owner. Role switch cannot grant parent privileges; guardian must be independently verified.
4. Inviting a learner, consent proof, role revocation, TTL, logout across sessions/devices, data retention and deletion (including backups/audit records) must be designed and tested before accepting minor personal data. No real household ever shares `stocklana-demo-family`.
5. Add adversarial tests: anonymous GET/POST, cross-household token, expired token, stolen link, child self-guardian, parent revocation, same-device role switching, browser refresh, offline session, scope confusion and non-idempotent actions. Any unauthorized attempt should return 401/403 and cause ZERO state changes.
6. PR #62 has separate v0.4 workspace read authorization work; independently review and integrate it first or in coordinated sequence, avoid copying its code. It does NOT solve Family v0.2 household identity.

### P0 — capital authorization and recovery (separate contract PR, no real funds)
- Reproduce the legacy `execute_once_with_pyth` hash-binding, notional, period budget and destination constraints on isolated local validator/test assets. Verify claimed mitigations; do not assert an exploit without reproduction.
- Compare exactly with Orca canonical swap path and Family front-end request bridge. Close any validated discrepancy; preserve nonce/version/refusal invariants.
- Verify `update_asset_rule` does not unintentionally reset period usage. Test real rollover vs unauthorized reset.
- Enumerate actual IDL/instructions; confirm vault exit, guardian rotation, close/refund and incident recovery before recommending design; implement with independent review.
- Maintain the principal-wallet vs server-held guardian distinction. Demo server key never qualifies as a real-user guardian or KYC.
- Independent security audit, explicit costs/budgets, legal/custody analysis and full Devnet regression are hard gates before any real-value launch.

### P1 — Family coherence (only after P0 path defined)
- One accessible role/purpose mental model: Learning, Practice (simulated), Devnet Money (test token) and Real Money (not implemented).
- Align local store, API and server state; no cross-device or durable-account claims until verified.
- Complete learner boundary request, guardian refuse / allow exact once / explicitly widen, stale and replay, approval expiry, and UNKNOWN outcome retry with distinct UX for simulated vs Devnet.
- Consistent human copy and verified locale-sensitive scenarios (Canada/Nigeria hypotheses tested with adult participants; no national stereotypes).
- Recovery, help, accessibility, screen-reader, phone widths, network failure, error return and reset/no hidden money change.

### P1 — Evidence and release authorization
- Web + backend isolated tests on exact branch head; check all CI workflows and report actual pass/fail, not inferred status.
- If testing live code later: verify deployed commit, runtime source, test account/tenant, audit traces, privacy constraints and explicit owner deployment authorization.
- Preserve historical Stocklana + Colosseum videos/links and deployment boundaries; no auto-merge/auto-deploy.
- Then perform adult-only moderated internal acceptance. External buyer interviews may occur in parallel only to validate *problem*; product user trials must wait for role/privacy and state safety gates.

## Traceability / acceptance criteria
- [x] Remove child email/age/name collection on initial sample demo flow in source.
- [x] Remove parent misleading email sign-in collection in source.
- [x] Add explicit shared/unverified guardian role warnings in source.
- [x] Make demo-funding error fail closed in UI, retryable without false local credit.
- [x] Add proposed tests covering above.
- [ ] CI passing at exact HEAD and human review (not yet proven).
- [ ] Real adult identity and tenant isolation (not implemented).
- [ ] Safe authenticated funding and reconciliation for a real-money service (not implemented).
- [ ] First real user onboarding in selected jurisdiction (blocked).

Do not transform this doc into an automatic launch checklist where proposed tests become evidence; replace each unchecked item with actual CI/job/signature after observed execution. Privacy and licensing claims need qualified local counsel. The company/research PR, including Decision Practice differentiation, is independent and remains unmerged.
