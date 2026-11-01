# Cresco Family — Claude Code implementation brief
## Restore the old PRODUCT journey; preserve the new Family teaching/permission engine

**Mission:** Implement a genuinely usable, return-worthy **Family-first learning application** whose information architecture, navigation and screen rhythm closely follow the user's preferred old Cresco experience. Do **not** simply add more storyboard pages, restructure one long page into three long pages, or polish the current seven-chapter rail. The founder explicitly rejected that experience after comparing two recorded walkthroughs on 2026-11-01.

### Working branch and scope

- Repository: `Faadil1/cresco`.
- **Implementation branch:** `family/legacy-product-shell-rebuild-2026-11-01` (this branch), forked from V3 PR #119 HEAD `f0ae21b15ef3cadd902614578d164de26d76b500`.
- V3 base: `family/story-led-multipage-2026-10-31`, PR [#119](https://github.com/Faadil1/cresco/pull/119). **Do not push changes directly to #119, `main`, or any historical release branch.** Work only on the implementation branch and prepare a **draft** PR with #119 as the base, after proving the code.
- User-preferred running reference: https://cresco-lac.vercel.app/ . Source reference on `main` in `apps/web/src/components/shell.tsx`, `apps/web/src/components/onboarding.tsx`, `apps/web/src/components/learning.tsx`, original app pages, state and mocks. If the live Vercel UI cannot be accessed, work from source + founder video/screenshots. Do not invent visual parity evidence.
- Existing comparison and partial fix: `docs/family/story-led-2026-10-31/LEGACY_JOURNEY_PARITY.md`. **Re-inspect exact current branch first:** a newer three-step onboarding (dream/interests/ready) and collapsed lesson catalogue have ALREADY been committed. Avoid duplicating this work. The remaining gap is much larger: the durable app shell, dashboard, return loops and contextual Parent/Child flows.
- The founder's two walkthrough recordings of 2026-11-01 may be supplied separately. Ask for these only if the source/live site leaves critical ambiguity; otherwise start from the grounded app source above.

## 1. Product outcome, not arbitrary UI requirements

Cresco Family helps a teen learn about saving, fictional businesses and measured financial choices with a Parent who guides decisions beyond a limited practice Key. It must feel like a useful **app** with a personal home, ongoing progress and return paths—not a linear course, one-page demo, a giant spreadsheet dashboard or a seven-chapter book.

The narrative is a *layer inside the app*: when the Child meets Mina in Explore, she presents a concrete dilemma; the choice is remembered in later Parent, Outcome and Together views. It should not replace Home/Learn/Explore/Portfolio/Profile with seven interchangeable story tabs.

Family-first defaults: no account, no child identity data, no verified guardian, fictional credits only, no real investment, no wallet, no remote API. My Key is an educational simulation, not actual authority.

## 2. Preserve what made the OLD Cresco better

Implement the old main-product rhythm and composition, using source instead of visual guesses:

| Original pattern | Family V3 implementation acceptance |
|---|---|
| Persistent **Home / Learn / Explore / Portfolio / Profile** navigation | Real separate routes/screens. Five-icon **bottom navigation on mobile** and responsive **side navigation on desktop**, with selected states, accessible labels and safe-area insets. No seven-chapter rail occupying the product. |
| Onboarding: `OnboardingFrame`, step count, back, sticky CTA | Reuse/adapt existing V3 three-scene onboarding; ensure an explicit transition into the first useful Home screen. Do not show entire lesson list, research or saving fields on dream-choice screen. |
| Personal **Home** | Goal card, My Key (15-credit per-action cap initially), next meaningful mission, learning progress, next fictional person and a clear Parent conversation preview. No placeholder dashboard, no fabricated usage data. |
| **Learn** | Real modular overview with next lesson visually primary, completed/current states, a dedicated lesson reader, short steps and quiz/feedback. Content from V3 remains intact; full catalog stays reachable rather than dominating Home. |
| **Explore** | Discover fictional companies/characters; Mina's *problem and choices* before generic chart or financial research. Distinct company detail and accessible research below, with a natural path to a hypothetical decision. |
| **Portfolio** | Honest **practice-only** portfolio/receipts, fictional balances and savings separated, contextual results and risk scenarios; empty states must teach the next action. No false live market data or financial outcome. |
| **Profile** | Practice goal, selected interests, completed lessons/achievements, My Key explanation and progress. Do not ask for name, age, email, account or guardian verification. |
| **Parent** | Accessible, clearly labeled simulated Parent lens with goal, Child's exact request and reason, one-time approval/decline, Key controls and discussion. No login simulation presented as identity verification. |
| A reason to return | Completing a lesson, meeting a company and processing a Parent decision must lead into the Home mission and next step. No claim of persistence across full reload: state is in-memory only. |

Visual reference: use original design tokens, typography, illustrated goal cards, friendly visual hierarchy, onboarding progress and old mobile navigation. Avoid generic SaaS card soup, overlong headers and analytics-first company pages. Screens should convey one PRIMARY action each without hiding relevant secondary content. The original `AppShell` is a source of UX patterns; **do not simply import its `useStore` or legacy money-mode/childName logic** into the Family-only app.

## 3. Existing V3 architecture to keep intact

Study before editing:
- `apps/web/src/components/family-story-provider.tsx` and `apps/web/src/lib/family-story-state.ts`: same-document state; hard refresh resets. Keep this behavior unless separately approved.
- `apps/web/src/lib/family-public-practice.ts`: only source of Key, requests, balance and receipts. **No bypass and no separate practice engine**.
- `apps/web/src/components/family-story-parent.tsx`, `family-story-outcome.tsx`, `family-story-together.tsx`: exact simulated Parent decision and consequences.
- `apps/web/src/components/family-story-explore.tsx`, `family-public-explore-data.ts`: invented companies, Mina, reflection and research.
- `apps/web/src/lib/family-story-routes.ts`, `family-web-route-guard.ts`: strict explicit allowlist; no prefix exception.
- `apps/web/src/app/try/(story)/`: current story routes; decide minimal mapping to durable app routes inside the `/try` namespace and update route guard, navigation and tests together. Preserve existing deep links or provide intentional accessible redirects without breaking isolation.
- `apps/web/src/components/family-story-ui.tsx`: replace intrusive chapter chrome in **product mode** with durable app shell. Story-like progress should remain inside lessons/onboarding, not globally.

No API, RPC, wallets, live tokens, remote storage, auth, child profile capture, consent verification, analytics tracking or payments. Ensure externally retrieved illustrations/assets don't introduce outbound calls; prefer existing checked-in assets. Never edit old Colosseum/Stocklana or historic Cloudflare Worker configuration or deployment scripts.

## 4. Implement in independently reviewable slices

**A. Architecture & screen map.** Create `docs/family/LEGACY_SHELL_REBUILD_DECISIONS.md` containing before/after route map, reference screenshots/source paths, product vs simulated Parent navigation, state boundaries and a no-duplication audit. Separate real app screens from narrative substeps. Identify exact user tasks before coding.

**B. Persistent Family product shell.** Responsive nav at mobile/desktop, small readable status, Home populated from *real practice state*, empty states, top-level shortcuts. Maintain keyboard access, semantic nav, no horizontal overflow.

**C. Learn/Explore/Portfolio/Profile.** Implement dedicated working Family views under strict /try paths, not tabs hiding sections on the same DOM. Preserve tests for educational content, interest ordering, company dilemmas and fictional receipts. Never lose data from client-side route changes.

**D. Parent/Child continuity and character feedback.** Parent can start first, Child can start first; completing a lesson or a fictional investment decision returns a contextual next task. Mina and exact request context persist through local navigation, Parent, Outcome and Together, until reload.

**E. Visual proof, not just Playwright green.** Capture **mobile 390×844 and desktop** screenshots of Home, Dream, Learn, Mina/Explore, Portfolio, Profile and Parent request; compare side-by-side with the old verified product source or founder screenshots. Note explicitly what matches, what intentionally differs, and what is still missing. Test on an actual phone only if genuinely available, otherwise label emulator/simulator correctly.

**F. Regression & documentation.** Update e2e expectations to reflect approved new navigation without weakening security/privacy/one-use approval assertions. Maintain `playwright.family-public.config.mjs`, local isolated Wrangler build, Windows launcher, route isolation and historic web checks. Any change from the pinned previous source SHA requires updating proof/launcher gates **only after** new verified checks; do not bypass them to get a green badge.

Commit each slice with readable messages; never force-push, merge or deploy. If unexpected legacy dependencies arise, isolate and report rather than copying them.

## 5. End-to-end acceptance journeys (must actually click through)

1. **Child first**: welcome → choose illustrated goal → optional interests → ready → Home → next lesson and quiz → Home shows progress → Explore Mina → answer fictional dilemma → fictional 25-credit request (above My Key=15) → simulated Parent one-time decision → outcome/receipt → Portfolio → Home and next mission. Parent sees exact original child reason and Key remains unchanged.
2. **Parent first**: welcome → Parent dashboard → no pending request → Parent learning → view My Key → no identity claims → Child path later.
3. **Blocked/negative**: approval only once, decline, stale request after Key change, duplicate request, exhausted credits, empty deep link, refresh/session reset, invalid hidden routes, no third-party network/API or write requests.
4. **Product feel**: in the first screen of Home on mobile, goal, next task and navigation are understandable without scrolling. Each of the five app destinations has its own meaningful content. Completing a goal choice moves to a new screen, not to a long section below. Story scenes are short and expressive, with the actual lesson/company details behind their own view.
5. **Narrative recall**: Mina's story is remembered in Outcome and Together; automated presence is not proof a child remembers it. Record human testing separately and do not claim usability-study success.

## 6. Hard delivery gate

Run at minimum isolated Family build/assertions, typecheck, unit and browser suites (WebKit iPhone + Chromium desktop), historic web regression, and route/public-worker isolation. Make the exact source SHA and corresponding workflow run IDs inspectable. No claim of "done" until screenshots are **opened and visually reviewed**, not just generated. Old vs new comparison and founder feedback are mandatory for UX acceptance.

Final report should include exact changed files, decisions, screenshots, routes, tests+failures, known limitations, and explicit **NO DEPLOY / NO MERGE**. Public V2 `cresco-family-open-test-web` (historically version `cb3a6ad5-d579-43fa-a8e4-f8e2d5f38aee`) must not be modified; do not rely on that historic version number as fresh live status without querying it. All historical Colosseum/Stocklana Workers stay untouched.

## Claude Code operating instruction

Read this file and `docs/family/story-led-2026-10-31/LEGACY_JOURNEY_PARITY.md` first, then inspect original `main` UX code and current Family source. Implement **the durable old-style app shell and return journeys**, not another stacked or merely more fragmented linear storyboard. Work on this branch only. Start with screen/route audit then code + tests + screenshots. Ask the founder for visual approval before *any* publication. Do not imply automated test success equals a compelling product.
