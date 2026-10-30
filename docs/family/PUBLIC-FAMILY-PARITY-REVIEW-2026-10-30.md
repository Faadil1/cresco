# Cresco Family public practice — feature-parity and evidence ledger

**Status:** DRAFT candidate in PR #114; not merged, not deployed. Updated 2026-10-30.
**Comparators:** original source paths in the same `Faadil1/cresco` repository; owner-recorded 2026-10-30 video showing rich Cresco UI; existing public Family PR #111.
**Isolation:** This document describes the new Family-only **browser simulation**. It does not establish authenticated Parent/Child profiles, custody, tradable securities, current market data, real financial permission, or a dual-device product.

| Product capability | Historical Cresco source | Candidate PR #114 | Remaining gaps / limitations |
| --- | --- | --- | --- |
| Parent/Child profile spaces | `(child)/home`, `parent/(dash)/page` | Two independent visible role workspaces, role switcher, shared in-tab state | No verified identities, independent devices, sessions, email or invitations |
| Child learning | `mocks/learning.ts`, `lesson/[id]/player.tsx`, `illustrations/scenes.tsx` | Three intro modules plus six **original multi-concept, illustrated, official-source-linked** lessons and real quiz completion | Full sequential historical lesson-player animations, all curricula, optional XP details and all past screens remain incomplete |
| Parent learning | Parent dashboard previously summarized child's progress only | Five separate Parent lessons, individual progress and role-specific explanations | Parental learning content needs hands-on external parent feedback and further vetted jurisdiction-specific references |
| Explore | `(child)/explore` company list, market integrations | Three explicitly fictional educational instruments, categories, risk descriptions and practice amounts | Search/filter, deep companies, full historical discovery and live market data intentionally not present |
| Practice execution | Historical practice/money execution services and bounded policies | In-memory fixed-price practice buys, independent in-bounds action, blocked out-of-bounds request and receipt with non-execution label | No backend writes, finance rails, market quotations or account persistence by design |
| My Key and exact exception | `domain/policy.ts`, Parent limits/requests | Version/nonce standing practice Key; asset/amount exact request; approval once, refusal, explicit parent changes, stale/replay protection | No legal authorization, cryptographic enforcement, actual wallet or guardian credentials |
| Practice Portfolio | `(child)/portfolio`, `components/finance.tsx` | Holdings by original fictional practice-cost, percentages and hypothetical stress scenarios; live practice receipts | Historical multi-period portfolio charts and market data integration excluded; scenario assumptions are entirely hypothetical |
| Progression and goals | Goal art, missions, streaks, badge illustrations | Bike goal, child/parent learning counts, earned illustrated badges linked to actual choices | Custom goals, authentic calendar streaks, complete missions and account-based longitudinal progress missing |
| Learn Together | No separate complete interactive loop identified | Separate Child and Parent discussion answers with a shared review/check-in, independent from Key | Real cross-device family collaboration and durable plans not implemented |
| Public access | Family PR #111 allows `/`, `/try` only | Same route allowlist; full studio rendered inside `/try`, one-click, no sign-in | Must pass phone/desktop tester comprehension review |

## Release and risk controls
- Do not edit or deploy the Colosseum Worker or historical `main` deployment configurations.
- Do not merge PR #114 or redeploy `cresco-family-web` without subsequent review and explicit authorization.
- Legacy web routes remain denied on the independent Family Worker; adding UI does **not** authorize simply unlocking `/learn`, `/home`, `/parent` or `/invest`.
- Personal data: no newly introduced cookies, login, location, API calls, wallet access or per-user persistence. Family role switch is **fictional**. Refresh resets the studio.
- The parent and child contributions to Learn Together are practice prompts, never permissions. Parent learning completion must never automatically widen the practice Key.
- Portfolio scenario prices and percentages are intentionally invented for education, not market data, advice, investment returns or executable transactions.
- Original educational-source verification dates from existing curriculum remain visible, with U.S.-educational-context disclosures. A later formal product requires revalidation of claims, jurisdiction and literacy testing.

