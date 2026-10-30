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

## Explore restoration, candidate revision — 2026-10-30

**Previous code-reviewed limitation:** The Family `Explore` tab exposed only three name/price/risk cards and trade amount controls. The historical owner video showed an exploratory workflow with more discovery, comparisons, graphics and context. Existing market-dependent historical pages could not be safely unlocked on the public browser-only Worker.

**Additive browser-only candidate:**
- Dedicated `family-public-explore.tsx` and `family-public-explore-data.ts`, with **six explicitly invented case studies**: technology, consumer products, a diversified fictional fund, services, energy and health.
- Search and sector filters; detail sheets describing fictional customers, business models, upside, uncertainty and research questions.
- Eight-step illustrative static trend lines with an accessibility description and labels explaining that they are **not actual historic, live or predicted prices**.
- Compare up to two cases through business model, risk and open research question. No recommendation/ranking or automated investing signal.
- Each case has a simple research comprehension question; answering does not modify credits, family progress, receipts, My Key or approved permissions.
- The first three existing fictional examples (ORC, MKT, BKT) retain the already-tested pure Practice state transitions. The other three are **research only**, with no buy action, not added to allowed instruments and no hidden order path.
- Selecting Research brings the explanatory card into view.
- Unit tests cover fixed catalog, research-only boundary, filter behavior and deterministic trend generation. iPhone WebKit test added for search, compare, research quiz and unchanged credit balance.

**Safety and UX requirements retained:** No external company feeds; no live prices; no custody/guardian verification; no network requests or browser persistence introduced; no historical routes unsealed. The broader Family workflow path allowlist now also includes the new Explore files.

**Residual parity gap:** This is educationally meaningful discovery, not a restoration of the historic live provider/issuer data, extensive public company universe, real multi-period charting or money-rail capability. Only owner review and controlled feedback can determine whether the presentation is intuitive to real parents/children.

**Validation boundary:** The GitHub connector has not surfaced fresh CI runs for this latest-commit sequence. Tests are **authored, not claimed passed**. Live visual screenshots on this revision have **not been inspected**. No merge or deployment has taken place.

## Visual audit from actual Playwright screenshots — 2026-10-30

**Evidence:** The owner provided five PNGs from Playwright's HTML report on Windows. These are **actual screenshots** of the exact locally tested Family Worker candidate `10e3463b2ecc41e1d1fe8e0a53678559e580d030` (that version has 142/142 unit and 8/8 WebKit tests PASS). The images are **viewport captures**, not full-page recordings, and do not demonstrate interaction usability beyond the test results. 3 are iPhone WebKit 1170×1992 physical pixels; 2 are desktop WebKit 1440×900.

| Screenshot file prefix | Visible scene | Grounded UX observation |
| --- | --- | --- |
| `ddd141be` | iPhone, initial `/try` | Masthead, intro, large role selector and suggested next-step callout consume the full captured first screen; no Child workspace/nav is visible yet. The default experience looks like an introduction rather than the product. |
| `bc091d55` | iPhone, Child Explore | Suggested next-step box sits above Child navigation, then a very large title and description; the interactive company search/cards are not visible within the captured viewport. The screenshot **does not prove they are missing below**. |
| `7325ff3b` | iPhone, Parent Requests | Suggested next-step box and large heading take up room; the pending 25-credit MKT request is visible at the bottom but the decision buttons are outside the captured area. This is a discoverability/hierarchy problem, **not a permission-engine failure**. |
| `accedb18` | Desktop, Parent Learning | Clear role-specific navigation and first lesson guidance, but two consecutive green instruction cards before the actual lessons increase vertical density. |
| `df68b42` | Desktop, Child Home | Clean three-metric row, goal selector and saving progress, visible Learning/Explore actions; original UI visual style is meaningfully present. Not a full parity proof. |

