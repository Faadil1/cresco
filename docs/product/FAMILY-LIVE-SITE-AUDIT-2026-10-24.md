# CRESCO live Family experience — read-only audit, 2026-10-24
Status: SOURCE_CROSS_CHECKED / LIVE_PUBLIC_TEXT_FETCHED / INTERACTIVE_VISUAL_QA_PENDING
Scope: current [Cloudflare](https://cresco.faadil-casecraft.workers.dev/) and historical [Vercel](https://cresco-lac.vercel.app/). Audit only; no product source, live state, submission or deployment changes.

## Founder correction — critical
**The earlier Family visual/language restoration on Cloudflare is ALREADY accomplished. DO NOT OPEN ANOTHER RESTORATION REDESIGN PROJECT.** The next implementation work should be separated into its own branch originating from current product `main`; the present PR only inventories product gaps. Preserve the warmer editorial UX, current Family UX fixes, original Stocklana Vercel reference, submitted Colosseum identity, agent-capital evidence, and existing proven behavior.

### Evidence method and limits
- 2026-10-24 live public HTTP/HTML extracted with Tavily/Parallel/Exa from homepage, /start, /parent/sign-in, /how-it-works, /home, /learn, /explore, /portfolio, /profile, /profile/parent, /onboarding/about, /worlds-fair, /worlds-fair/desk?case=family and =capital. This is LIVE_PUBLIC_CONTENT, not user interaction.
- Protected /parent redirected to the parent sign-in page (as it should in a demo).
- /parent/requests returned 404 but **that URI was an audit probe, not established as a real link in CRESCO**; not a verified broken navigation defect. Find real UI hrefs before any bug filing.
- Desktop/mobile responsive screenshots, browser navigation/hydration, accessibility keyboard/screen-reader paths, user event effects, financial settlement, current Cloudflare deploy SHA from exact HTTP origin, security headers and authenticated workflow tests **NOT_RUN** in this audit.
- Retrieved homepage footer displays `build 6464dd2` (from parallel extractor); GitHub current recent top commit is `6464dd2ca88479963a536b6c44f178839d132eef`, consistent with *frontend footer* source binding only. Does **not** establish exact API Worker or deployed Solana program binding. Source `state/CURRENT.yaml` / `state/HANDOVER.yaml` still carry stale October 12 references; **do not overwrite them to claim new production proof** without actual runtime/source evidence.
- An HTTP text extractor returned the same Family SSR setup for `?case=family` and `?case=capital`; this is **not proof of a Capital route bug**, because client-side hydration may select the scenario later. Independent browser test required.

## Live screens and role flow — evidence
| Surface | Public live content retrieved | Source scope / code | Rating for authentic external users |
| --- | --- | --- | --- |
| `/` | “Grow independence. Keep the boundary.” Warm Family-first; four explicit steps, parent $0.50, teen $0.30/$0.75; Family and Capital cards; demo disclosure | `apps/web/src/app/page.tsx`, current editorial component system | USER_COPY_PRESENT; no need to restore |
| `/how-it-works` | “Real freedom, clear boundaries.” Demonstrates Maya, within-limit $0.30 vs $0.50, cites Devnet evidence | client progressive explanation; only first step rendered by extractor | PARTIAL_LIVE_HTML; interactive steps UNKNOWN |
| `/start` | Learning-first sign-in, explicitly demo and no production email/account | `apps/web/src/app/start/page.tsx` calls `auth.signInDemo('child')` irrespective of text entered | REAL_AUTH_NOT_IMPLEMENTED |
| `/parent/sign-in` | Parent email, “Continue as Sam (demo)”, explicit no identity/KYC | `apps/web/src/app/parent/sign-in/page.tsx` calls `auth.signInDemo('parent')` regardless of email entered | REAL_AUTH_NOT_IMPLEMENTED |
| `/onboarding/about` | First name and age **10–15** selector, text “Only your family sees it” | profile set locally / demo store; under-14 privacy requirements apply once real collection begins | VERIFIED_PARENT_CONSENT_NOT_IMPLEMENTED |
| `/home` | sample Alex account, 7-day streak, practice $1,248.50, sample prices and Practice/Money switch | practice fixtures and partial backend state; `apps/web/src/app/(child)/home/page.tsx` | FUNCTIONAL_DEMO, no real onboarding proof |
| `/learn` | 2/6 example module progress, evidence-labeled learning, learning ≠ financial authority | learning app routes, sample demo | GOOD_DEMO; external learning efficacy UNKNOWN |
| `/explore` | Pyth-labelled categories Crypto/FX/Metals, equities list and representation disclosure | mix of sample asset snapshots and entitlement-gated live market feeds | DATA_TRUTH_REQUIRES_DYNAMIC_CHECK; not brokerage |
| `/portfolio` | $1,248.50 practice/sample holdings; “Sample prices” disclaimer | demo fixtures | NO_REAL_SECURITIES |
| `/profile` | “Sam is connected”, sample Key v4 and child goals | initial `parentLinked:true` seeded in `src/cloudflare-family-state.mjs` and `apps/web/src/mocks/family.ts` | DEMO_FAMILY_LINK_ONLY |
| `/profile/parent` | Parent sees learning, balances, limits, weekly summary; privacy copy | demo parent relation | PRODUCTION_ROLE_OWNERSHIP_UNKNOWN |
| `/parent` | redirects to `/parent/sign-in` when not demo-signed-in | guard in parent layout | DEMO_ROLE_BOUNDARY_ONLY |
| `/parent/(dash)/add-money` | protected behind parent session; public direct probe redirects to sign-in; source says “Demo funds only. No payment was taken.” | `apps/web/src/services/index.ts`; backend `POST /api/v0.2/funding/deposits` test-credit only, realPaymentTaken:false | REAL_FUNDING_NOT_IMPLEMENTED |
| `/worlds-fair/desk?case=family` | setup says Family workspace, parent/teen/second-parent, test assets; one link per person | v0.4 Durable Objects workspace, role bearer links | LIVE_DEVNET_SCOPE_NOT_PRODUCTION_IDENTITY |
| `/worlds-fair/desk?case=capital` | HTTP SSR shows Family text (same as above) | client-side scenario may change; requires hydrated browser check | INDETERMINATE_NOT_DECLARED_BROKEN |
| `/worlds-fair` | seven-consequence Devnet lab, hard-bound Orca pool, live evidence explanation | 7/7 evidence recorded in historical docs; on-page status “Not ready” before run | DEMONSTRATION_ONLY; not Family funds |
| current direct production flows | No true external-auth event or bank/card authorization was run | `docs/BACKEND-API.md` and source explicitly mark test-only | BLOCKED_FOR_REAL_USERS |

## Priority issues grouped by underlying user capability (not redesign)
P0-A. Account identity and household ownership. Verified adult identity/session, server-enforced account-to-guardian mapping; protected family child profile invitation and revoke; recover access; cross-household read/write boundary. Age-appropriate consent/minimal data and child protection by default. Do not rely on demo role token/localStorage as legal guardian proof.
P0-B. Preserve and converge Family product depth. Distinguish original /start Family learning/practice from v0.4 Family mandate workspace. Define one durable account and transaction/history ownership model before any migration; export/mapping semantics, no authority mixing.
P0-C. Funding truth and asset model. Demo credit is NOT an on-ramp. Create four-level state ledger: test credit, pending real deposit, settled real deposit, withdraw/refund/failed/unknown. Identify legal custody, actual owner, issuer/rights, supported jurisdiction, payments, fees, off-ramp, and closure BEFORE integrating providers.
P0-D. Source-scoped capital controls and exits. `programs/keys/src/lib.rs`: `execute_once_with_pyth` legacy transfer checks hash without recomputing the executed action, omits period-cap comparisons; `update_asset_rule` zeroes period spend counters; transfer exits to beneficiary-controlled ATA; no generic withdraw/vault-close/guardian-rotation entrypoints identified. `execute_swap_once_with_pyth` contains stronger exact hash/period checks; do not invalidate the proven swap path or assume all paths share its properties. Require negative-path local/Devnet tests; no real-money release.
P1. UX-first external testing. Test with **adults as guardians**, and only consent/age-appropriately with minors later: first comprehension, practice completion, ask-parent, distinct one-use vs permanent permission, error states, expiry, UNKNOWN, account recovery, same-family multi-device persistence. Include a user who finds the demo/real-capital copy misleading.
P1. Source/runtimes and QA. Current footer source build 6464dd2 in extracted page; run actual hosted Playwright iPhone/desktop with source build pins, screenshots, keyboard/screen-reader, contrast, animations and modal focus. Bound frontend/API/chain deployments separately.
P2. Monetization evidence. Test parent/guardian need, retention, trust and willingness to pay without transferring real funds. Explain education-only versus regulated execution and partner-led vs direct service. Never count hackathon views as customers.

## Target wording rules
- Preserve “Grow independence. Keep the boundary.” and Family editorial entry unless real user testing contradicts it.
- A parent should immediately tell apart **Practice simulation**, **Solana Devnet test assets**, and **future real-money financial service (NOT AVAILABLE)**. The label “Money Mode” needs a live comprehension check.
- “Parent connected” without actual verified link MUST remain unmistakably demo-contextual for unauthenticated visitors.
- A child must understand a REFUSE/ASK/PENDING/UNKNOWN state with no misleading green confirmation.
- Technical ‘nonce’, ‘Pyth’, ‘CPI’, ‘authority object’ stay in optional details, not onboarding.

## Safe implementation isolation (candidate only; needs review)
1. DRAFT documentation PR **#66** is for audit/acceptance gates only.
2. Once the specific backlog is selected, start an **implementation branch from current main** called e.g. `feat/family-auth-household-staging-v1`, only for authentication/family-link capabilities. Do not base it on `cresco-company`, PR #66, Colosseum video/pitch, or an old Vercel fork.
3. A separate future `feat/family-ux-clarity-v1` branch may adjust copy/layout only after live usability evidence, without reverting prior Cloudflare editorial work.
4. Keep experimental funding architecture **in docs/sandbox only**; no live payment integration, custody or minor-investor onboarding before legal/provider/security and tested recovery approval.
5. Capital/agent research remains in private `cresco-company`; no code grafts into the frozen product without a distinct human-approved Product decision.

## Gate states for this audit
RESTORATION_UI_COPY = ALREADY_PRESENT_IN_LIVE_HTML
FULL_VISUAL_ACCESSIBILITY_QA = BLOCKED_NOT_RUN
REAL_PARENT_AUTH = NOT_IMPLEMENTED
VERIFIED_FAMILY_LINK = NOT_IMPLEMENTED
DURABLE_CROSS_SYSTEM_IDENTITY = NOT_IMPLEMENTED
TEST_CREDIT = IMPLEMENTED_DEMO
REAL_DEPOSIT = NOT_IMPLEMENTED
REAL_ASSET_RIGHTS = NOT_ESTABLISHED
WITHDRAWAL_GUARDIAN_RECOVERY = BLOCKED
LEGACY_TRANSFER_PATH_ASSURANCE = BLOCKED_CODE_GAPS
CURRENT_FRONTEND_BUILD_FOOTER = OBSERVED_6464dd2
API_AND_CHAIN_BINARY_BINDING = UNKNOWN
REAL_CUSTOMER_ADOPTION_WTP = UNKNOWN
SUBMISSION_MUTATION = N_A_NOT_AUTHORIZED
DEPLOYMENT = N_A_NOT_AUTHORIZED
