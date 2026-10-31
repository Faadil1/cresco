# Cresco Family V3 — moderated story-comprehension pilot (NOT YET RUN)

**Purpose:** Check whether the narrative feels like a *story the family can explain*, not just seven functioning routes. This is a proposed protocol, **not field results**, recruitment, a live release approval, or proof that real families have tested V3.

## Field-ready operational material

- **[Guide animateur en français (PowerShell/local-only, six tâches, consentement et questions)](FIELD_TEST_KIT_FR.md)**.
- **[Modèle CSV vide et anonyme](SESSION_OBSERVATIONS_TEMPLATE.csv)** : télécharger et renseigner en local uniquement; **ne jamais committer les données des participants**, même si elles semblent anonymes.
- Test delivery is currently **one local computer, one browser tab**. **There is no public V3 URL**; the public V2 must not be used as a substitute. No Cloudflare Access, private invitations, deployment or remote testing infrastructure is required or authorized by this guide.
- The V3 interface is currently **English**. For the first comprehension pilot, select people comfortable reading English and record language friction separately. A French-language product study is a different question.
- The optional invitation text in the field guide is **draft only**, not outreach already sent. **0 sessions have occurred.**

## Release and safety boundary

- Pilot only on an owner-controlled **local Family-only build** after passing its exact-commit browser tests. No V3 public Cloudflare publication, merge, historical Worker change, or use of the SHA-pinned V2 release scripts.
- One simulated browser state, not two authenticated accounts or two-device guardian approval. Everything is fiction and practice credits, **no real investment, purchase, wallet, or child account**. A refresh resets progress; test the main story without reloading.
- For any child participant, get the accompanying adult's explicit permission and the child's willingness first. Allow skipping and stopping with no explanation. Never ask for names, age, contact details, finances, identity documents, screenshots of personal accounts, or investment history.
- Prefer **notes about interface behavior**, not recordings. If an adult independently offers a recording, request separate informed permission; otherwise do not record. Do not store identifiable child information in GitHub/CI/logs. Use anonymous labels such as P01 and broad observations only.
- If local in-person or guided screen-share testing is impractical, do not claim the public V2 represents this V3. Mark pilot *not run* until a controlled tester-access method receives separate owner approval.

## Who and how

Start with 5 adult–child pairs if available (exploratory, not a representative sample). A parent may play both perspectives for a dry run, but log that separately and **never** count it as a child test. Facilitator observes; don't demonstrate the relevant controls first. Target 12–18 minutes per pair. Browser: note simulated iPhone/desktop and if device was physical; note that simulator ≠ physical phone.

### Opening script (read before the task)

> This is an unfinished learning story about imaginary businesses. All credits and approvals are pretend; nothing is bought or stored in an account. We are testing whether the screens explain the idea, not how good you are at money questions. You may stop or skip anything. We will write down only what works or confuses you, without personal details. Is it okay to continue?

Ask the accompanying adult for permission and the child for assent before continuing.

### Tasks, in order (observe without leading)

| # | Participant | Prompt / action | Observable evidence |
|---|---|---|---|
| 1 | Child | Start the story and choose a saving dream that matters to you. | Can find 3 illustrated goals and choose one without help; knows the goal influences later steps. |
| 2 | Child | Open one lesson and tell me what it helps you understand. | Can navigate lesson without confusing education with spending permission. |
| 3 | Child | Open **Neighborhood Markets**. Read Mina's situation and choose a response. | Can find first response with minimal/no scroll; explains why more customers might still mean less profit. |
| 4 | Child | Try a practice choice bigger than My Key allows (25 versus 15 credits). | Predicts it needs a simulated Parent; understands this did not buy anything. |
| 5 | Adult (same browser) | Take the Parent's turn and decide the exact one-time request, without changing the standing Key. | Sees Child's goal and their reason, understands single-use approval/decline, sees immediate outcome. |
| 6 | Child then together | Return to the result and discuss Mina and what could change the answer. | Child recalls the character, explains the actual result, suggests another fact to check; parent can discuss without facilitator. |

Try a declined request on a **separate reset session** only if there is time, not at the expense of the full first journey.

### Five questions asked *without showing the screen*

1. Who was Mina and what problem did her family face?
2. Why might a store with more customers make **less** profit?
3. What did My Key let you do by yourself, and what required your Parent?
4. What happened to the 25-credit practice choice, exactly? Did any real money move?
5. What would you want to explore together next? Would you voluntarily continue later, and why?

Do not give participants the answer in the question follow-up or 'correct' their words before notes are made.

## Recording template (anonymous; one row per task/observation)

| Session | Device | Task | Unprompted outcome | Needed help? | Friction and exact UI element | Verbatim quote (only with permission) | Severity | Proposed change |
|---|---|---|---|---|---|---|---|---|
| P01 | simulated iPhone | 3 | not yet tested | n/a | n/a | n/a | n/a | n/a |

Codes: **0 = couldn't explain/do; 1 = partial or prompted; 2 = unprompted and accurate**. Record *actual* task observations separately from comprehension scores. For severity, use **blocker** (can't progress), **major** (wrong understanding of money/permission), **minor** (hesitation/wording), or **cosmetic** (visual only). Keep all empty until real tests.

## Exploratory success / hold criteria

- **Safety blocker:** *any* tester thinks real assets were purchased, approval comes from a verified legal guardian, or practice is financial advice → **HOLD** and repair copy/flow before release.
- **Narrative blocker:** repeated inability to find Mina's first answer, or users remember a company/chart but not the character/problem → **HOLD** and revise first-screen story.
- **Initial directional benchmark (not statistical):** at least 4 of 5 pairs independently recount Mina + the cost-versus-sales dilemma, and 4 of 5 understand the single-use Parent decision. Do not describe this as measured until observed.
- Report completion, confusion and meaningful quotes with limits. Do not substitute CI or screenshots for human evidence. No retention claim: hard refresh loses the entire story.

## Decision log

- **2026-10-31:** Protocol prepared on draft PR #119. **0 external family sessions completed**; recruitment, physical-device checks, and human comprehension remain unverified.
- Post-fix first-fold captures and automated browser assertions verify *layout*, not whether a child follows the narrative.
- Next owner decision after results: adjust story/scene, preserve anonymous ephemerality vs opt-in progress persistence, and decide on a separately gated V3 tester release. No deployment is authorized by this document.
