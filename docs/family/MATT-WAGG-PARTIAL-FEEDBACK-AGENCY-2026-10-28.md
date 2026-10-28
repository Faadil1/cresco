# CRESCO Family — Matt Wagg feedback, first transcript segment
Date: 2026-10-28
Source: team-supplied partial recording transcript (00:02 through the interrupted answer after 29:01).
Status: **PARTIAL FEEDBACK / PRODUCT HYPOTHESES**, not a complete meeting record, legal advice, acceptance by users or a release approval.

## Decision: the child must be an actor

**Proposed value proposition:** "The young person makes the choices. The parent sets the boundaries. Both learn together."

Cresco should not be described as only a parent-controlled wallet or stock-access app. The difference Matt emphasized was active agency: young people can see a balance, understand what happened, initiate a choice and receive a meaningful reply when it exceeds an agreed boundary. Parents should see the actual mechanism and risks; simplicity for a child must not hide crypto or custody mechanics from a parent.

This is a **positioning hypothesis** to test with real households, not proven product-market fit.

## What Matt actually advised (not an endorsement or offer of funding)

| Transcript period | Coaching observation | Product implication |
| --- | --- | --- |
| 04:00–06:35 | Define who uses the product most; potential focus on families where stock access or literacy is limited | Pick a testable first caregiver/teen segment rather than claiming worldwide reach |
| 06:35–13:55 | Identify how families currently handle allowance, savings, gifts and investing without Cresco | Competitor/substitute research: parent bank account, chores, spreadsheet, envelopes, custodial accounts where allowed; **verify** jurisdictional rules |
| 08:40–13:55 | A child often sees neither the balance nor choices; visibility + ability to act is the unique story | Teen sees history, decisions, outcomes; can do safe practice independently and propose more |
| 13:55–20:50 | Regulatory constraints vary; test phased geographic market entry; research parent/child legal differences | Jurisdiction and asset-feature entitlement matrix before any real services. Geo-fencing is not automatically sufficient for compliance |
| 21:10–28:20 | Parents may also need financial literacy; introduce concepts progressively and test the basics on Devnet before polishing everything | Parent/Teen complementary educational flow; practice and evidence before mainnet |
| 24:00–28:20 | Get first testers; learn their objections, failures, friction; update public posts and Colosseum product updates with truthful progress | Consenting adult interviews and verified product-task observations, then communication |
| 28:20 onward | Crypto may confuse families; Matt recommended transparent Parent details and optional child-facing simple/full terminology | Explain plain-language meaning without concealing product mechanism and risk from adults |

Matt mentioned potential introductions to contacts, teams, yield projects and tester communities. **These are offers or possibilities discussed in the meeting, not intros, partnerships, compliance opinions, customers or funding that have already materialized.** The transcript breaks mid-answer; any future recording can amend priorities.

## Current source audit (family/standalone baseline)

| Dimension | Source evidence | State |
| --- | --- | --- |
| Family-only web entry + security | `apps/web/src/components/family-only-home.tsx`; `apps/web/src/lib/family-web-route-guard.ts` | SOURCE: landing, isolated desk; no real deployment |
| Parent/Teen role credentials, requests, decline, recovery | `apps/web/src/app/worlds-fair/desk/page.tsx`; `docs/family/CUMULATIVE-INTEGRATION-REVIEW-2026-10-28.md` | SOURCE/CI from stacked draft; not independently security-reviewed |
| Separate demo learning app | `apps/web/src/app/start/page.tsx`; `docs/FAMILY-LEARNING-LAYER.md` | SOURCE exists, but **blocked by Family-only route guard** in isolated build |
| Parent + Teen progress/visible personal savings | No verified Family-only persistent, server-backed savings and choice history | GAP: cannot claim this is live or that savings/interest exists |
| Parent explanation of risk before opting into a new asset class | Product thesis in transcript; some general learning in docs | PARTIAL / requires interaction and parent comprehension tests |
| Graduated save → understand earnings → diversify → individual security access | Proposed learning sequence, not a permission model | CONCEPT ONLY; no financial products or yield launched |
| Verified legal guardian, age, jurisdiction or custody | Explicit blockers in security review | BLOCKED |
| Full real Parent/Teen multi-device journey + outcome | Mocked tests and devnet lab proof differ from hosted Family | HOSTED NOT PROVEN |
| External caregiver/user feedback | No interviews evidenced in this workstream | NOT OBSERVED |

**Important mismatch:** the isolated Family build currently allows only `/` and `/worlds-fair/desk` (plus assets). It rejects `/start`, `/home`, `/parent`. Do not "fix" this by lifting the route guard without reviewing identity, mock sessions, API endpoint fallbacks, role segregation and the isolated Family release boundary. The original Colosseum app's UI is not evidence that the new Family-only site has usable learning journeys.

## First tiny product experiment — in this draft PR only

Component: `apps/web/src/components/family-agency-preview.tsx`, rendered **only from the Family-only home**. It introduces a side-by-side Teen/Parent story:

1. Teen starts with 100 **imaginary practice credits**, sets aside 20 without requiring a Parent decision.
2. Teen asks to learn about a diversified fund. Parent sees a request **in the same-browser illustration** and may approve or decline a **practice discussion**.
3. Teen sees the response, with "nothing was purchased" and a reset.

