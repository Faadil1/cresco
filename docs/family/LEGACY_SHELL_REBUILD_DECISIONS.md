# Cresco Family V3 — legacy product shell rebuild: decisions and evidence

Branch: `family/legacy-product-shell-rebuild-2026-11-01` (base: V3 PR #119 head `f0ae21b`, spec commit `06b5eee`).
Brief: `docs/family/CLAUDE_CODE_RESTORE_LEGACY_PRODUCT_UX.md`. Prior analysis: `docs/family/story-led-2026-10-31/LEGACY_JOURNEY_PARITY.md`.

**Status: candidate implementation. NO MERGE. NO DEPLOY. Not founder-approved. Not tested with a family.**

## 1. Reference used

| Source | What it gave |
|---|---|
| Founder recording 2026-11-01 of the old Vercel app (`cresco-lac.vercel.app`, ~125 s) | Desktop side rail Home/Learn/Explore/Portfolio/Profile; Home = greeting, portfolio card, Today's Mission, Continue Learning, Saving for, Your Wins; focus-mode lesson with progress bar + sticky Continue; company page with "Things to know"; Portfolio summary + holdings; Profile as a list of rows; Parent dashboard with its own top navigation (Overview / Limits / Add money / Settings / "Alex's view"). |
| Founder recording 2026-11-01 of local V3 (~47 s) | Serif editorial pages, seven-chapter rail on every page, Learn/goal reading like long forms. This is what was rejected. |
| `apps/web/src/components/shell.tsx` (`AppShell`, `MobileBottomNavigation`, `DesktopNavigation`) | Exact nav pattern reproduced: bottom bar `< md`, side rail `md` (icon) / `lg` (icon + label), `aria-current`, safe-area padding, `pb-nav`. **Not reused:** `useStore`, `childName`, money mode. |
| `apps/web/src/components/learning.tsx`, `onboarding.tsx` | Module rows with done / current / upcoming states; one-step-at-a-time reader; onboarding frame (already ported in #119). |

The live Vercel URL was not fetched from this environment; visual parity is judged from the founder's recording and source only.

## 2. Route map (before → after)

All routes stay inside the strict `/try` allowlist (`family-story-routes.ts`, exact match, no prefix). Three routes were added; none removed; every existing deep link still resolves.

| Route | Before (#119) | After | Shell frame |
|---|---|---|---|
| `/try` | Welcome + two role cards + seven-chapter index | Invitation: one hero, **Let's begin**, secondary **I'm the Parent** (returning: **Back to my Home**) | intro (no nav) |
| `/try/goal`, `/goal/interests`, `/goal/ready` | 3 onboarding scenes → Learn | Same scenes; Ready → **Open my Home** | onboarding (own progress, no nav) |
| **`/try/home`** (new) | — | Personal Home | child · Home |
| `/try/learn` | "Chapter 2" hub + collapsed catalogue | Learn: progress, **Up next** card, "Your path" rows (done / up next / not started) | child · Learn |
| `/try/learn/[id]` | Lesson inside chapter chrome | Focus mode: close (X), step bar, sticky Back / Next idea / Quick check / Complete lesson; completion card → **Back to Home** | focus (no tabs) |
| `/try/explore` | "Chapter 3" list | Explore: featured person (interest-matched, unmet first), Key chip, search, sector chips, cards | child · Explore |
| `/try/explore/[id]` | Mina-first company page | Same content, app chrome, "Next: meet …" | child · Explore |
| `/try/decision` | "Chapter 4" | Practice choice sub-screen of Explore | child · Explore |
| `/try/outcome` | "Chapter 6" + badges + collapsed full portfolio | Result screen of Portfolio: hero, Mina recall, numbers, **Back to Home** / Make another choice / Talk it through, link to Portfolio | child · Portfolio |
| **`/try/portfolio`** (new) | (inside Outcome `<details>`) | Portfolio destination: summary, savings kept separate, holdings, what-if, asks, receipts, teaching empty state | child · Portfolio |
| **`/try/profile`** (new) | — | Profile: practice learner (no identity), goal, interests, learning, My Key, Parent's view, Together, wins, how it works, **Start over for a new family** | child · Profile |
| `/try/together` | "Chapter 7" | Talk it through (both lenses), **Back to Home** | child · Home |
| `/try/parent`, `/parent/request`, `/parent/key`, `/parent/learn` | "Chapter 5" pages | Simulated Parent dashboard with its own nav: Overview / Requests (pending badge) / My Key / Learn, and **Child's view** switch | parent |
| `/try/learn/p-*` | Parent lessons | Same, focus mode, close → Parent Learn | focus |
| `/try/lab` | Free lab | Unchanged (outside the story layout) | — |

Removed: the seven-chapter rail (`story-rail`), the mobile chapter menu, the welcome chapter index, all "Chapter N ·" kickers and chapter prev/next footers in app screens. `STORY_CHAPTERS` was replaced by `FAMILY_APP_TABS`, `PARENT_APP_TABS`, `tabOfPath`, `parentTabOfPath`, `shellModeOfPath`.

## 3. App screens vs narrative sub-steps

* **Destinations (bottom bar / side rail):** Home, Learn, Explore, Portfolio, Profile.
* **Sub-screens that keep their parent tab selected:** lesson reader (Learn, focus mode), company page and practice choice (Explore), result (Portfolio), Together (Home).
* **Narrative stays inside the app:** Mina's dilemma is on the company page; the Child's answer is snapshotted per request and recalled on the Parent request, Outcome and Together; the Home mission and Home "People to meet" point at the next person.

## 4. State boundaries (unchanged engine)

* `family-public-practice.ts` remains the only source of Key, requests, balances and receipts. No new practice action, no bypass.
* `family-story-state.ts` gained only **pure read helpers**: `childPathFor` (moved from the Learn component and re-exported), `personName`, `nextMission`, `practiceWins`. `nextMission` is a pointer (href + copy); unit tests assert it never changes state and that the Key is unchanged after approvals.
* State is still the in-memory reducer in `/try/layout.tsx`: client navigation keeps it, a full reload resets it. Profile's "Start over" dispatches the existing `reset` action (no storage involved).
* No API, RPC, wallet, auth, storage, analytics or external asset added. Browser runs record 0 external requests.

### Home mission order (`nextMission`)
1. Goal not chosen → choose dream. 2. Parent approved once → use it. 3. Request pending → hand to Parent. 4. Newest event is a decline / expiry → see why. 5. A decision just happened and no family talk yet → Together. 6. No lesson yet → first goal-specific lesson. 7. Nobody met → meet the interest-matched person (Mina for Food & shopping). 8. No choice yet → first practice choice with a met company. 9. Next lesson. 10. Next unmet person. 11. Practice again.

## 5. No-duplication audit

| Concern | Decision |
|---|---|
| Two nav systems on the same screen | Child tab bar hidden on intro, onboarding, lesson focus and Parent screens (e2e asserts exactly one visible `Main` nav on app screens, none elsewhere). |
| Lens chip rendered twice | One `story-lens` element per shell. |
| Portfolio both in Outcome and Portfolio | Outcome keeps the result + numbers; full holdings/receipts/what-if only in Portfolio. Lab keeps its own `FamilyPracticePortfolio` (unchanged). |
| Badges in Outcome, Home and Profile | Single `practiceWins` source; small row on Home, grid on Profile; removed from Outcome. |
| Same lesson in Home mission and "Continue learning" | Continue learning skips the mission's lesson. |
| Same person in Home mission and "People to meet" | "People to meet" skips the mission's person. |
| `childPathFor` in a component | Moved to the state lib, re-exported for existing imports. |

## 6. Visual system

* Kept: Cresco cream background, green progress/savings colour, existing illustrations (`GoalArt`, `LessonIllustration`, `CompanyArt`, `FamilyStoryScene`, badges, `KidBust`).
* Restored from the old product: bright **action blue** for primary buttons and selected nav (`--color-family-action #1f5fd6`, white text ≈ 5.6:1), heavy sans headings instead of the editorial serif. Both are **scoped to `.cresco-family-app`**; the canonical site's tokens are untouched.
* Intentional differences from the old app: no "Hey Alex" name or avatar (no child identity), no Practice/Money toggle, no streak, no live-looking price or chart on Home, no real company (Apple etc.), Parent dashboard has no "Add money" (fictional credits only). Inter is used instead of the old rounded font (no new font download).

## 7. Evidence (local, this environment)

Commands run on the branch head before push (apps/web):

| Check | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm run lint` | pass (2 pre-existing warnings in unrelated files) |
| `npm run copy:lint` | pass |
| `npx vitest run` | 24 files, 172 tests pass |
| `npm run build:public-family` (+ `assert-family-public-build`) | PASS, `deployed: false` |
| `node scripts/family-public-web-release.mjs --validate-artifact` | PASS (no files written, no deploy) |
| `node ../../scripts/family-release-boundary.mjs --built-web` | pass, `cloudflareWrite: false`, `deployApproved: false` |
| `npm run build` (historic Next build) | pass |
| Playwright on local Wrangler Worker: `family-story-journey` (mobile + desktop) + `family-public-demo` | **52 / 52 pass** |

**Limitation:** WebKit is not installed in this sandbox. The "iPhone" project ran as **Chromium with iPhone 13 emulation (390×664 CSS viewport)**, not WebKit and not a real phone. The committed `playwright.family-public.config.mjs` still targets real WebKit + desktop Chromium; CI must confirm. The historic `web.yml` WebKit Playwright suite was not run locally. No GitHub workflow run was triggered by this push (the Family browser workflow runs on pull requests, and no PR was opened).

The Windows launcher (`apps/web/scripts/family-v3-local-pilot.ps1`) is still pinned to `88733c05…`. It was **not** re-pinned because the new SHA has no CI run yet (brief §4F).

## 8. Screenshots (opened and reviewed)

Captured from the local Worker with Chromium (mobile = iPhone 13 emulation at 390×844, desktop = 1440×900), during one client-side child-first journey (0 external requests).

* Old vs new (top = founder recording of old Vercel app, bottom = new desktop): `legacy-shell-rebuild-2026-11-01/compare-home.jpg`, `compare-lesson.jpg`, `compare-explore.jpg`, `compare-portfolio.jpg`, `compare-profile.jpg`, `compare-parent.jpg`.
* Mobile: `mobile-02-dream.jpg`, `mobile-05-home-new.jpg`, `mobile-06-lesson.jpg`, `mobile-10-learn.jpg`, `mobile-11-explore.jpg`, `mobile-12-mina.jpg`, `mobile-15-parent-request.jpg`, `mobile-17-portfolio.jpg`, `mobile-19-profile.jpg`.
* Desktop: `desktop-05-home-new.jpg`, `desktop-10-learn.jpg`, `desktop-15-parent-request.jpg`.

### What matches the old product
Persistent five-destination nav (side rail / bottom bar) with selected state; Home composition (greeting, goal card, yellow Today's Mission with one CTA, Continue learning with See all, wins, right-hand column); lesson focus mode with progress bar and sticky full-width primary button; Profile as a list of rows; Parent lens with its own top navigation and a switch back to the Child's view; Portfolio summary card + holdings list.

### What intentionally differs
See §6. Plus: Explore leads with a person's dilemma (Mina) instead of a stock chart; Portfolio shows practice credits, not a dollar value or line chart.

### Still missing / open
* Real-device (iOS Safari) and WebKit runs; CI run IDs for this SHA.
* Founder visual approval and any family usability session (automated tests prove routes and states, not comprehension or that a child remembers Mina).
* Old-style "Things to know" icon list on company pages is not reproduced (V3 research notes kept as-is).
* The Parent overview is still a single column on desktop (old dashboard used a denser 3-column layout).
* No persistence across reload (by design; unchanged).

## 9. Boundaries respected
No change to public V2 (`cresco-family-open-test-web`), historic Colosseum/Stocklana Workers, Wrangler configs, deployment scripts, permission/Key logic or the practice reducer. No merge, no deploy, no PR opened.
