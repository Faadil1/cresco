# CRESCO — observe authentic work, improve, retest

**Existing test source:** [World's Fair USER-TEST-KIT-2026-10-12](../worlds-fair/USER-TEST-KIT-2026-10-12.md). Reuse that kit's Tracks A/B/C, tasks, form and comprehension criteria. This protocol adds before/after evidence, qualified job context, privacy and a decision receipt; it does **not** supersede the existing kit.

## Preflight: no product exposure without explicit review

Before inviting a tester, the owner must verify and record:

- Public home page URL and deployed commit/version readback; product entry may differ from the draft GitHub HEAD.
- Which surface is being tested: **Track A** Family app (/start, child/parent demo sessions), **Track B** World's Fair live Family mandate (/worlds-fair/desk?case=family), **Track C** Delegated capital. Do not interchange session systems.
- Devnet-only demo assets and no real funds. Tracks B/C need validated lab balance, available room under the **25-workspace default cap** and safe workspace isolation. Absent capacity/credentials => block session, do not bypass or silently increase.
- No workspace links or role tokens sent publicly. Share only the verified home URL; control all session/role access privately, and ensure participants understand demo roles.
- No tests relying on unmerged V1 #77/#78/#79, pending Pyth-positive, ATA or other unsupported functionality as if it were in the hosted version.
- No automated live workflow or externally triggered trade; owner authorization required for any actual Devnet mutation beyond approved bounded user-test setup.
- No recordings or photographs without separate affirmative consent; pseudonymous notes only.

## Observe the actual task (adult first round)

Use a participant's **recent actual episode** to set context; do not invent a need. If no authentic test is safe or available, observe the participant handling the existing process and mark CRESCO demonstration separately as **SIMULATED task**.

For the live Family mandate Track B, a typical bounded **illustrative** scenario from the existing kit is:

1. The adult acting as guardian discovers and creates the mandate on Devnet (or observe setup refusal if unavailable).
2. As the delegate, make a small in-bounds **demo-token** action. Did the interface explain why it went through?
3. Attempt an out-of-bounds **demo-token** action. Explain the refusal before offering a hint.
4. As the guardian, choose whether to approve one exact request. Ask what was and was not permanently changed.
5. Check history and evidence, then attempt pause + another demo action only if the approved tested build and current kit support it.

Track A remains its existing Family-app tasks; do not present practice activity as investment execution. Delegated capital Track C uses its own principal/operator terminology and is scored in a different cohort.

## Moderator protocol

- Start without describing buttons. Ask: "What do you think this lets you do?"
- Time each step; log completion **unassisted / with a hint / failed / unable to try**.
- If help is supplied, record the exact moment and content of the hint. Never turn a founder-assisted pass into independent success.
- Record errors, unexpected authority, accessibility issues, waiting/timeout and UNKNOWN/PENDING presentation as observed.
- After the task: "What do you believe your limit is now?" and "What would you do if this were a real recurring situation?"
- Record participant report, screen observation, backend/Devnet receipt, and researcher inference **in separate fields**. A successful transaction and the user's understanding are different evidence types.
- If safety or identity ambiguity appears, stop and record BLOCKED rather than forcing a success.

## Observation Record — required minimum

- Session alias and consent code (stored privately)
- Research lane, qualified episode reference and cohort selection method
- Observed date, exact public URL / build commit / Track A,B,C, role and environment
- Task stated before test; baseline current alternative if known
- Start/end time, outcome, time-to-first-value, hints/time used
- What person said vs what was visually observed vs external receipt/signature
- Unexpected error or genuine negative event; user impact and safe recovery
- Alternative explanation (at least one): unclear copy vs wrong user / missing data / broken RPC / help bias / unauthorized test
- Re-contact consent and next action owner/date
- Evidence label: `LIVE` / `LOCAL` / `LOCAL_STUB` / `PRESEEDED` / `SIMULATED` / `PARTIAL` / `NOT_IMPLEMENTED`
- Truth label: `OBSERVED` / `INFERRED` / `UNKNOWN`

Use [EVIDENCE-FORMS.md](EVIDENCE-FORMS.md) for blank records. Store raw session traces privately; only permitted, de-identified summary can enter GitHub.

## Improve/retest loop

1. Name a concrete observed failure and its impact, preserving it even if later fixed.
2. Write **two competing explanations**, including an option to change nothing.
3. Choose an explicitly bounded change with expected impact and what would falsify it.
4. Implement via the existing product branch/PR and normal CI, regression and release gates. No research note can directly authorize a merge or deploy.
5. Repeat the **same job and measurement** under a recorded new version, ideally with several new qualified participants and one returning participant when appropriate.
6. Compare **task success and amount of help**; don't call a 2-person difference a statistical uplift.
7. Review repeat need/repeat participation, support effort and trust before another expansion.

The existing kit's provisional **80% unassisted per task / median SEQ ≥5 / correct core understanding** are usability review targets for its small round, **not product-market-fit thresholds**. Report numerators/denominators and missing observations.