**P0 changes authored on Family draft AFTER screenshots (need a new exact HEAD run and NEW screenshots):**
1. Compress mobile `/try` hero and use a concise mobile-only fictional disclaimer while retaining fuller desktop explanation.
2. Compress mobile profile selector, name the roles **simulated** rather than claiming "two real perspectives", and prioritize actual Child/Parent workspace navigation in the first screen.
3. Only show the contextual suggestion above the mobile workspace when a pending exact request or one-time exception actually needs attention; leave existing feature buttons to guide normal actions. Compact that banner on phones.
4. Reduce mobile workspace card/navigation spacing, Explorer heading/disclaimer and Parent Requests heading/disclaimer. Keep the explicit simulated-not-verified guardian disclosure in Requests.
5. Fix obsolete Child Home description ("three fictional examples") now that Explore contains six.
6. Expand the Playwright mobile checks: require Child navigation to be in the **viewport on initial load** and the Explore search box to be **in the viewport** when its tab opens.
7. The local proof script now collects actual PNGs from Playwright **`playwright-report/data`** (previously it checked only `test-results` and returned no files) into its evidence directory and a ZIP.

**Do not interpret the five old PNGs as verification of this revised UI.** They are diagnostic evidence for concrete source changes. No screenshot of the new HEAD has been inspected; visual release approval remains **NO_GO**. Before advancing the PR, rerun Windows proof on the latest exact SHA, inspect the new iPhone first fold plus Parent Requests and Explore and verify the simulated parent role cannot be mistaken for real authorization. Any claim of automated first-fold success must come from a passing test on the revised SHA, not from source inspection.

## Verified before/after screenshot comparison — candidate `5b46df60`

**Evidence lineage:** Five first-round Playwright PNGs from `10e3463b` were compared visually against the five newly provided Playwright PNGs from owner-tested `5b46df60176e6218c8ed1f49e41cb0082c59a663` (`FAMILY_PR114_LOCAL_PROOF=PASS`, 8/8 WebKit). Same test-capture types: three 1170×1992 physical-pixel iPhone WebKit viewport images and two 1440×900 desktop WebKit viewport images. These are images, not recordings or a full accessibility audit.

| View | Earlier actual screenshot | Later actual screenshot | Direct observation |
| --- | --- | --- | --- |
| First Child screen, iPhone | `ddd141be` | `7cd178ed` | Clear improvement: simulated role buttons, Child navigation, and the 'Hey, future explorer' heading are visible in the viewport. Initial instructional green callout no longer takes the first screen. The available-credits card starts only near the bottom: **still content-dense**. |
| Explore, iPhone | `bc091d55` | `8fe52154` | The search input is now visible in the capture, whereas before the contextual callout and long description pushed it offscreen. The six-case grid remains below the first captured viewport; do not confuse that with missing data. |
| Parent Requests, iPhone | `7325ff3b` | `fb3dd7a9` | Contextual green callout is smaller, headings/labels are more compact and guardian verification caveat is added. But the callout now **duplicates** the active Requests tab and the exact request action buttons are still below this screenshot's viewport. **Remaining P1 UX defect.** |
| Parent Learning, desktop | `accedb18` | `f3d09a42` | Consistent premium hierarchy, but both generic 'Suggested next step' and 'Suggested next lesson' guidance appear consecutively, wasting vertical space before lessons. **Remaining P2 defect.** |
| Child Home, desktop | `df68b42` | `923fb83b` | Clear goal/credits context and lesson/explore actions retained; no new visual regression apparent in these viewport captures. |

**Targeted follow-up repair after reviewing exact `5b46df60` screenshots (authored, unverified new HEAD):**
- Hide the generic suggested-step callout whenever Parent already has **Requests** or **Learn** active, or Child has **Learn** active, while retaining useful reminders in other contexts.
- For a pending Parent request on mobile, shorten the heading to an accessible screen-reader heading and a concise visible instruction, moving the exact request card closer to the role tabs.
- Put the explicit no-verified-guardian warning immediately into the pending request card before the exact Approve/Decline buttons. This is clearer than merely putting a longer caution above the pending request.
- Add browser regression assertions that the duplicate suggested-step callout is hidden when the Parent request or learning screen is active. The exact transaction binding/version/nonce, approve-once and decline semantics remain unchanged.

**Verification status:** `5b46df60` passed the user's independent Windows local suite with 8/8 WebKit and an overall `LOCAL_PROOF=PASS`. These *newer follow-up changes* have not been rerun. No public Family Worker or original Colosseum Worker has been edited, and PR #114 must remain DRAFT until current SHA is rerun and actually rendered again. This is a **visual hierarchy correction**, not authentication, actual consent or financial capability.
