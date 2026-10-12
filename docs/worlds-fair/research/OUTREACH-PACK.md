# CRESCO Discovery Outreach Pack

Date: 2026-09-26  
Status: READY TO SEND — NOT YET SENT

## Rule

Do not pitch CRESCO first.

Goal: recover the last real boundary event and the authority object issued after it.

## Priority 1 — Eric Lovold / Sanction

Public contact:
- [contact redacted]
- https://www.linkedin.com/in/ericlovold
- https://github.com/ericlovold/sanction

### Short email / DM

Subject: Quick research question on one-use grants for AI agents

Hi Eric — I’m researching a narrow authorization problem around autonomous agents: what should happen after a legitimate action crosses standing policy.

I’ve been reading Sanction’s public implementation, especially the escalation → human approval → one-use grant flow. It’s one of the closest systems I’ve found to the problem I’m studying.

I’m not looking to pitch you. I’d love to understand a few design choices from real usage: why one-use grants rather than temporary sessions, what happens when policy changes after approval but before redemption, and whether users care about the exact policy rule/delta behind an escalation.

Would you be open to a 15-minute conversation? I’m happy to share the research afterward.

— Faadil

### Questions

Use the questions in `research/SANCTION-DELTA.md`.

## Priority 2 — Session.money / LazorKit builders

Public surface:
- https://www.session.money/

### DM

Hi — I’m researching how agentic wallets should handle actions that fall outside normal authority.

I’m specifically interested in the product choice Session.money made: the agent asks for a bounded session (duration + cap + scope), rather than asking the human to approve one exact transaction.

I’m not pitching a competing wallet — I’m trying to understand the real behavior that led to that design. Could I ask you about the last cases where an agent needed more authority than it already had, and why a session worked better than exact-action approvals?

15 minutes would be enough, and I’m happy to share the resulting research.

— Faadil

### Questions
- What real workflow led to `duration + cap + scope`?
- How frequently do sessions get requested?
- Do users ever want exactly one action instead?
- How do you handle a session that was approved and then the user changes wallet/security policy?
- What is the common session duration/cap pattern?
- What is the biggest complaint about session approval?
- Why not a standing policy + exact exception model?

## Priority 3 — Squads / MetaDAO treasury operators

Reference:
- Squads powers 250+ teams according to public docs.
- MetaDAO public code configures monthly spending limits.

### DM

Hi — I’m researching a treasury-ops workflow rather than another multisig product.

I’m trying to understand what teams actually do when a legitimate transaction falls outside an existing Squads Spending Limit.

Could I ask you about the last real example: whether you created a normal proposal, temporarily changed the limit, permanently changed it, or used another workaround — and what happened to that extra authority afterward?

I’d prefer to understand the current workflow before showing any solution. 15 minutes would be enough.

— Faadil

### Questions
- Last legitimate transaction above a Spending Limit?
- Why was it outside the limit?
- Proposal or limit change?
- Temporary or permanent?
- Who approved?
- Time cost?
- Did the authority remain afterward?
- Could an existing proposal survive a later security/configuration change?
- What evidence is needed for finance/audit?
- Would explicit “exception delta vs standing authority” help?

## Priority 4 — Delegated Trading / Market Makers

Targets:
- Flint Labs / Ergonia
- Ellipsis Labs / Phoenix ecosystem
- Solana market-making / quant operators

### DM

Hi — I’m researching how trading teams handle legitimate orders that get blocked by pre-trade risk controls.

I’m particularly interested in the override itself: whether the team approves one exact trade, temporarily opens a risk envelope, changes the standing limit, or simply abandons the opportunity.

I’m not selling risk software — I’m trying to understand the real workflow before deciding what to build. Would you be open to a 15-minute conversation about the last boundary event your desk encountered?

— Faadil

### Questions
- Last legitimate blocked order?
- Which risk control fired?
- Modify order / override / change limit / abandon?
- Exact trade or temporary risk envelope?
- Human or automated risk approval?
- Acceptable latency?
- What if risk policy changes after override approval?
- Does the current OMS/EMS leave any meaningful gap?
- Would onchain atomic override + execution matter?

## Evidence standard

An outreach response is not validation unless it yields:
- a concrete recent event;
- existing policy;
- boundary;
- actual workaround;
- frequency;
- impact;
- exception shape;
- stale-policy expectation;
- integration/pull signal.

Use `research/INTERVIEW-TEMPLATE.md` for every completed conversation.
