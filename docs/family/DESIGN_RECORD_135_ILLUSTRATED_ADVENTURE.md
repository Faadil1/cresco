# Cresco Family: design decision record, illustrated adventure (issue #135)

Date: 2026-11-28. Status: **Home and Learn implemented, awaiting founder visual approval.** Explore, Portfolio and Parent have **not** been redesigned yet (on purpose: the founder asked to approve Home and Learn first).
Baseline: `0c775ea09a36bd9f8db0693c9afc8ed9bcc1fb31` on draft PR #127. No merge, no deploy.

## Reference
The founder supplied the five-screen concept board in the session chat. It could not be saved into the repository, so it is **not** committed; this record describes it in words. It was used as an art-direction reference only, not as a product spec or as data. Fidelity is judged by eye against the board, not by CI.

## Decisions
| # | Decision | Why |
|---|---|---|
| D1 | **Family-scoped tokens** in `globals.css` (`.cresco-family-app`): ivory `#fff9ec`, deep ink `#102d36`, forest `#147b56`, mint `#ddf5e8`, action violet `#5936c7`, soft lavender `#eee8fc`, sky `#dcebfa`, amber `#f6c76a` (fills only). The canonical site keeps its palette. | One visual language for every Family page without touching the canonical site. Ink, forest and violet each pass WCAG AA (4.5:1) on ivory and white. |
| D2 | **Nunito** (rounded, OFL-1.1) self-hosted through `@fontsource-variable/nunito`, loaded only in `/try`. | The board's rounded, friendly type. Bundled with the Worker: no font CDN, no runtime external request. |
| D3 | **Original SVG illustrations** in `illustrations/adventure.tsx`: the young explorer, the mountain landscape with a goal flag, three chapter landscapes (meadow, high street, peaks), chapter emblems and a new glass goal jar. All decorative art is `aria-hidden`; the jar keeps its real text alternative. | The board's warmth and the trail metaphor, drawn for Cresco. No third-party or copied assets, no external images. |
| D4 | **Home:** a violet illustrated welcome titled by the *actual* goal ("On the trail to your new bike"), the goal jar with the real saved/target and percentage, one next mission with one primary button, the five-step loop as a short trail, then credits and My Key. Desktop: full-width banner with the explorer, mission and goal cards overlapping its lower edge. | Matches the board's hero, jar and mission. No invented child name, avatar or notification bell. |
| D5 | **Learn:** one continuous illustrated trail in three chapter landscapes, a wooden-sign header per chapter, a winding dashed path, round stops (done = forest check, next = violet play with a soft pulse, open = number) and a label beside each stop. Desktop adds a sticky companion column: Up next with the landscape, plus "Why these lessons?" with the goal jar and per-chapter progress. | The board's adventure trail, with all 17 lessons and every stop open. The trail is still three ordered lists of real links, so keyboards and screen readers read it as a list. |
| D6 | **Shell:** the existing Cresco wordmark plus a small "Family" label. Violet active states in the side rail and bottom bar. Same five tabs (Home, Learn, Explore, Portfolio, Profile) and the same Parent switch. | The board's tabs replace Profile with Parent; #135 says to keep the existing navigation. |

## Deviations from the concept board (deliberate)
1. **English copy** throughout; the board is in French.
2. **No "Salut Alex", avatar, bell or notifications.** Home is titled by the chosen goal; nothing is invented about the child.
3. **No locked lessons ("Bientôt"), no "5 lessons" streak flame.** Every stop is open; progress is a plain count.
4. **Phones: mission before the goal jar.** The board shows the jar first. The existing acceptance tests (earlier founder rounds) require the mission button and the learning loop on the first iPhone screen, so the order on phones is welcome → mission → loop → goal jar. Desktop follows the board more closely (jar beside the mission).
5. **Tabs:** Profile stays; Parent stays behind the "Parent" switch.
6. **Trail order vs. "Up next":** the next lesson follows the goal's lesson path, which can sit in a later chapter (for the bike goal, chapter 3 "Practice with risk" comes before parts of chapter 2). This is unchanged behaviour; the board shows strictly sequential stops.
7. **Explore, Portfolio and Parent screens are not changed yet.** They pick up the new tokens and font only. The board's Costco photo, synthetic chart, "Cours de clôture" price and inconsistent paper valuation are **not** product behaviour and will not be copied.

## What did not change
Business logic, reducers, the 17 interactive lessons and their activities, objective-based completion, the blocked-buy recovery, both ledgers, simulated Parent safeguards (approve once, decline, stale), the DISABLED market-data snapshot, routes, allowlists, Workers and deploy configs. No network, storage, identity or analytics change.

## Evidence
`docs/family/ux-overhaul-2026-11-16/issue-135/before|after/` at 1440×900, 1280×800, 390×844 and 375×812 (Chromium, `deviceScaleFactor` 1, zoom 100%): fresh Home, fresh Learn, Home with a goal, a lesson, a finished lesson, Home and Learn after two lessons. `metrics.json` records page height and horizontal overflow (none). Script: `issue-135/capture-135.mjs`.
