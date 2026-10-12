# Discovery Interview Log Template

Use one copy per interview.

## Metadata

- Date:
- Lane: TREASURY / AGENT_BUILDER / DELEGATED_TRADING / FAMILY / OTHER
- Participant:
- Role:
- Organization / project:
- Public/private:
- Interviewer:
- Permission to quote: YES / NO / ANONYMOUS_ONLY

## 1. Recent concrete boundary event

Primary question:

> Tell me about the last time a legitimate action hit a spending, risk, permission, or approval boundary. What happened next?

Record:
- standing rule/policy:
- requested action:
- why it was legitimate:
- why it crossed the boundary:
- date / recency:
- frequency of similar events:

## 2. Existing workaround

What happened next?
- DECLINE
- EXACT ACTION APPROVAL
- PARAMETRIC TEMPORARY INCREASE
- SCOPED SESSION
- FULL CO-SIGN / PROPOSAL
- PERMANENT POLICY CHANGE
- OTHER

Details:
- approver:
- approval channel:
- latency:
- was standing authority modified:
- if yes, was it reverted:
- who had to remember to revert it:
- audit evidence retained:

## 3. Mutation / replay

Ask:
- Did the action change after it was approved?
- Could recipient / amount / asset / venue / parameters change?
- Could the approval be reused?
- Has a stale approval ever caused confusion or risk?

Record:

## 4. Stale-policy semantics

Scenario:

> An exception was approved under policy v7. Before execution, standing policy changes to v8. Should the old exception still work?

Participant answer:
- always stale;
- survives if unrelated fields changed;
- survives if v8 is broader;
- re-evaluate against v8;
- issuer chooses semantics;
- other.

Why:

## 5. Exception Shape Test

Only after the real workflow is understood, ask which object best matches the need:

A. This exact action once.
B. Up to X / destination Y / until time T.
C. A scoped session with multiple actions.
D. A co-signed exact transaction.
E. Permanently change the standing policy.
F. None / current workflow is fine.

Preference:
Reason:

## 6. Policy Diff value

Show only after behavior questions:

> Would it help if the approval explicitly showed which parts of the standing policy this action violates, and exactly what extra authority is being granted?

Record:
- useful / not useful:
- why:
- who would consume that evidence:
- compliance / audit / UX / debugging / no value:

## 7. Economic / operational impact

- delay caused:
- missed opportunity:
- manual work:
- financial risk:
- compliance/audit risk:
- approval fatigue:
- incident history:
- approximate frequency:

## 8. Existing products

- wallet / treasury / OMS / risk system:
- what works:
- what does not:
- workaround tooling:
- incumbent feature that would eliminate the need:

## 9. Pull test

Do not ask “would you pay?”

Ask:
- Would you try a sandbox / Devnet flow with your own policy?
- Would you introduce us to the person who owns this workflow?
- Would you share an anonymized example?
- What would have to be true before you integrate it?

Answer:

## 10. Interview classification

- Real boundary problem: PASS / FAIL / UNCLEAR
- Recurring: YES / NO / UNKNOWN
- Workaround pain: HIGH / MEDIUM / LOW
- Exception shape:
- Decision lattice observed: YES / NO
- Policy Diff value: HIGH / MEDIUM / LOW / NONE
- Competitive residual: YES / NO / UNKNOWN
- Native advantage: YES / NO / UNKNOWN
- Pull: STRONG / WEAK / NONE

## 11. Evidence status

- FACT — directly observed/reported concrete event
- CLAIM — participant assertion not independently verified
- INFERENCE — analyst interpretation
- HYPOTHESIS — needs further testing

## 12. Consequence

- supports lane:
- weakens lane:
- PRD change required:
- follow-up:
