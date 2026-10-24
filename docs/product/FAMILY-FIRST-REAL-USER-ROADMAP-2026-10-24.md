# CRESCO Family-first — real-user readiness and plain-language recovery
Date: 2026-10-24 · Status: PROPOSED_PRODUCT_DIRECTION / READ_ONLY_AUDIT · No Concept Lock for real-money service
Scope: preserve the **Stocklana Vercel Family-first experience** and the **Colosseum Cloudflare submission**, while prioritizing real users over new speculative agent-finance infrastructure.
**Documentation-only PR. No implementation, API keys, migration, deployment, real-money transaction, code alteration or historical submission mutation authorized by this document.**

## Product decision input
The founders' discussion on 2026-10-24 highlighted why the original Stocklana Family app resonated: an accessible promise understandable to a parent or teenager. Stocklana used https://cresco-lac.vercel.app/ ; the current consolidated Cloudflare public entry also hosts Family and Delegated Capital, alongside two **separate Family/Workspace identity and state systems**.
This is a proposed priority shift, not proof that Stocklana judges won because of wording, a business-market selection, or consent to replace a frozen submitted build.

## Source and evidence boundaries
- Public original Vercel landing: https://cresco-lac.vercel.app/ ; observed HTML copy: “Learn investing together. Grow with confidence.”, Practice Mode, Money Mode, parent sign-in and **Devnet demo only** disclaimer. **The Vercel and Cloudflare landing and multiple Family/technical public pages were fetched on 2026-10-24. Authenticated click-throughs and browser visual QA were not run.**
- Current product GitHub: https://github.com/Faadil1/cresco ; direct code review from `main` on 2026-10-24.
- [Family baseline product/PRD.md](../../product/PRD.md), [world-fair PRD](../worlds-fair/product/PRD.md), [source state](../../state/CURRENT.yaml) / [handover](../../state/HANDOVER.yaml), [reconciliation](../worlds-fair/RECONCILIATION-2026-10-12-PM.md), [release lock](../worlds-fair/RELEASE-LOCK-2026-10-12.md).
- In Cloudflare, original Family app `/start`, `/home`, `/learn`, `/explore`, `/portfolio`, `/profile`, `/parent` and Workspace Family `/worlds-fair/desk?case=family` remain **distinct identity/state environments**, without account migration.
- `apps/web/src/app/start/page.tsx` and `apps/web/src/app/parent/sign-in/page.tsx`: the email input is not submitted to a real auth provider; both invoke `auth.signInDemo`. Parent UI text admits no identity verification/KYC.
- `apps/web/src/services/index.ts`: `auth.signInDemo` and `funding.addMoney` produce demo-session and demo-credit respectively.
- `apps/web/src/app/parent/(dash)/add-money/page.tsx`: “Add money” explicitly states “Demo funds only. No payment was taken.”
- `docs/BACKEND-API.md`: `POST /api/v0.2/funding/deposits` is **test credit**, `realPaymentTaken:false`. No bank/card connected.
- `apps/web/src/services/cresco-backend.ts`: distinct child/guardian demo tokens currently stored in browser `localStorage`; **not a production identity/session security model**.
- `docs/worlds-fair/WHO-ENFORCES-WHAT.md`: default Devnet server-held guardian vs opt-in wallet-signed principal; scope must stay explicit.
- `programs/keys/src/lib.rs`: legacy token transfer-path concerns found during independent review (no full action hash recomputation and omitted caps), rule revision resets period counts, recovery paths not established; swap proof is narrower and different. All real-fund release claims BLOCKED.
- Public Cloudflare HTML was independently retrieved via external extractors on 2026-10-24. The homepage footer showed `build 6464dd2`, matching the top recent GitHub commit, but client hydration/interactive navigation and API/chain binary binding have not been independently replayed. See [complete public-site audit](FAMILY-LIVE-SITE-AUDIT-2026-10-24.md).

