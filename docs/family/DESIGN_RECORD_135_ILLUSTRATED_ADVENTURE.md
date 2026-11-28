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

## Round 2 (2026-11-28): illustration depth and polish
Founder feedback: keep the palette, typography, desktop composition and illustrated trail; the illustrations needed more depth, personality and polish.

- **Lighting and depth:** every mountain has a lit face and a shadow face (light from the upper right), with snow caps, ridge lines and haze between layers. The sun has a glow; there are soft clouds and birds.
- **Foliage and ground:** two-tone pines with a lit edge, round trees in three canopy masses (one autumn variant), bushes with berries, rocks, flowers, grass tufts and ground shadows.
- **Explorer:** gradient clothes and skin, layered hair with a highlight, eyebrows, eyes with catch-lights, freckles, an open smile, a detailed backpack (pocket, buckle, rolled blanket), socks and boots. On Home the explorer stands on a small grassy knoll instead of floating.
- **Home landscape:** a second, nearer peak, a lake with ripples, a sandy trail with edges and pebbles, and a waving goal flag.
- **Chapter landscapes:**
  - Money basics: a river with ripples and a wooden bridge.
  - Companies and shares: a high street with a bakery (striped awning), a bike shop, a fruit stall, bunting, a lamp post and a cobbled street.
  - Risk and choices: lit peaks with a flag, a tent, a campfire and a lake.
  - All three are anchored to the top, so the landmark is always visible, and the scenery continues down without hard edges.
- **Trail and stops:** a sandy path with an edge, a centre line of pebbles and a soft shadow. Stops are glossy, with a top highlight and a pressed-button shadow. Chapter headers are wooden signs on a post, and each chapter's progress chip sits under its description.
- **Goal jar:** glass gradient, rim, a liquid surface and bubbles, coins with a sheen, and a lid with ridges.
- **Phones:**
  - The welcome text is kept above a fixed landscape band, with a soft text shadow, so white text never sits on light green.
  - The mission button and the learning loop still fit on the first iPhone screen, as required by test A2.

Still original SVG, still no external assets, and decorative art is still hidden from screen readers.

## Windows local review (founder's PC)
Run in PowerShell. Use these direct steps: the pinned V3 pilot launcher (`family-v3-local-pilot.ps1`) refuses this candidate by design (see PR #127), and its pinned commit is unchanged.
```
git fetch origin claude/family-ux-overhaul-2026-11-16
git checkout claude/family-ux-overhaul-2026-11-16
git pull --ff-only
git log -1 --format=%H
cd apps\web
npm.cmd ci --no-audit --no-fund
npm.cmd run build:public-family
npm.cmd run start:vinext -- --ip 127.0.0.1 --port 3100
```
Then open http://127.0.0.1:3100/try/home and http://127.0.0.1:3100/try/learn. State lives in memory, so a refresh starts a new family.
- **Phone view:** use Edge DevTools device mode (iPhone 12 Pro, 390×844).
- **Goal and progress:** to see Home with a goal and progress, start at http://127.0.0.1:3100/try, choose a goal and finish a lesson.
