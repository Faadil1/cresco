# Cresco Family: product and UX review, and the redesign plan (2026-11-16)

Issue: Faadil1/cresco#126 · Baseline: `3fbc92b02de3a99e3e838e5bcb7a9c5e8a9bf0f6` (PR #124 head) ·
Review branch: `claude/family-ux-overhaul-2026-11-16` · **No merge, no deploy.**

## 0. Evidence and its limits

| Source | What it covers | Limits |
|---|---|---|
| Local public Family artifact built with `node scripts/build-public-family.mjs` at the baseline SHA, served by local `wrangler dev` (`npm run start:vinext -- --ip 127.0.0.1 --port 3100`) | Every `/try/*` route, plus `/` | Chromium 1.63 headless on Linux. Browser zoom 100%, `deviceScaleFactor` 1. Windows and real iPhone hardware were not available. |
| Viewports | 1440x900, 1280x800, 390x844, 375x812 (mobile with `isMobile`/touch) | Comparable screenshots: `docs/family/ux-overhaul-2026-11-16/before/` |
| Automatic measurements per route and viewport | page height, word count, number of disclaimer phrases, text under 12px, interactive elements, horizontal overflow, external requests | `before/metrics.json`. Script: Playwright capture in the PR description. |
| Founder video `20261116-0957-03.5680228.mp4` | Not available in this session | I did **not** view it. Statements in section 2.3 that mention the video restate issue #126, they are not my observations. |
| Source review | `apps/web/src/app/try/**`, `src/components/family-*`, `src/lib/family-*` | Static reading |

Not verified: real two-account Parent/Child approval (it does not exist; the Parent is simulated in one tab), screen-reader output with a real screen reader, Windows Edge, real iOS Safari.

## 1. Route and component inventory (baseline)

| Route | Shell frame | Component | Status at baseline |
|---|---|---|---|
| `/` | none | `FamilyOnlyHome` (server component) | **HTTP 500** `TypeError: n.createContext is not a function` |
| `/try` | intro | `WelcomeChapter` | works |
| `/try/goal`, `/goal/interests`, `/goal/ready` | onboarding (3 steps) | `family-story-goal` | works |
| `/try/home` | child | `HomeScreen` | works, nearly empty |
| `/try/learn`, `/try/learn/[id]` | child / focus | `LearnChapter`, `LessonReader` | works |
| `/try/explore`, `/try/explore/[id]` | child | `ExploreChapter`, `CompanyChapter` | works |
| `/try/decision`, `/try/outcome` | child (hidden scenes) | `DecisionChapter`, `OutcomeChapter` | works |
| `/try/portfolio` | child | `PortfolioScreen` | works |
| `/try/portfolio/companies` | child | `RealCompanyResearch` + `FamilyRealMarketPractice` + `FamilyRealWorldPanel` | works, very long |
| `/try/profile` | child | `ProfileScreen` | works |
| `/try/parent`, `/parent/request`, `/parent/key`, `/parent/learn` | parent | `family-story-parent`, `ParentKey` from `family-public-studio` | works |
| `/try/together` | child (lens "both") | `TogetherChapter` | works |
| `/try/lab` | none (own page) | `FamilyPublicStudio` (631 lines, second product) | **HTTP 500**, same error |

Two separate state reducers are kept in one provider: the 100-credit fictional practice (`family-public-practice`) and the $1,000 imaginary-USD paper book (`family-real-market-sandbox`). A reset clears both; neither can alter the other. This separation is correct and is kept.

## 2. Findings

Severity: **P0** blocks a journey, **P1** makes a golden journey confusing or tiring, **P2** polish or consistency.

### 2.1 Defects

| # | Sev | Finding | Repro | Root cause | Desired outcome |
|---|---|---|---|---|---|
| D1 | P0 | The public Family landing `/` returns HTTP 500 at every viewport | open `/` | `FamilyOnlyHome` is a server component that renders `lucide-react` icons. lucide 1.x creates a React context, and `createContext` does not exist in the RSC runtime | landing renders; icons only inside client components |
| D2 | P0 | `/try/lab` returns HTTP 500; the footer of **every** page links to it ("Advanced legacy experiment") | open any page, expand the footer, follow the link | same as D1 (`/try/lab/page.tsx` renders lucide icons on the server) | lab renders, and it is no longer linked from every page |

Screenshots: `before/1440-landing.png`, `before/1440-lab.png`.

### 2.2 The golden journeys, traced

**Child: first visit → goal → concept → safe fictional decision → consequence.**
`/try` → 3 setup screens → Home → Learn → lesson (3-6 slides, an applied exercise and a quiz) → Explore → company story → research question → "Practice with" → `/try/decision` → `/try/outcome`. It works end to end, and the reducer logic (Key preview before the click, one-time approval, stale requests) is good. Problems:
- Home is a single "mission" card and a bar (`before/1440-home.png`). The child sees no map of where they are in the loop (goal → learn → meet → decide → talk), no credits, and the Key is hidden in a `<details>`. Progress is not visible, so the product does not feel like it is going anywhere.
- `/try/decision` and `/try/outcome` are reachable only by in-page links. They are filed under the Explore and Portfolio tabs, so the moment of decision belongs to no destination you can return to.
- The company page (`before/390-company.png`, 2,360px on a phone) stacks 7 panels: story, dilemma, interest note, 4-item research list, invented trend, goal lens, research quiz, then practice. The page has no numbered steps, so the child cannot tell how far they are from the decision.