## Correction: restoration is DONE\nOn 2026-10-24 the founders clarified that the Cloudflare site already contains the restored simple Family language and warm UI. **Do not carry out a new restoration redesign**; audit specific confusion, test with parents and isolate future auth/real-user implementation on a separate branch based on current product main.\n\n## Proposed experience principles
1. **Start with the parent or young person's situation, not the blockchain primitive.** A young person learns and practices; their parent sets clear boundaries; requests are exceptional.
2. **Use the original Family language as a comprehension benchmark**, not a pixel-by-pixel rollback. Preserve warm visual treatment, accessibility, responsive layouts, real interactions and the latest correct fixes.
3. **Three honest modes, never conflated:** (a) Practice = simulation, no funds; (b) Devnet demo = real testnet transfers of demo tokens, no bank payment or real securities; (c) Real money = NOT_AVAILABLE until partner, custody, permission, eligibility, money rail and legal gates proven. Consider whether the public label “Money Mode” creates confusion until real.
4. **Two users, one family relationship:** parent signs up using verified identity and controls permissions; teen joins a parent-managed invited profile appropriate to age/consent. No self-selected guardian roles or unverified “parent” email as authority.
5. **The journey is end-to-end:** enter -> understand -> practice -> parent joins -> set allowance/Key -> propose -> approve/deny -> see result and history -> change/pause -> recover access -> withdraw/close when applicable.
6. **Technical truth must remain inspectable:** program/system semantics protected; no fabricated success, no conflation of market price with a security owned, no move from demo to real by CSS/copy alone.
7. **Family-first is sequencing, not silent deletion of Delegated Capital:** mature v0.4 research stays preserved and can supply reuse, but does not dominate Family onboarding.

## Reality gap table — observed source vs target
| Surface | Existing state seen in source | Gap to real family usability | First safe deliverable | Gate |
| --- | --- | --- | --- | --- |
| Landing and explanation | Original Vercel page has clear teen/parent problem, Practice vs Money, zero-funds disclaimers | Evaluate comprehension and reconcile current Cloudflare copy/navigation | Plain-language editorial audit, moderated first-click test | P0 |
| Sign-up/sign-in | `signInDemo(child/parent)` with optional email shape only; demo role bearer tokens | Verified parent ownership, secure sessions, recovery, logout on all devices, durable accounts and auditable permissions | Auth threat model + adult-only sign-up specification; dev-only end-to-end auth prototype | P0 |
| Parent–teen link | Demo family link code and separate workspace role store | Secure invitation, correct household binding, revocation, minors' data and family consent | Invitation and parental consent flow tests, cross-role denial tests | P0 |
| Learning/practice | Lessons, market discovery and Practice UI already exist | First-session comprehension, progress persistence across devices, avoid implied real holdings | Usability test and persistence tests; concise labels | P0 |
| Family Key, requests, approvals | Existing rules, history, requests and Devnet swap proof scoped | Honest user-facing limits, missing/expired approval, mutation/replay and negative messages understandable by families | Role-based test matrix with negative paths and one-screen reason codes | P0 |
| “Add money” | `funding.addMoney` creates demo credit; no card/bank; Money display is demonstration | Explain exactly whether/how a parent could add **real** funds, where money is held, who can withdraw, transfer finality/refunds, payment failure | Money-flow options/partner and compliance decision memo; no payment integration before gate | P0 PLAN / REAL_MONEY BLOCKED |
| Asset claims | Demo SPL tokens; AAPL market-price evidence; no actual shares | Distinguish quote, underlying token rights, actual economic ownership, minors' legal eligibility | Asset-representation and disclosure review | P0 |
| Recovery and exits | Some pause/revoke paths exist, no general Anchor withdrawal/close/guardian rotation found in reviewed program; wallet mode revocation not live exercised | Parent/teen account recovery, lost wallet, fund withdrawal/closure, consent withdrawal, support and failed transaction reconciliation | Safety/recovery specs and Devnet/local negative tests before real funds | P0 REAL_MONEY BLOCKER |
| External testing | Devnet 5/5 campaign scoped; no observed real family onboarding testing | End-to-end first-time use by non-technical people, independently measured | Recruit consented adult testers; avoid actual funds and unnecessary minor data | P1 |

