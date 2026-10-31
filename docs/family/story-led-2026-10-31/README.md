# Cresco Family: story-led multipage journey (issue #118)

Branch `family/story-led-multipage-2026-10-31`, stacked on PR #117 (product `e3e616f`). Nothing is deployed and nothing is merged. The live test Worker `cresco-family-open-test-web` still runs `cb3a6ad5-d579-43fa-a8e4-f8e2d5f38aee` (rollback `42900c64`).

## What was wrong

V2 put everything in one `/try` page: two role buttons, six tabs, one status bar. It was safe and clear about limits, but it had no story. You could not tell where you were, there was no reason to come back, and nothing you chose earlier (a goal, a lesson, a company) changed what came later. The old Cresco (cresco-lac.vercel.app) had the opposite strengths: one question per screen, big illustrated goal cards, a progress bar, a family hero, and a sticky next button. It also had things we must not carry over: a sign-in, Solana Devnet, "real market experiences" copy and real tickers.

## What was built

One in-memory story state lives in `src/app/try/layout.tsx`. Every page below is a real route under it, so normal navigation, Back and Forward keep the state, and a hard reload resets it (as promised on every page).

| Route | Chapter | Old Cresco scene it adapts | What it adds on top |
| --- | --- | --- | --- |
| `/try` | Welcome, two perspectives | `/` landing hero, `/start` teen vignette | Plain My Key line, "Start as the teen / the Parent", skip path, chapter list that shows what is done |
| `/try/goal` | 1 My goal | `/onboarding/goal`, `/onboarding/interests` | Goal tiles with art, optional interests (no name or age), live goal consequence line, optional first saving |
| `/try/learn`, `/try/learn/[id]` | 2 My learning path | `/learn`, `/lesson/[id]` | Path starts where the goal needs it; every lesson has a "For your gaming setup" note; illustrated idea steps, source links, quiz with real feedback |
| `/try/explore`, `/try/explore/[id]` | 3 Explore | `/explore`, `/explore/[ticker]` | Six invented companies (no real tickers), interest-matched first, per-company page with art, risks, research question, goal lens; research-only ones offer no practice |
| `/try/decision` | 4 Make a choice | `buy` flow | Amount, Key meter and forecast before the click, goal impact, a reason the Parent will see |
| `/try/parent`, `/try/parent/request`, `/try/parent/key`, `/try/parent/learn` | 5 Parent's moment | `/parent/(dash)` | Simulated Parent sees goal, reason, exact action, Key version and nonce; approve once or decline with a reason; Key change on purpose; own learning path |
| `/try/outcome` | 6 What happened | `/portfolio` | State-driven result (blocked, approved, declined, expired, receipt), goal numbers, a bad-month what-if, earned badges, full portfolio |
| `/try/together` | 7 Together | discussion activity | Both perspectives, recap from real state, a choice of what to learn next |
| `/try/lab` | Free lab | V2 tab studio, unchanged | Same state as the story |

## What was preserved, and why

- **Old:** one decision per screen, big art tiles, progress, a clear next button. They make the first 15 seconds feel like a story and not a dashboard. Art reused: `FamilyStoryScene`, `StoryVignette`, `GoalArt`, `PlantPot`, `LessonIllustration`, `BadgeArt`.
- **V2:** bounded autonomy, Key version and nonce, exact one-time approval, no replay, a Key change makes older requests stale, learning never changes the Key, forecast before the click, outcome visible after every action. The practice reducer is untouched; the story layer wraps it.
- **Dropped on purpose:** sign-in, session, localStorage store, backend fetch, Solana, Pyth, real tickers, Money Mode, name and age fields.

## What changed for the user

- You always know where you are (seven-segment rail, chapter name, menu with every chapter on a phone) and can jump anywhere.
- Choices have consequences you can see: the goal changes the lessons and company notes, interests reorder Explore, your reason reaches the Parent, a decline reason reaches you, a Key change expires your old ask.
- The outcome after a click is a card at the top of the page you land on. The 20% sticky bar is gone on the story pages.
- "Done" ticks appear only when something real happened in state (a lesson completed, a company opened, a request decided, a receipt, a check-in).

## Evidence

Before: `v2-before/` (the deployed V2) and `old-cresco/` (the older site, read-only GETs; no write request was sent). After: `after/mobile` (iPhone 13 WebKit, 2x) and `after/desktop` (Chromium 1280x900), one screenshot per chapter in journey order.

| Step | V2 `/try` | Story |
| --- | --- | --- |
| Landing to first action | one page, role buttons and six tabs | `/try` welcome, one primary button, then `/try/goal` |
| Where am I | tab highlight, "Portf…" truncated on iPhone | rail plus "Chapter 4 of 7", menu lists all chapters |
| Limit known | on Explore cards | on the decision page, with a Key meter, before the click |
| Parent decision on iPhone | below a long intro | Approve once is within the first screen (asserted at 50% in viewport) |

## Tests (local build of this branch, `npm run build:public-family`, served by `wrangler dev`)

- Unit: 164/164 (19 new): closed route set and its denials, story reducer (no authority leak, reasons, decline reasons, reset), personalization, chapter status from real state.
- Playwright: 30/30 = 21 on iPhone 13 WebKit (the 12 V2 tests repointed to `/try/lab`, plus 9 story tests) and the same 9 story tests on desktop Chromium. The story tests: full journey, one client-side document across pages with Back and Forward, decline and recovery, stale Key, Parent first, deep links and bad ids, no horizontal overflow, landing to story, lab and story share state.
- Direct GET: `/try/explore/nope`, `/try/explore/ORCHARD`, `/try/learn/unknown`, `/try/api`, `/home`, `/parent/sign-in`, `/onboarding/goal`, `/invest/ORC`, `/api/health` all 404.
- Network: no request to any API, RPC, wallet or non-local host in any story test.
- `typecheck`, `lint` (two existing warnings), `copy:lint`, `scripts/family-release-boundary.mjs --built-web` pass.
- The #117 release tool correctly refuses this branch (`WRONG_BRANCH`, product source changed). It was not edited or bypassed.

## Known limits

- Not run on a real phone; WebKit emulation only. No real tester has used it.
- `next build` of the full app was not run; the Family public build was.
- `/try/goal/` (trailing slash) is answered by the framework with a 308 to `/try/goal`; every other denial is a 404.
- `/manifest.webmanifest` still 404s on WebKit (console noise only).
- The goal notes, decline reasons and company-goal lines are Cresco practice copy, not source-cited; source-backed lessons keep their references.
- Company art is generic scene art mapped to invented companies, not company-specific illustrations.
- The Parent is still one browser; no identity or consent is verified.
- A release needs a new scoped artifact gate and explicit owner approval. Rollback target stays `42900c64`, current `cb3a6ad5`.

## Three questions for 5 to 10 adults

1. In your own words, what does "My Key" do? (comprehension)
2. After the story, what happened to the 25-credit choice, and why? (recall)
3. Would you do this with your own child this week, and what would make you come back? (willingness to return)

Tasks to give them: start with no help and reach a Parent decision; find your child's goal on the Parent page; find out why a request expired after changing the Key.