**Truth:** this is ephemeral React state. It has no fetch, token, localStorage, enrollment, wallet, financial permission, transaction, quoted interest rate, USDC or actual real/Devnet capital. Approving an illustration is **not** an onchain authorization. Rejection is a first-class outcome. Component tests enforce no network requests, bounded imaginary credits, parent choice and reset.

This is an orientation artifact for product storytelling and test conversations; it is not a replacement for the secure role-separated application or an authenticated Family workflow.

## Product depth sequencing — not a deadline-driven reduction of the vision

| Sequence | User need / experiment | Exit evidence / refusal path |
| --- | --- | --- |
| P0 — Agency & clarity | Can a caregiver explain what a young person can independently do versus request? Is the child-facing value immediately obvious? | 5–8 consenting **adults** perform a task or describe expected roles; record misunderstandings and refusal reasons, no minor data collection |
| P0 — Real Family-only learning entry | Review, then safely re-expose or reimplement `/start`, `/home`, guardian view behind a **new isolated data/session model** | Per-role/route/API fallback security tests; no exposure of legacy Capital; fail-closed on missing Family backend; no reused secrets |
| P1 — Parent/Teen two-screen practice | Teen sees a meaningful safe decision and an evidence-backed before/after; caregiver sees risk and control details | Real two-browser task observations on a separately approved Family staging host; unknown/unverified never displayed as confirmed |
| P1 — Product-learning ladder | Money-in/out visibility → learn what interest is → diversified instrument explanation → individual stock and token representation | Explicitly distinguish simulated vs held assets, projected vs earned returns, losses, fees, custody and counterparty risks; no automatic authority promotion |
| P1 — Discovery and market choice | Compare segmented users and current substitutes; identify willingness to adopt/pay and distribution via relevant communities | Verbatim interview evidence and jurisdiction matrix; no claim of universal minor-crypto rights |
| P2 — Financial service pathways | Compare partner/custody, asset, yield, consent and legal models before any real offer | Independent legal/security/product review and region-specific entitlement restrictions; not automatically enabled |
| P2 — Distribution & business | Transparent changelog, user research and differentiated pitches to caregivers/community groups | Real outbound/interviews/test completions, no fabricated engagement |

### The first ten questions for consenting adult caregivers

1. How do you currently teach or involve a child in saving or investing?
2. Can the young person independently see an account/activity history today?
3. Which choices can they make without seeking approval?
4. Which actions must require your approval and why?
5. What do you personally understand about USDC, yield, funds, stock tokens and loss risk?
6. What would make the first screen frightening or confusing?
7. In a practice environment, what would make the child feel involved rather than controlled?
8. Would you rather start with saving concepts, practice, or supervised market exploration?
9. What proof would you need to trust this with real funds, if ever?
10. Would you actually return after one week? Why? What would you pay for, if anything?

This is **interview planning, not data collected**. Use adult guardians initially and avoid collecting any minor's identifiable or financial information without a designed consent/privacy protocol.

## Marketing/Colosseum message, bounded by reality

**Narrative:** "From passive saving to active financial learning, with clear parental boundaries."

Comms should show one real artifact per update (code changes, passing source tests, a **labeled simulated** preview, completed user observation, etc.), linked to exact evidence. Do not claim live Family deployment, interest earnings, approved stock trading for minors, partnerships, legal clearance, customers or Mainnet. The historic Colosseum submitted Worker remains frozen. A product update can link the independent draft PR and explicitly disclose that Family is a new isolated branch.

## Conditional gates

| Gate | State | Why |
| --- | --- | --- |
| Real Problem & Real User | ACTIVE | Matt's feedback supports plausible pain, but independent interviews absent |
| User agency differentiation | ACTIVE / SOURCE PREVIEW | Illustration implemented; not an observed user outcome |
| Technical reality and negative paths | ACTIVE | Existing secure drafts; new illustration tests approval/refusal and no writes |
| Learning never grants authority | PROVEN BY PREVIEW SCOPE ONLY | No backend permissions, funds or SDK in illustration |
| Source/commit binding | ACTIVE | Exact PR head CI must pass; host still NOT DEPLOYED |
| Family-only route readiness | BLOCKED | Current guard excludes teaching and parent app routes |
| Independent security, age and guardian proof | BLOCKED | Signed wallet proves possession, not guardian status |
| Region-specific securities/crypto/yield compliance | BLOCKED | Research not completed; no claims of legal eligibility |
| Traction, WTP, user interviews | NOT OBSERVED | No external testers evidenced by this partial transcript |
| Public Colosseum host modification | N/A / FORBIDDEN | Preserve `cresco` and `keys-api-stocklana` as submitted |

### Review protocol when Matt supplies remainder

Append new transcript/time ranges as a separate dated addendum. Mark what he actually said, what the team decided, what is merely a suggestion, and what has been externally verified. Reprioritize without erasing evidence or rewriting the original submitted product history.

**Release: NO-GO / draft Family branch only. No merge to main, no Cloudflare deployment, no Devnet or mainnet action, no real-customer use.**
