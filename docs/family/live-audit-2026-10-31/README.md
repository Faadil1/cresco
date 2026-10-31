# Cresco Family live audit and UX sprint (issue #116)

Audited: `https://cresco-family-open-test-web.faadil-casecraft.workers.dev` (Worker `cresco-family-open-test-web`, version `42900c64-0593-4b8f-8c7b-28152239f427`), 2026-10-31.
Method: read-only GETs, Playwright Chromium 1440x900 and WebKit iPhone 13, real clicks through the whole Child to Parent loop. No login, wallet, API or write request was made. No Worker was modified or deployed.

## Reality ledger (live, before this change)

| Status | Finding |
| --- | --- |
| Working | `/` and `/try` return 200 with the intended Family-only app; `/family`, `/invite`, `/wallet`, `/finance`, `/admin`, `/api/health` return 404; no console or network error on desktop. |
| Working | The practice rules are correct: inside Key buys directly, over Key is blocked, Parent approves once, the approval cannot be replayed. |
| Misleading | After a click, the only result is a status line at the very bottom of the page. Measured: not in the viewport after the blocked click, the approval, or the retry (desktop and iPhone). The click looks like it did nothing. |
| Misleading | The Child pre-fills 25 credits on a card while the 15-credit Key limit is only stated in a block at the bottom of Explore. The Child learns the limit by being blocked. |
| Missing | First screen on iPhone: the main button is clipped at the fold under two paragraphs; the hero card shows a hard-coded 80/20 and a "Not yet" pill that reads like a button; `/try` has no sign of where you are in the loop and no one-line explanation of what My Key is. |
| Missing | After a decline or an approval the Child has no place that says what happened and what to do next. |
| Minor, not fixed | `/manifest.webmanifest` returns 404 on WebKit (console noise only). Fixing it means touching the route guard, which is out of scope. |
| Blocked | Cloudflare read-only inventory with `wrangler` was not run in this session; route behaviour was verified over HTTP only. |

## Top three defects and what changed

1. **Outcome invisible.** The single status element is now a bar that stays at the bottom of the viewport after the first action, with a next action derived from state (not from the message): go to the Parent's request, use the approved exact choice, see my receipt, back to the Child to retry.
2. **Limit unknown until blocked.** Each practice card shows a forecast before the click (`previewPracticeChoice`, pure and read-only): inside My Key, over the limit, already sent, approved once, declined, used, insufficient credits. Explore and Home state the Key limit in one line.
3. **Not understandable in 15 seconds.** Landing: one-sentence idea, main button above the fold on iPhone, three numbered steps. `/try`: four-step loop tracker (save, choose, Parent decides if blocked, talk it through) and a "Your Key in one line" strip. Portfolio gains "Asks sent to my Parent" with plain consequences for pending, approved, declined, used and expired asks.

Nothing about authority changed: Parent remains simulated and nothing is verified; no network, wallet, storage or tracker was added.

## Evidence

`before-live/` are screenshots of the deployed Worker. `after-local/` are screenshots of the local build of this branch (`npm run build:public-family` served by `wrangler dev`), not of the public Worker.

Measured with `loop.mjs` (status visible in viewport after the action):

| Step | Live before (desktop / iPhone) | Local after (desktop / iPhone) |
| --- | --- | --- |
| Blocked click | no / no | yes / yes |
| After Approve | no / yes | yes / yes |
| After retry | no / no | yes / yes |

Tests (local): 145/145 unit (142 before, plus 3 for the forecast), WebKit 12/12 (8 existing, plus 4 new acceptance cases), `copy:lint`, `typecheck`, `lint` (one existing warning in `worlds-fair/desk`). The 4 new WebKit cases were run first against the live old build and all 4 failed.

## Not done

- No deployment. Redeploying `cresco-family-open-test-web` needs the founder's explicit approval; the rollback target is version `42900c64-0593-4b8f-8c7b-28152239f427`.
- The #115 release-prep script is pinned to `878fad8` and was not touched, so a new-version release path for the test Worker still has to be prepared and tested.
- `next build` of the full app was not run; the Family public build (`build:public-family` and its assertions) was.

## Three user test tasks

1. Without help, find out what My Key does and say it in one sentence.
2. As the Child, try to practice 25 credits of MKT, notice it needs a Parent, then act as the Parent and approve it once.
3. Back as the Child, finish the choice, then find your receipt and what happened to the ask.

Optional feedback: What was unclear in the first 15 seconds? Where did you hesitate? Would you do this with your own child, and why or why not?