## User journey sketches for delivery
**Adult parent (Practice first):**
1. Landing: understand promise and demo status in <30s (hypothetical metric; test needed).
2. Create real account using email magic link/passkey/identity solution TBD; verified adult/guardian association.
3. Create a child profile (age-appropriate data minimization), invite/link teen via secure one-time flow.
4. Choose Practice first; set clear limits, discuss goal and request decisions.
5. Review example (within-limit approval-free, over-limit refusal), “Not this time”, “Allow once”, “Change limit”; log transitions.
6. View consistent history, notifications, revoke/close and recovery.
**Teen:** guided no-wallet Practice; see “What you can do”, learn/choose, attempt beyond rule, clearly explain refusal and ask; no ability to self-declare guardian or change rules.

**Future real-funding flow — SPEC ONLY:**
Parent chooses a regulated provider/payment rail -> undergoes applicable KYC/eligibility and consents -> receives itemized amount, fee and asset representation -> payment is authorized -> **PENDING** -> provider confirms **SETTLED** -> balance appears exactly once in the reconciled ledger -> governed action -> withdrawal/return/refund/reversal and support paths. Never show “Money added” on initiation or use bank/card UI without the provider's verified settlement state.

## Workstream phases / acceptance criteria
### Phase 0 — Baseline product reality and 2-host audit
- Verify which site/version shows which screen; prevent stale Vercel vs current Cloudflare confusion.
- Mobile+desktop screenshot capture by an authorized browser environment for landing, onboarding, practice, limits, requests, parent, money demo; record live host commit IDs before asserting production state.
- Role/copy audit: point out labels that misrepresent demo capital, market data or user permissions.
- **Acceptance:** one source-bound cross-site inventory with working/partial/missing statuses and precise screenshots/route refs; no submission edits.

### Phase 1 — Usability and language, not replatforming
- Choose one friendly Family narrative, clear modes, role switch and error/empty states, readable money/risk content; preserve proven code.
- Actual participants: observe several adults with a first-use script: “what is it”, “who can decide”, “does this move actual money”, “what happens on refusal”.
- **Acceptance:** parent can articulate demo vs real and approve-once vs increase-limit without coaching; qualitative findings and task logs recorded, including failures.

### Phase 2 — Auth + family lifecycle (test/staging only)
- Shortlist identity and data backends after security/privacy constraints (email magic link/passkey, role-bound server sessions, appropriate account deletion). Existing demo remains separately labeled.
- Build parent account/verified invitation/teen linked profile/guardian-only financial authority/server-side owner checks, durable progress/mandate mapping, logout/recovery; test account cross-over, expired invite, abandoned sessions, duplicate invite and child role escalation.
- **Acceptance:** restart/new device works with no cross-family reads; unauthorized actor cannot create/change guardian financial approval; zero demo token treated as production authority.

### Phase 3 — Financing architecture and safety (NO REAL_MONEY until gate)
- Get qualified counsel and potential properly authorized provider feedback before choosing stablecoin/fiat or tokenized equity rail in Canada/Québec or another target jurisdiction.
- Identify guardian ownership/custody, deposit and payout provider, compliance responsibility, settlement/refund rails, fees, minors' eligibility, data retention and recovery.
- Test simulated partner sandbox with durable idempotent ledger and PENDING/FAILED/UNKNOWN outcomes, never inject actual payment credentials into demo.
- **Acceptance for proposing real-money pilot:** written legal/provider/asset/identity/custody/risk decision, independent security review and Devnet negative tests for withdrawal/rotation/revoke and legacy transfer invariants, verified transaction and refund recovery, pricing and support owner identified. Otherwise blocked.