**Parent: understand safety → set a simulated limit → see activity → review what would need approval.**
`/try` → "I'm the Parent" → overview → Key → requests. Problems:
- The overview (`before/1440-parent.png`) puts three unequal cards in one row: the goal, "nothing waiting" text and the Key. Nothing marks what needs attention first.
- "What your child did" shows four counters (0 / 0 / 0 / 0) but no actual activity. A parent cannot see *what* was chosen, *why* or *when*.
- Jargon a parent should not need: "Practice version 1", "v1 / nonce 3", "ORC, MKT, BKT".
- The simulation notice appears 3 times on the request page and in two places on the overview.

**Child, real company: choose a company → understand the business → source/date → optional chart → paper trade → explain gains or losses.**
Explore banner or Portfolio banner or Portfolio tab → `/try/portfolio/companies`. Problems (`before/1440-real-full.png`, `before/390-real-full.png`):
- **2,766px tall on desktop and 4,147px on a phone**, the longest page in the product. 682 words, **20 disclaimer phrases**, **26-31 text elements under 12px**.
- The order is reversed. The trade desk comes first and "Understand the business" is last, under a fold, even though the issue requires business → source → chart → trade.
- Each company card's second link is the company's Investor Relations site, so the first-viewport choices on a phone are 4 "Explore X" buttons and 4 **offsite** links (`before/390-real.png`). This is the offsite jump described in issue #126.
- Dead end: every action is disabled until the child types a price, and the only price source is a third-party chart that they must first opt in to. Nothing walks them through "read the price on the chart, type it here".
- No step explains a gain or loss. The P&L appears as a number ("Unrealized change") with no reasoning prompt, so the learning goal ("explain gains/losses") is not met.
- Three overlapping boundary notices say the same thing (the yellow box in the lab, the yellow box under the page, the global footer), plus a fourth line on redistribution rights.

### 2.3 Systemic root causes (why it feels like several sites stitched together)

| # | Sev | Root cause | Evidence |
|---|---|---|---|
| R1 | P1 | **Real vs pretend has no single visual language.** "Pretend", "fictional", "imaginary", "practice only", "not real", "simulated", "NOT EXECUTED ONCHAIN" are used interchangeably, in green, blue and yellow boxes. | metrics: 8-20 disclaimer phrases per page; `PRACTICE ONLY - NOT EXECUTED ONCHAIN` (crypto jargon) in Portfolio |
| R2 | P1 | **Information architecture splits one idea across tabs.** Real companies are *things to explore* but live under Portfolio, and three separate links lead to them (Explore banner, Portfolio banner, Portfolio tab). The real paper portfolio has no summary in Portfolio. | `family-portfolio-tabs.tsx`, `explore-real-entry`, `portfolio-real-entry` |
| R3 | P1 | **There is no visible model of the learning loop.** The state already computes `chapterStatus` (goal, learn, explore, decision, parent, outcome, together) but nothing shows it, so progress feels random. | `family-story-state.ts:chapterStatus` is unused in the UI |
| R4 | P1 | **Competing second product.** `/try/lab` (`FamilyPublicStudio`, 631 lines) duplicates every tab in another layout and is linked from every footer and from Profile. | `family-app-shell.tsx:SafetyFooter` |
| R5 | P1 | **Density instead of hierarchy.** Every page is a stack of equally weighted rounded cards; headings are 26-36px but body copy is 11-13px, and helper text is often 11px. | tiny text counts in metrics; Explore 3,515px tall on a phone |
| R6 | P2 | **Lens chip noise.** "Child's view · practice" sits in the header of every child page and adds nothing in the child's own app. | every child screenshot |
| R7 | P2 | **Over-tooling for six items.** Explore has full-text search and 7 category filters for 6 invented companies, plus a featured card that repeats the first list item. | `before/390-explore-full.png` |
| R8 | P2 | **Parent lacks a timeline.** The data exists (`requests`, `receipts`, `reasons`, `declineReasons`) but no screen shows it in order. | `family-story-parent.tsx` |

