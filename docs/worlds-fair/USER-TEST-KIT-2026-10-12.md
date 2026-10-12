# CRESCO user test, round 1

Goal: learn whether people **understand** CRESCO, can **move through it** alone, and **where they get stuck**. Whether the design is pretty is a side question.

This round produces usability and comprehension evidence. It is not customer validation and not willingness to pay. Supersedes the tasks in `EXTERNAL-TEST-PROTOCOL.md` (kept for provenance); the owner checklist there still applies.

## Who

- Benita plus 5 to 8 people. At least 3 who have never heard of CRESCO (strangers or friends of friends).
- Mix: 2 to 3 parents or people who manage money for someone, 2 to 3 people who trade or build with AI agents, the rest general.
- Each tester does **one track**, assigned in rotation so every track gets at least 2 people.

| Track | Start URL | For |
| --- | --- | --- |
| A. Family app | home page `/` | parents, general |
| B. Live family mandate | home page `/` | parents, crypto-curious |
| C. Delegated capital | home page `/` | traders, AI or agent builders |

Always send the **home page only**. Never send a workspace or role link: those carry private tokens.

## Before the round (owner)

- Release lock done: `RELEASE-LOCK-2026-10-12.md` all green.
- Tracks B and C create a Devnet workspace each. Check lab Devnet SOL and devUSDC, and the 25-workspace cap (`WORLD_FAIR_MAX_WORKSPACES`).
- Create the form: open https://script.google.com, new project, paste `user-test/create-google-form.gs`, run `createCrescoTestForm`, accept the permissions. The log prints the form link and the edit link. Responses go to a linked Google Sheet.

## The session (10 to 15 minutes)

Best: a video call or in person, tester shares the screen and **thinks aloud**. Fallback: the tester fills the form alone.

Moderator rules:
- Say: "We are testing the product, not you. Say out loud what you think and what you expect."
- Do not explain CRESCO, do not point at buttons. If someone is stuck for 60 seconds, note it, then give the smallest hint.
- Note the time per task and every hesitation.

### 0. First impression (all tracks)
Show the home page for **10 seconds**, then hide it.
- "What is CRESCO? Who is it for?"

### Track A, Family app
1. From the home page, get into the Family app as the teen.
2. Find how much the practice portfolio is worth.
3. Find a lesson to continue and open it.
4. Find out whether the prices are real.
5. Find what the parent controls.

### Track B, Live family mandate on Solana
1. From the home page, find the live family mandate on Solana and set it up with the default names and limit.
2. Create the mandate on Solana Devnet and wait until it is ready.
3. As the teen, invest $0.30. What happened?
4. As the teen, invest $0.75. What happened, and why?
5. As the parent, decide on the request. What changed, and what did not?
6. Find the proof of what happened (history, receipt).

### Track C, Delegated capital
Same steps as B with the Delegated capital setting: the strategy or AI agent acts, the allocator decides.

## What to measure

| Measure | How | Target for round 1 |
| --- | --- | --- |
| First impression correct | answer mentions a limit, acting alone, and asking once | 5 of 8 |
| Task success | done alone / with a hint / not done | 80% alone on each task |
| Ease per task | 1 to 7 (Single Ease Question) | median 5 or more |
| Core comprehension | two scored multiple-choice questions in the form | 6 of 8 both right |
| Blockers | where and why, with a screenshot | list every one |
| Overall usability | UMUX-Lite, 2 items, 1 to 7 | average 5 or more |

The two comprehension questions (correct answers in the script, not shown to testers):
- Why did the larger action need approval? → it was above the standing limit.
- After the approval, what is the limit? → unchanged.

## After the round

1. Export the Sheet. One row per tester, plus the moderator notes.
2. Group the blockers by screen. Rank them: blocks the task > slows it down > cosmetic.
3. Fix the top blockers first (`TARGETED_REWORK`), then re-test the same tasks with 3 new people.
4. Record the summary in `docs/worlds-fair/evidence/` as `USER-TEST-ROUND-1-<date>.md`, with counts, not adjectives. Quotes need the tester's permission.

## Privacy

- Collect a first name or alias only. No email unless they opt in to a follow-up.
- Screenshots: ask testers to hide anything personal.
- Eric Lovold's quote stays expert testimony, never a tester result.