## Test evidence to check before release
The draft branch executes the following in GitHub Actions:
1. Node unit tests of exact permissions, financial non-execution, role-separated learning and portfolio scenario calculations.
2. Family isolation compilation; historical API route-deny tests.
3. Local Cloudflare Worker `family-public-browser-no-login` iPhone WebKit tests: independent learning, parent/child discussion, original curriculum, allowance approval, no backend requests, and reload reset.
4. Web lint/copy-lint/typecheck/build/Playwright.
Record exact **HEAD SHA** and CI conclusions in PR #114 after the final run; green checks on earlier commits are insufficient.
5. Independent human tester observations: can a child explain Practice vs Money, can a parent distinguish Approve Once from raising the standing Key, and can both find their Learning Paths without instructions?

**Current verdict:** Better feature coverage than the 1-minute preview; **not yet proven as full historical Cresco parity or production-ready service.**

## Historical owner-video UX review (frames inspected, not a new live UI capture)

The owner's recorded browser session (reviewed 2026-10-30) provides a visual baseline, not evidence that the latest Family PR has been rendered visually. Representative observations:

| Recorded timestamp (approx.) | Actual visual evidence in original recorded browser | Current draft Family candidate | Assessment |
| --- | --- | --- | --- |
| 24-28 sec | Child `/profile` with user identity and goal selection; `/home` with sidebar, Home, Learn, Explore, Portfolio and Profile | Anonymous practice Child view, shared goal chooser and progress in Home; Parent sees same goal | **Partial:** fictional goals restored, named profile and durable settings intentionally absent |
| 28-33 sec | Full-screen child Home: large balance card, Practice/Money switch, My Key explanation, mission, lesson cards and badges | Child Home and Key summary, badges, learning, portfolio, optional contextual help in `/try` | **Partial:** feature logic present; full-screen hierarchy and left sidebar not yet visually reverified; **do not fake Money Mode** in public |
| 36-48 sec | Illustrated multi-step lesson about stock ownership with blue action buttons, progress, source checks, completion | Original six source-backed lessons with their illustrated concept sections, question and progress | **Meaningful restoration**, but teaching screen navigation and animation fidelity still need screenshot comparison |
| 51-54 sec | Company discovery grid, small trend charts, search/filter and contextual explanation | Three **fictional** examples with amount inputs and risk notes | **Major remaining gap:** discovery controls and company depth; live quotes excluded deliberately |
| 57 sec | Portfolio screen with explicit Practice/Money distinction | Practice-only holdings, allocation, made-up risk scenarios and non-execution receipts | **Partial:** richer teaching data now but no original multi-period charts or live financial state |

### Code-level UX findings addressed in this draft revision
- Child saving goal was hard-coded as Bike; switched to three selectable, fictional goal targets and synced parent visibility without exposing personal info.
- An unguided user could lose the next action between Child and Parent; optional contextual action now responds to learning, receipts, pending requests and one-time approvals.
- The horizontal phone tab row had no clue that more sections existed; a small mobile-only swipe explanation was added.
- The lesson player previously ended after a quiz with no contextual pathway to Practice or My Key; explicit role-aware **Apply** actions now route to matching screens.
- Added desktop WebKit role/goal checks alongside iPhone, with screenshot attachments. This is **capture instrumentation**, not human approval. Workflow run artifacts need inspection before any claim of visual parity.

### Remaining visual review gates
1. Inspect **actual** candidate screenshots, not only the owner's old video; compare Home, Child Learn, Parent Learn, My Key, Parent Requests and Portfolio at phone and desktop widths.
2. Verify buttons/tabs are touch-sized, color contrast, text truncation, overlays, semantic headings, scroll behavior and keyboard navigation. A code-level assertion for no horizontal overflow does not prove a comfortable experience.
3. Restore a curated deeper Explore and useful teaching visuals before treating product parity as complete, using only fictional/local data in this Worker.
4. Parent and Child testers must independently understand Practice vs any real Money/Devnet capability, one-time permission versus permanent Key and the lack of real authentication.
5. The **newest HEAD needs its own successful CI**; no claim may inherit results from the earlier `2283c8ed` commit.

**Release status remains CLOSED** until latest-commit checks, real screenshot comparison, UX comprehension and explicit publication decision.