Video (from issue #126, not observed by me): the real-company scroll, repetitive components, the IR offsite jump, and the chart and calculation sitting far apart all match R1, R2 and section 2.2.

## 3. Design direction: "One loop, two clearly labelled worlds"

**Product principle:** Cresco Family is a loop the child goes around again and again:
**Goal → Learn → Meet → Decide → Talk.** Every screen should show where you are in the loop and what the one next step is. Parents watch the same loop from their side and only step in at the boundary.

**Two worlds, one rule each, and one visual tag:**

| Tag | Meaning | Colour | Where |
|---|---|---|---|
| `Pretend` | invented companies, 100 pretend credits, My Key applies | warm yellow | story companies, practice portfolio, decisions |
| `Real company · paper $` | real businesses, official SEC figures, $1,000 imaginary USD, no Key, no Parent | blue | real company lab, paper portfolio |
| `Parent` | simulated Parent in this tab | lavender | Parent pages, requests |

These tags replace the scattered disclaimers. The full legal and source text stays available, word for word, in a "Sources and limits" disclosure on the page where it applies.

**IA changes**
1. **Explore** holds both worlds behind a two-way switch: *Story companies* (pretend) and *Real companies*. The real lab moves to `/try/explore/real`; `/try/portfolio/companies` stays as an alias so old links work.
2. **Portfolio** holds both books behind a two-way switch: *Pretend credits* and *Paper dollars*. Each has its own summary, and the two are never added together.
3. **Home** becomes the loop: one main next step, a five-step journey track, a wallet strip (free / saved for the goal / My Key) with "Set aside 20", and a parent status line.
4. **Parent overview:** "Needs you" first, then the same journey track (a shared mental model), then the Key in plain words, then a dated activity timeline.
5. **Lab:** the crash is fixed, it is no longer linked from every page, and it is reachable only from Profile as "Classic practice lab (older layout)".
6. **Shell:** no lens chip on child pages; one quiet footer line with a link to "How Cresco works" (Profile).

**Real company lab, redesigned as four numbered steps in one column (chart beside trade on wide screens):**
1. *Understand the business*: what it sells, who pays, SEC revenue and net income with fiscal period, form, filing date and currency (unchanged data), and the "more sales, less profit?" exercise.
2. *Look at the price*: opt-in TradingView chart with the unchanged consent text, then "type the price you read and its date" (manual, labelled unverified). Licensed EOD snapshot logic unchanged and still DISABLED.
3. *Paper trade*: amount, then buy or sell with imaginary USD.
4. *Explain the result*: for a position, show the gain or loss and ask the child to pick the explanation. Revenue is not price; a falling price is not a falling business. No numbers are invented.
Company switching uses compact tabs. Investor Relations links move inside step 1 as "Company's own site (opens outside Cresco)".

**Small design system (scoped to `.cresco-family-app`)**
- Type: display 30/36 (mobile 26), h2 20, body 15/24, meta 13/20; **nothing under 12px**.
- Width: content max 1040px; reading max 680px; 8px spacing grid (8, 12, 16, 24, 32).
- Surfaces: `Card` (surface, 20px radius, 1px soft border), `Card tone="accent"` for the one primary next step per page; no nested cards beyond two levels.
- Components: `RealityTag`, `JourneyTrack`, `StepHeader` (numbered step), `Stat`, `Segmented` (two-way switch), `SourcesNote` (the single disclosure for legal and source text).
- Actions: one primary button per view (`family-action` blue), secondary outline, tertiary text link.
- Copy: plain words and short sentences. No "nonce", "onchain", "EOD" or "unrealized" in child copy; a ticker is always shown next to the company name.

## 4. Plan and acceptance checklist

Implemented on the review branch, in this order: shell and tokens → Home → Explore and real lab → Portfolio → company page and decision → Parent → Profile and lab → landing.

| # | Acceptance check | How verified |
|---|---|---|
| A1 | `/` and `/try/lab` return 200 | e2e + curl |
| A2 | At 390x844, Home shows the next step, the journey track and the wallet without scrolling | e2e `toBeInViewport` |
| A3 | Real company page is at least 35% shorter at 390 and 1440, and puts the business explanation before the trade | metrics script |
| A4 | No text under 12px on main journey pages | metrics script |
| A5 | Disclaimer phrases per page reduced; each page has exactly one reality tag strip | metrics + e2e |
| A6 | Real vs pretend: tags present; credits and USD never summed; reset clears both | unit + e2e |
| A7 | No third-party request before chart opt-in; no API/POST anywhere | e2e network watch |
| A8 | Child journey, Parent journey and real-company journey pass end to end, Chromium desktop + WebKit iPhone | Playwright |
| A9 | Key, one-time approval, stale request, duplicate ask and insufficient credits behave as before | existing unit + e2e |
| A10 | Keyboard: every action reachable with Tab; visible focus ring; `aria-current` on nav and switches | e2e |

## 5. Decision log

| Decision | Why | Rejected alternative |
|---|---|---|
| Keep the 5 tabs | Original Cresco structure; tests and founder familiarity | A 3-tab app (too disruptive for one review) |
| Real companies under Explore, paper holdings under Portfolio | "Learn about a business" belongs in Explore; "what do I hold" belongs in Portfolio | Keeping them under Portfolio (root cause R2) |
| Show `chapterStatus` as a journey track | Data already exists; makes progress visible to child and parent alike | Badges only (they reward, but do not orient) |
| One reality tag + one "Sources and limits" disclosure per page | Removes repetition without deleting any safeguard text | Deleting the legal text (unsafe) |
| No sample prices for real companies | Issue forbids invented prices; manual entry stays clearly unverified | A "classroom price" (would be an invented real price) |
| Lab demoted, not deleted | Existing tests and shared state; the founder can decide on removal | Deleting `/try/lab` now |

## 6. Results of the redesign (Gate C)

Screenshots for the same routes and viewports: `ux-overhaul-2026-11-16/before/` and `ux-overhaul-2026-11-16/after/`
(`<viewport>-<route>.png`; `-full` = full page). Capture script: `ux-overhaul-2026-11-16/capture-screenshots.mjs`.
The real-company page moved from `/try/portfolio/companies` to `/try/explore/real`; the old address still renders the same page.

### Measured before → after (Chromium, 100% zoom)

| Viewport | Page | Height before (px) | Height after (px) | Disclaimer phrases | Text under 12px |
|---|---|---|---|---|---|
| 1440 | landing `/` | HTTP 500 | 2922 | 0 → 9 | 0 → 0 |
| 1440 | home | 900 | 900 | 3 → 6 | 3 → 0 |
| 1440 | explore | 1912 | 1104 (−42%) | 8 → 5 | 9 → 0 |
| 1440 | company | 1789 | 1575 | 6 → 7 | 5 → 0 |
| 1440 | portfolio | 1272 | 929 (−27%) | 11 → 8 | 4 → 0 |
| 1440 | real companies | 2766 | 1947 (−30%) | 20 → 8 | 26 → 0 |
| 1440 | parent | 1145 | 1219 | 5 → 6 | 5 → 1 |
| 1440 | `/try/lab` | HTTP 500 | 2015 | n/a | 20 (unchanged classic layout) |
| 390 | home | 845 | 1229 | 2 → 5 | 8 → 0 |
| 390 | explore | 3515 | 1880 (−47%) | 4 → 4 | 14 → 0 |
| 390 | company | 2360 | 2151 | 5 → 6 | 10 → 0 |
| 390 | portfolio | 1718 | 1240 (−28%) | 10 → 7 | 9 → 0 |
| 390 | real companies | 4147 | 3183 (−23%) | 19 → 7 | 31 → 0 |
| 390 | parent | 1725 | 1748 | 5 → 6 | 5 → 1 |

Notes on the metrics:
- "Disclaimer phrases" counts the words pretend, fictional, imaginary, simulated, not real and similar. The new reality tags and the switch labels ("Pretend credits") use those words on purpose, so on Home and Parent the count went *up* while the paragraphs of repeated legal text went away. Closed "Sources and limits" disclosures are not counted.
- Home on a phone is taller because it now shows the learning loop, the credit bar and the Key, which were hidden in a drawer before.
- No external request at any viewport before the chart opt-in.

### Acceptance checklist (section 4)

| # | Result | Evidence |
|---|---|---|
| A1 | **Met.** `/` and `/try/lab` return 200 | `e2e/family-redesign.spec.mjs` A1 |
| A2 | **Met** (390x844 and iPhone 13 emulation) | redesign A2 |
| A3 | **Partly met.** The business now comes before the trade, and the page is 30% shorter at 1440 but only **23% at 390** (target 35%). The four steps each keep their own form on mobile. | metrics table; real-world spec checks step order |
| A4 | **Met on the redesigned pages.** 0 text under 12px. Remaining small text: one line in the Parent illustration and the classic lab (not redesigned). | metrics |
| A5 | **Met.** Exactly one reality tag per main page; repeated notices moved into one closed "Sources and limits" disclosure, with the wording kept | redesign A5/A6 |
| A6 | **Met.** Separate Portfolio pages; reset clears both books; neither changes the other | unit `family-redesign.test.tsx`, real-world spec |
| A7 | **Met** | network watchers in all public specs |
| A8 | **Met** on Chromium desktop 1280x900 and iPhone 13 emulated **on Chromium**. **WebKit not run**: the WebKit download is blocked in this environment. | see test table below |
| A9 | **Met.** The reducers are untouched; all earlier Key, approval, stale, duplicate and insufficient-credit journeys pass | `family-story-journey.spec.mjs` |
| A10 | **Met** for the switches, the company picker and the price form | redesign A10 |

### Tests run on the review branch

| Suite | Result |
|---|---|
| `npm run typecheck`, `npm run lint` (0 errors; the 3 warnings are pre-existing in unrelated files), `npm run copy:lint` | pass |
| `npx vitest run` (apps/web) | 27 files, 190 tests pass |
| Repo root `npm test` (quality gate + node tests) | 286 pass |
| `node scripts/build-public-family.mjs` (public artifact gate) | PASS, not deployed |
| `npm run build:family` with a placeholder dedicated origin (`https://cresco-family-api.example.invalid`) | PASS; config check only, not uploaded |
| Playwright `public-family-desktop` (Chromium 1280x900, local `wrangler dev`) | 35/35, 3 consecutive runs; `--repeat-each 8` on the real-world and redesign specs 80/80 |
| Playwright `public-family-webkit` project, **with browserName switched to Chromium** (iPhone 13 emulation) | 47/47, 3 consecutive runs |
| Real WebKit, Windows smoke (`scripts/family-v3-local-pilot.ps1`), `playwright.family-practice.config.mjs` | **not run** here (no WebKit binary, no Windows) |

Test changes to note:
- Some specs encoded the old interface (the hidden Home drawer, the featured Explore card, the lab link in the footer, `NOT EXECUTED ONCHAIN`, the Portfolio "Real companies" tab). They now assert the new interface and say so in comments.
- Two existing public-demo checks visited `/try/lab` and `/`, which both returned 500 at the baseline, so that suite could not have passed at `3fbc92b0`.
- New `e2e/family-ready.mjs`: specs wait for `html[data-family-ready]`, which the provider sets after hydration. This removed intermittent failures where a click landed on server-rendered HTML before React attached.

### What did not change (safeguards)

- `family-public-practice.ts`, `family-real-market-sandbox.ts`, `family-story-state.ts`, the SEC snapshot files and `family-market-approved-snapshot.json` (still `DISABLED`) are byte-identical to the baseline.
- No price is invented. Manual prices are still labelled `USER-ENTERED … (NOT VERIFIED)`. The TradingView consent text is unchanged, and nothing loads before the click.
- No new network calls, storage, identity, auth or API. Wrangler config, the Family build guards, Cloudflare and the Colosseum Worker are untouched. Nothing was deployed or merged.

### Open items for founder review

1. Mobile real-company page length (A3): next candidates are hiding step 4 until a paper trade exists, and a sticky step index.
2. Decide whether to delete `/try/lab` (now demoted, linked only from Profile).
3. Run real WebKit (iPhone) and the Windows smoke locally (commands in the PR).
4. The learning-loop track uses the existing `chapterStatus`. "Meet" counts as done after opening one story; consider whether it should need the research answer.

## 7. Review round 2 (2026-11-23, founder feedback on PR #127)

### CI
- **`cresco-web` failure, fixed.** The canonical `playwright.config.mjs` excluded Family specs by a hand-kept list, and `family-redesign.spec.mjs` was missing from it. CI therefore ran the redesign spec against the canonical Next app, which closes `/try/*`, and the hydration wait timed out (6 failures).
  - Both configs now import one list: `apps/web/e2e/family-worker-specs.mjs`.
  - `src/lib/playwright-config-split.test.ts` fails if the two configs drift again.
  - The canonical config now lists 31 tests and no Family specs.
- **"Hosted Family contract observation" is pre-existing and not caused by this branch.** It also fails on #124: it probes the live hosted site, and that site has no SHA attestation. Fixing it would need a deploy, which is out of scope.
- **Real WebKit is now proven.** CI ran `Public Family iPhone WebKit + desktop Chromium` at 82/82, including the redesign spec on real iPhone WebKit.

### Decisions applied
- **`/try/lab`:** kept, reachable only from Profile. Unchanged.
- **"Meet" in the learning loop:** completes only after a meaningful interaction, meaning the child answered the person's dilemma or got the research question right. Opening a company page no longer counts.
  - The rule lives in `metCases()` in `family-story-state.ts`, a progress-only change; no Key, credit or approval logic changed.
  - Home's mission resumes an unanswered person ("Finish meeting Mina").
  - Explore badges now show Opened, Met or Researched.
  - The Parent activity list counts only people the child has met, and the loop step reads "Answer a dilemma".

### Real-company page on phones (target: 35% shorter)
On phones the lab is now a **guided, one-step-at-a-time flow**:
- Only the current step is open; the other steps show a one-line summary (e.g. "Your price: $200.00 · 2026-11-23").
- Step 1 ends with "Next: read the price". Saving a price opens the trade step, and a trade opens "Explain the result". The no-real-order message stays visible outside the steps.
- From the `lg` breakpoint, all four steps stay open as before.
- The company picker is a single row of tickers, and a dot marks a company the child holds.

| 390x844 (Chromium, 100% zoom) | Height | vs baseline 4,147px |
|---|---|---|
| Step 1 open (first visit; the longest state a child can reach) | 1,961 | **−53%** |
| Step 2 open | 1,725 | −58% |
| Step 3 open | 1,413 | −66% |
| Step 4 open | 1,463 | −65% |
| All four forced open (not reachable on a phone; shown for honesty) | 3,102 | −25% |

Script: `ux-overhaul-2026-11-16/measure-real-company-phone.cjs`. Screens: `after/390-real-phone-step1.png`, `after/390-real-phone-step4.png`.

### Cohesion pass over both journeys
Both journeys were scripted end to end (`capture-journeys.cjs`) and every screen was reviewed at 390 and 1440. Screens are in `journeys/`.

| Found | Fix |
|---|---|
| "Talk it through" showed two page titles (an embedded lab component) | Rebuilt natively: the Child's and Parent's views side by side (a hand-over cue on phones), plus "What you are talking about" and "Start the next round" |
| The Parent's My Key page was the old lab component: oversized headings, "version / nonce 1/1", ticker-only checkboxes, a different button style | Rebuilt: plain "Right now" stats, labelled fields, company names with tickers, and a warning when saving would expire open requests. Save is disabled until something changes. The same reducer action and validation are used. |
| The Outcome page had three giant stacked numbers and three equal buttons | One compact stats row and **one primary next step** ("Talk it through" right after a decision); the rest are text links |
| The Decision page had 4 stacked full-width buttons below the main action | One primary button, then a row of text links |
| The Parent request had a ticker in the title, "Decline #1:" button labels, and the "Approve once" button partly off the first iPhone screen | Company name in the title; decline reasons as compact choices (the accessible name keeps "Decline #N"); the Key rows merged; "Approve once" fully in the first screen (an existing test caught this) |
| A child-lens chip on onboarding and lessons; "Child's lens" lesson labels; "fictional credits" in onboarding | Lens chip only on Parent and Together pages; "Lesson 3 · 6 min"; "pretend credits" everywhere a child reads |
| No celebration when the loop is complete; no link between a lesson and the loop | "You finished a full round" on Home; loop progress on "Lesson complete" |
| The real-company book said "pretend shares" (the pretend-credits word) | "paper shares" and "paper positions" |
| The shared kicker label was 11px | 12px inside the Family app only |

### Round 2 test results
| Suite | Result |
|---|---|
| typecheck · lint (0 errors; 3 warnings pre-existing in unrelated files) · copy lint | pass |
| vitest | 28 files, 193 tests |
| `build-public-family` · `build:family` (placeholder dedicated origin) | PASS, not uploaded |
| Family desktop Chromium (local wrangler) | 35/35, two consecutive runs |
| Family iPhone 13 project run on Chromium (WebKit download is blocked here) | 48/48 (+1 desktop-only skip), two consecutive runs. Real WebKit runs in CI (`family-public-browser.yml`). |
| Canonical config, local, on Chromium | 30 passed + 1 skipped, no Family specs. `next build` is blocked here by a security-advisory lookup, so this run used an older local `.next` build; CI is authoritative. |

### Remaining issues for founder review
1. **Not yet seen by children or parents.** All judgements here are heuristic and screenshot-based. A short moderated session with 2–3 families would be the next real evidence.
2. **Home on a phone is taller (845 → 1,229px)** because the loop, the wallet and the Key are visible instead of hidden. The next step and the loop are in the first screen; the wallet needs a short scroll.
3. **The real-company flow still needs a typed price**, because licensed end-of-day prices stay disabled until rights are confirmed. Children must read the price off the optional chart. This is the main friction left in that journey, and it is a licensing decision, not a UI one.
4. **The classic lab (`/try/lab`)** was not restyled. It has 20+ text items under 12px and its own navigation. It is linked only from Profile, per your decision.
5. **The Parent Learn hub and the lesson reader** were only lightly touched (labels, loop cue). The lesson slides keep their earlier layout.
6. **Hosted-observation CI job** is still red, as on #124. It needs a deploy-side attestation.
7. **Manual checks still needed:** Windows smoke (`scripts/family-v3-local-pilot.ps1`) and a real-device iPhone check. CI covers WebKit emulation, not hardware.

## 8. Issue #130 acceptance pass (2026-11-23)

Brief: Faadil1/cresco#130, on the same draft PR #127.

| | |
|---|---|
| Baseline | `ead820841301ff4872a0237840b93bb0a7fc39c4` |
| Code tested | `91d384c` (P1 `c87de60`, P2 `f43b24f`, P3 `91d384c`) |
| Docs commit | This section, plus screenshots, on top of the tested code. It changes no code. |

### Evidence and limits
- **Video:** the founder's OptiPlex recording `20261123-0413-38.9585717.mp4` was **not available** to me. The observations in #130 (unused desktop width, Learn as a list, real companies in finance terms, the Parent cycle not yet verified) are taken from the issue as hypotheses, not from my viewing.
- **Builds compared:** before/after captures come from two local builds served side by side by Wrangler, the baseline `ead8208` (port 3101) and the tested code `91d384c` (port 3100). Chromium, 100% zoom, CSS viewports 390x844 (touch) and 1440x900.
- **Where to find them:** `ux-overhaul-2026-11-16/issue-130/{before,after}/`, produced by `capture-130.cjs`.
- **Not tested:** no family or child user testing has happened. Every UX judgement here is heuristic.

### P1: Learning that teaches through action
- **Observed:** "Save for a goal" and "Practice with risk" were 3 reading slides with a 2-option exercise and a recall quiz. The Learn page was one 17-row list, which left wide desktops half empty.
- **Implemented:**
  - Reusable lesson beats: `src/lib/family-lesson-interactions.ts` (pure, unit-tested) and `src/components/family-lesson-interactive.tsx` (`DecideBeatView`, `LabBeatView`, `CheckBeatView`, `InteractiveLessonBody`).
  - Each of the two lessons is now **decide → make it work → check**. The decide beat shows its consequence with worked numbers from the child's own goal. The lab has a stated goal to reach, such as "15 or less per period, inside your Key" or "a drop that costs exactly 5". The check reuses the vetted question with a specific hint for each wrong answer and free retries.
  - The vetted scenes stay under "Read the full lesson".
  - Completion only goes through the unchanged `complete` action, after a correct check. Opening or leaving a lesson completes nothing.
  - The Learn page shows three chapters (Money basics; Companies and shares; Risk and choices) with done counts, Up next and "Interactive" markers. All 17 lessons stay one click away. Parent lessons are unchanged and stay separate.
- **Tested:**
  - Unit: `family-lesson-interactions.test.ts` (numbers, gating, chapter coverage) and `family-lesson-interactive.test.tsx` (completes once, only after a correct check; wrong answers retryable).
  - E2E `family-story-journey.spec.mjs`, "an interactive lesson teaches through a decision…": a first-time child picks a goal, completes c-save with a wrong-then-right answer and goes Home. Only Learn moves; 1 of 17 done; the Money chapter shows 1 of 5. Opening c-risk and leaving completes nothing.

| Height (px) | 390 before | 390 after | 1440 before | 1440 after |
|---|---|---|---|---|
| Learn | 1,847 | 2,260 | 1,711 | **1,095** |

### P2: real-company exercise a child can follow
- **Observed:** step 1 opened with company and finance wording. Pricing was only "type a price". "View on TradingView" was a link sitting next to the chart button, so one tap could leave Cresco by accident.
- **Implemented:**
  - Step 1: a one-sentence explanation, "How money comes in" with a concrete example, and tap-to-explain terms for revenue, profit and reference price.
  - Plain labels: "Revenue: money customers paid" and "Profit: money left after costs". A new line, "Out of every $100 customers paid, about $X was left as profit", is arithmetic on the official SEC figures (Apple 28, Microsoft 40, Costco 3, Shopify 11).
  - "Why would someone choose it?" with gentle feedback. A paper buy waits for a reason.
  - Step 2 gives an a/b/c sequence and a clear message for an invalid price. The TradingView link appears only after opting into the chart.
  - SEC period, form, filing date and USD stay visible.
- **Unchanged:** sandbox logic, SEC snapshots and the EOD snapshot (`DISABLED`). No prices are invented.
- **Tested:**
  - Unit: `family-real-company-explainers.test.ts`.
  - E2E `family-acceptance-130.spec.mjs` P2, on phone and desktop: Apple and Shopify; missing and invalid price; a valid dated price labelled `NOT VERIFIED`; a 0.25 fractional buy; a later price; value and P&L; explaining the direction wrong then right; the fictional Portfolio unchanged (100); the paper book showing both companies; reset; **zero third-party requests**.

| Height (px) | 390 before | 390 after | 1440 before | 1440 after |
|---|---|---|---|---|
| Real companies, step 1 | 1,961 | 2,478 | 1,933 | 2,153 |
| Real companies, explained state | 1,992 | 1,992 | 2,344 | 2,668 |

The added explanation and the reason question make step 1 longer. On a phone it is still **−40% against the original 4,147px**.

### P3: simulated Child → Parent → Child cycle
- **Tested end to end** in `family-acceptance-130.spec.mjs` P3, at **1440x900, 1280x800 and phone**, asserting state and not screenshots. In order:
  1. Inside the Key, a 10-credit choice gives a receipt and no request; spent 10, free 90.
  2. 25 credits is blocked and creates a request carrying the reason "curious"; nothing is bought. Sending the same ask again is disabled ("already sent").
  3. The Parent sees the company, amount and reason, plus the simulated notice. **Approve once** works by keyboard, and the Key stays at 15.
  4. The Child uses the approval (spent 35). The same 25 then shows "used" and is disabled.
  5. A **decline with reason** ("too big") buys nothing. The Child sees why, the same 20 is disabled as "declined", and 10 inside the Key works.
  6. A **Key change** to 20 per choice first warns "will expire 1 open request". The request becomes **stale**: no Approve button. Under the new Key the same 30 needs the Parent again and is never silently allowed.
  7. The Parent timeline shows 3 asks with the right statuses and reasons, plus 3 practice choices.
  8. A reload resets everything. No cookies, no local or session storage, no network writes, no external hosts.
- **Defect found and fixed:** a Parent's approval or decision was hidden behind "Choose what you are saving for" on Home whenever the child hadn't picked a goal yet. Home's mission now puts anything in flight with the Parent before setup. The change is mission order only (`family-story-state.ts`) and is unit-tested. `family-public-practice.ts` is unchanged.

### Safeguards (diff against `ead8208`)
- `family-public-practice.ts`, `family-real-market-sandbox.ts`, the SEC snapshots, `family-market-approved-snapshot.json` (`DISABLED`), Wrangler/vite configs, build scripts and workflows: **unchanged**.
- `family-story-state.ts`: progress and mission order only.
- No new network, storage, identity, analytics or account.

### Founder's Windows test steps (PowerShell, no deploy)
```
git fetch origin claude/family-ux-overhaul-2026-11-16
git checkout claude/family-ux-overhaul-2026-11-16
git log -1 --format=%H
cd apps\web
npm.cmd ci --no-audit --no-fund
npm.cmd run build:public-family
npm.cmd run start:vinext -- --ip 127.0.0.1 --port 3100
```
Then open `http://127.0.0.1:3100/try` (Edge, 100% zoom) and check:
1. **Lesson:** "Let's begin" → New bike → Skip → Open my Home → Start lesson. Pick each answer in step 1 and read the consequences. Move the slider until the green goal message appears. In the check, pick a wrong answer first (you get a hint), then the right one → Complete lesson → Back to Home. Only "Learn" is ticked.
2. **Real company:** Explore → Real companies → Apple. Tap "What is revenue?", pick a reason, type 200 → Save → 0.25 → Paper buy. Type 220 with today's date → Save. Step 4: choose the explanation.
3. **Parent cycle:** Explore → Neighborhood Markets → answer Mina → Practice → "A bigger choice (25)" → Ask my Parent → Hand the phone to your Parent → Approve once → Hand back → use the approval. Then repeat with a decline, and with a Key change (Parent → My Key → 20 → Explicitly update standing Key).
4. Refresh the page: everything resets.

Optional automated run on Windows (after the build above, with the server stopped):
```
npx playwright install chromium webkit
npx playwright test -c playwright.family-public.config.mjs
```

### Remaining unknowns and gaps
1. **No user testing.** No family or child has used this; clarity and engagement are heuristic.
2. **Interactive lessons:** only 2 of 17 child lessons use the new format; the primitives are ready for more.
3. **Prices are typed by the child.** Licensed end-of-day prices stay disabled until redistribution, derived-data and cache rights are confirmed.
4. **Longer pages in places:** real-company step 1 and Learn on a phone are longer than at `ead8208`, because of added explanation and chapter headers.
5. **Simulated Parent only.** There is no real guardian identity, consent, second device or sync; this is by design, but it is not proven family authority.
6. **Pre-existing CI failure:** the hosted-observation job is still red, unrelated to this branch.

## 9. Issue #132: paper buy unblocked, 17 interactive lessons, visual pass, market-data memo (2026-11-27)

Brief: Faadil1/cresco#132, plus the founder's chat brief. Same draft PR #127.

| | |
|---|---|
| Baseline | `08bd8269c7faa8f2d95086a11a63515e2ae91dc0` |
| Commits | P0 `107b8d2`, curriculum `24bd0bb`, visual `2f660ff`, memo + price status `12647d4`, docs (this section) on top |
| Evidence | `ux-overhaul-2026-11-16/issue-132/{before,after}/`, from `capture-132.cjs` and `capture-p0.cjs` |
| How captured | Two local Wrangler builds side by side (baseline :3101, new :3100). Chromium, 100% zoom, viewports 1440x900, 1280x800, 390x844 and 375x812. |
| Limits | The recording `20261127-0654-04.5943254.mp4` was **not available**; its observations come from the issue. No user testing. |

### P0: Paper buy left blocked (fixed first)
- **Root cause (confirmed in code):**
  - The reason prompt lived only in step 1.
  - The trade showed "First, say why… in step 1" with a "Go to step 1" button marked `lg:hidden`, and that button only changed the phone stepper.
  - On desktop there was no visible action, so a child who answered the SEC profit quiz and saved a price was stuck.
  - Before/after: `1440-p0-blocked-buy.png`.
- **Fix:**
  - The reason question now appears **at the point of action**, bound to the same state as step 1. Nothing is auto-selected, nothing trades automatically, and price and quantity stay as typed. The box then confirms "Reason saved. Paper buy is unlocked."
  - "See this question in step 1, with the company facts" scrolls to the question and focuses it on every viewport. "Back to the paper trade" returns focus to Paper buy.
  - The reason is labelled "not a quiz", so it reads as distinct from the SEC "more sales, less profit?" check.
  - The paper-loss explanation now says "realized **paper** loss… no real money".
- **Regression tests** (`e2e/family-acceptance-132.spec.mjs`):
  - Follows the founder's order exactly at **1440x900 and 1280x800 by keyboard, and on phone by touch**: SEC quiz only, a missing price, an invalid price, then the 100.00 **test input** (labelled as test data), a blocked buy, recovery, a reason, a 0.25 buy → **$975.00**.
  - Microsoft still needs its own reason, the 100 pretend credits are untouched, and there are no external requests.

### P1: all 17 Child lessons interactive (17 of 17 converted)
- **New accessible activity types:**
  - *Sort:* tap a group per item, with an explanation for each item and free retries.
  - *Allocate:* +/- buttons until the rules hold.
  - New labs for repeated fees, profit break-even and Mina's grocery.
  - Decisions can include an invented price line, labelled "illustrative only".
- **All tap or keyboard based:** no dragging, no streaks and no rewards.

| Chapter | Lesson | Activities (objective in `family-lesson-catalogue.ts`) |
|---|---|---|
| Money | Save for a goal | decide (a tempting tip) + lab (plan 15 or less per period) |
| Money | Needs, wants and a budget | allocate 30 credits (bus first) + sort needs and wants |
| Money | Compare prices and value | decide on cost per bowl + decide on total cost with delivery |
| Money | Fees and hidden costs | decide (same gain, different fee) + lab (a yearly fee eating more than half of the gain) |
| Money | Recognize scams and promises | sort red flags and safe signs + decide on a "send your login" message |
| Companies | Know what you own | decide (busier means better?) + grocery break-even lab |
| Companies | What Is a Stock? | sort customer or part owner + decide (10 of 1,000 shares) |
| Companies | Why Companies Sell Shares | decide (loan vs selling 20%) + sort true or false |
| Companies | Stock vs. Tokenized Security | sort useful questions + decide (same name, same thing?) |
| Companies | Revenue, costs and profit | decide (100 sales, 105 bills) + break-even lab |
| Companies | Research a real company | sort fact or guess + decide on a first source |
| Risk | Practice with risk | decide (one company or two) + measure-a-loss lab |
| Risk | Why Prices Move | decide with an invented price line + sort what can move a price |
| Risk | Risk & Reward | decide (steady vs wild, with a deadline) + measure-a-loss lab |
| Risk | Build Your Portfolio | allocate 20 with no holding over half + decide (count names or weights) |
| Risk | Funds, baskets and diversification | decide (two funds with the same holdings) + sort what to check |
| Risk | Why prices move and time matters | decide (one bad day) + decide (time horizon) |

- **Every lesson keeps:** its vetted check question, now with a hint for each wrong answer; its full text and sources under "Read the full lesson"; its personal goal note; and completion only through the unchanged `complete` action.
- **Tests:**
  - Unit: all 17 are interactive and Parent lessons are not; activity types vary; every activity is solvable and not pre-solved.
  - E2E (phone and desktop): completes all 17 in-app with a wrong answer first. Progress counts each lesson exactly once, a revisit does not count twice, credits/paper/Key are unchanged, and the badge is earned.

### Visual pass
- **Learn:** a learning trail per chapter, with stops for done, next (a soft glow) and ahead, plus chapter art. On desktop the three trails sit side by side. It is still an ordered list of links.
- **Home:** an original goal-jar illustration fills as credits are saved, with a text alternative.
- **Lessons:** two columns on wide screens (the activity, plus a context panel with picture, aim, goal note and the full lesson); "You can now…" on completion.
- **Motion:** short pop/rise feedback that switches off under `prefers-reduced-motion` (tested).
- **Inspiration only:** Duolingo's progression and Greenlight/GoHenry's plain hierarchy. No copied branding, assets or layouts, and no gambling-like cues.

| Height (px) | Before | After |
|---|---|---|
| Learn, 1440 | 1,095 | 1,181 |
| Learn, 390 | 2,260 | 2,560 (+13%, trail spacing) |
| Budget lesson, 1440 | 972 | 928 |
| Scams lesson, 390 | 1,079 | 1,469 (a real activity replaces one reading card) |
| Home, 390 | 1,229 | 1,291 |

Portfolio, Paper and Parent are unchanged. No horizontal overflow at any of the 4 viewports.

### Market data
See `docs/family/MARKET_DATA_PROVIDER_DECISION_20261127.md`.
- **Status: BLOCKED.** No keys, purchases or bundled prices.
- **Twelve Data:** needs a Redistribution Rights add-on for showing prices to end users.
- **Marketstack:** public pages say nothing about redistribution.
- **To send:** six written questions for the founder to put to both providers.
- **In the app:** step 2 now says plainly that automatic prices are not available yet, and flags a manual price older than 7 days.

### Tests (local)

| Suite | Result |
|---|---|
| vitest | 203 |
| typecheck · lint (0 errors) · copy lint | pass |
| Public Family build | PASS |
| Family desktop Chromium | 45/45, twice |
| Family iPhone 13 project (Chromium) | 54/54, twice; real WebKit runs in CI |

### Safeguards
Unchanged against `08bd826`:
- `family-public-practice.ts`, `family-real-market-sandbox.ts`
- SEC snapshots, the EOD snapshot (`DISABLED`) and the importer
- Wrangler/vite configs, build scripts and workflows

The Parent is still a single-browser simulation.

### Remaining limitations
1. **No family testing.** Engagement and clarity remain hypotheses.
2. **Prices are still typed in.** Licensed automatic prices are blocked on written rights and cost.
3. **Some pages are longer:** Learn on phones (+13%) and some lessons on phones, because of the added activities.
4. **The Parent lessons (7)** keep the earlier reading format.
5. **Classic lab (`/try/lab`)** not restyled.
6. **Hosted-observation CI:** still red, pre-existing and unrelated.
