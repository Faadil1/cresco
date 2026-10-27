# CRESCO — Customer Evidence & Early Access (candidate v1)

**Status:** DRAFT / ADDITIVE / NOT ACTIVATED ON MAIN. Research operations, not a launch, customer count, change to authorization, or new global lifecycle stage. First cohort has **not** yet been recruited or tested under this protocol.

## Why this exists

CRESCO has Solana Devnet product and technical proofs, plus an existing [10–15 minute usability test kit](../worlds-fair/USER-TEST-KIT-2026-10-12.md). These do not establish demand, repeat adoption, or willingness to pay. This lane takes a documented problem hypothesis through qualified real-user interviews, observed tasks, retests, and a defensible decision about value.

**One product thesis, two independent buyer hypotheses:**

- **Family (first research priority, not yet a proven commercial wedge):** parents provide progressively bounded autonomy for a young person. The "exactly once, without widening the Key" promise must be understood and valued in authentic situations.
- **Delegated capital / agent authority (separate learning cohort):** allocator / risk owner and actual operator face different economics, legal/operational requirements and work. Do not pool the two samples or infer one market from the other.

Solana ecosystem specialists (including invited Superteam feedback) are an **expert-review channel**, not substitutes for parents, users, buyers or real capital operators. A hackathon ranking, a working demo, or one expert's praise is not customer traction.

## Start here

| Document | Decision it supports |
| --- | --- |
| [REFERENCE-ADOPTION.md](REFERENCE-ADOPTION.md) | Source provenance, bounded application, conflicts and non-authority |
| [FAMILY-PROMISE-CARD.md](FAMILY-PROMISE-CARD.md) | Who, job, alternative, credible value, and falsifiable thesis |
| [SUPERTEAM-FEEDBACK.md](SUPERTEAM-FEEDBACK.md) | Prepare the offered 30-minute expert-feedback session; capture expert signals separately |
| [COHORT-AND-DISCOVERY.md](COHORT-AND-DISCOVERY.md) | Recruit relevant consenting adults, collect recent job episodes, identify counterexamples |
| [OBSERVE-RETEST.md](OBSERVE-RETEST.md) | Observe existing Family tasks in the correct version, detect help, retest safely |
| [EVIDENCE-FORMS.md](EVIDENCE-FORMS.md) | Promise, cohort/access, episode, observation, decision and value-review working forms |
| [CUSTOMER-VALUE-GATE.md](CUSTOMER-VALUE-GATE.md) | Explicit go/retest/reframe/pause decision, proof ladder, stop conditions |
| [30-DAY-CYCLE.md](30-DAY-CYCLE.md) | First bounded execution cycle with owners/checks, not prefilled results |

## Protect the existing source of truth

1. Technical authority and code truth remain in [product/PRD.md](../../product/PRD.md), [World's Fair living PRD](../worlds-fair/product/PRD.md), [Reality Ledger](../worlds-fair/governance/REALITY-LEDGER.md) and `state/CURRENT.yaml` / `state/HANDOVER.yaml`.
2. Reuse [USER-TEST-KIT-2026-10-12.md](../worlds-fair/USER-TEST-KIT-2026-10-12.md) for the original A/B/C screens, task steps, baseline comprehension and test form; this extension adds **participant fit, last real episode, follow-up and demand evidence**, not another incompatible usability questionnaire.
3. The current public host's **active commit must be independently verified** before inviting testers. A green CI job or previously verified Devnet transaction does not prove the deployed UI is at that commit.
4. Do **not** merge or treat unmerged #77/#78/#79 V1 Solana work as public functionality. Do not change historical Colosseum pitch, submissions, judge routes, production config, public main, or funds as part of this research PR.
5. Preserve the existing `QUALIFY → DECIDE → DESIGN → DELIVER → AUDIT → EXPAND` lifecycle and existing product-reality, security, privacy, technical gates. **Customer Value Gate** is a local check under AUDIT/EXPAND and has no independent permission to promote, deploy, invite or spend.

## Minimal truthful status

| Claim | Status at creation | What would change it |
| --- | --- | --- |
| Existing code and Devnet execution evidence | OBSERVED / existing evidence only | Exact version and receipts from existing ledgers |
| Real parents' recent boundary-management problems | UNKNOWN | Consented episode records from relevant adults |
| Superteam feedback session offered | OBSERVED / invitation screenshot seen privately | Scheduled/attended only upon actual confirmation |
| Superteam expert feedback received in a session | UNKNOWN | Actual dated session notes and consented summary |
| Family first-value task with target users | NOT STARTED | Actual observed task and unambiguous version |
| Repeat use / monetary commitment | NOT PROVEN | Documented repeated need and concrete actions |
| Safe onboarding for minors or real funds | BLOCKED | Separate privacy, legal, technical and consent approvals |

**Privacy default:** Public GitHub holds methods, empty templates and aggregated, permission-cleared findings only. Keep names, contact details, recordings, links with role tokens, wallet secrets, minors' data, private family stories and raw transcripts off this repository. Do not publish unapproved expert quotes or the Telegram screenshots.

## Release boundary

A public hosted test, a Devnet trade, a contact invitation, an email send, a new account, a change to the app, a new automation or a release requires its own separate authorized and verified workflow. This folder authorizes none of them.