### Phase 4 — Limited external validation
- Pilot Practice and family role workflows with consenting adult households and clear demonstration labels. Assess activation, retained learning, comprehension, fraud risk, support burden and incident handling; never infer paid demand.
- Only discuss real-funds pilot after separate risk, compliance, provider and human authorizations.

## Copy directions to test (not new marketing claims)
- Hero: “Learn investing together. Grow with confidence.”
- Parent: “You set the limits. They learn to make choices.”
- Teen: “Practice first. See what your Key allows.”
- Over-limit: “That’s above your family limit. Try a smaller amount, practice, or ask your parent.”
- Allow once: “Approve this exact action one time. Your regular limit stays the same.”
- Money banner **while still Devnet:** “Demo money only — no bank account connected, no real shares or cash.”
- Funding CTA **while still demo:** “Add practice credit” or “Add Devnet test credit” based on exact surface; never “Deposit cash.”

## Canonical & governance gates (no new authority)
PRE_BUILD_REALITY: ACTIVE
TECHNICAL_REALITY: ACTIVE
TRUTH_BOUNDARY: ACTIVE
NEGATIVE_PATH: ACTIVE
EVIDENCE_INTEGRITY: ACTIVE
FAMILY_EXPERIENCE_QUALITY: BLOCKED_LIVE_HOST_AND_USER_TEST
PRODUCTION_AUTH: BLOCKED_DEMO_ONLY
FAMILY_IDENTITY_LINK: BLOCKED_FOR_REAL_USERS
REAL_DEPOSIT_AND_WITHDRAW: BLOCKED_NO_RAILS_OR_COMPLIANCE
CHILDREN_PRIVACY_CONSENT: BLOCKED_REAL_SERVICE_MODEL
CUSTODY_SECURITIES_REGULATORY_REVIEW: BLOCKED_REAL_SERVICE_MODEL
SOLANA_PROGRAM_SECURITY_REVIEW: BLOCKED_FOR_REAL_MONEY
RECOVERY_GUARDIAN_ROTATION: BLOCKED
RUNTIME_COMMIT_BINDING_CURRENT: UNKNOWN
FROZEN_STOCKLANA_HISTORY: PRESERVED
FROZEN_COLOSSEUM_SUBMISSION: PRESERVED
CONCEPT_LOCK_REAL_MONEY: BLOCKED
DEPLOYMENT: NOT_AUTHORIZED

## Compliance context (primary official sources, retrieved 2026-10-24)\n- **[Focused regulatory decision matrix](FAMILY-REGULATORY-FUNDING-GATES-2026-10-24.md)** tracks Québec Law 25 / CAI, Canada's new Children's Privacy Code, AMF/CSA tokenization, FINTRAC service classification and available funding/eligibility without treating a financing program as guaranteed.
- Québec AMF: https://lautorite.qc.ca/en/general-public/investments/crypto/how-to-buy-and-sell-cryptoassets — registration, KYC and rules can apply to cryptoasset trading platforms.
- Canadian Securities Administrators: https://www.securities-administrators.ca/investor-tools/crypto-assets/regulation-of-crypto-assets/ — asset characterization and custody/trading platform model determine securities-law applicability.
- FINTRAC MSB test: https://fintrac-canafe.canada.ca/msb-esm/questions/2-eng — **activity-based** registration assessment; avoid claiming registration universally required for all architectures or unnecessary for a non-custodial solution.
Not legal advice. This document does not select a jurisdiction, fintech provider or asset issuer.

## Priority and non-interference
Family user value and reliable real-account workflows **first**; speculative new portable agent reputation and Edge Record expansion **research-only**, not the next build. Existing v0.4 delegated-capital proofs remain intact and cannot be silently retold as Family production.
Historical published Stocklana/Colosseum builds, external awards, PR #65, stable videos, site deployments, cloud resources, user financial data, wallets and all real funds are **outside this PR**.
