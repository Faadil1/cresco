# Sanction Interview Brief — Eric Lovold

Date prepared: 2026-09-28  
Status: SCHEDULING  
Planned duration: 15 minutes  
Evidence type: FOUNDER / COMPETITOR / EXPERT DISCOVERY — NOT CUSTOMER VALIDATION

## Why this call matters

Sanction is the closest public reconstruction found for the generic Agentic Authority lane.

Its public implementation already covers:
- standing policy;
- approve / escalate / deny;
- human approval;
- one-use exact grants;
- changed-field mismatch refusal;
- immutable policy revisions;
- exact evaluated context;
- replayable evidence.

CRESCO therefore cannot survive in the Agent lane on those semantics alone.

The remaining questions are narrower:
- what should happen between approval and execution;
- whether a grant should become stale after standing-policy change;
- whether "one attempt" vs completed execution matters;
- whether users need explicit violated-policy delta;
- whether enforcement at the capital/execution path matters.

## Evidence boundary

Eric explicitly stated:
- Sanction is still early;
- he can share design decisions;
- he can share learnings from testing;
- he cannot yet provide established user-pattern evidence.

Therefore:
- do not update REAL_USER / WTP / ADOPTION from this call alone;
- do not count founder preference as customer behavior;
- classify each answer as DESIGN_DECISION / TESTING_SIGNAL / USER_REPORT / INFERENCE.

## 15-minute structure

### 0:00–1:00 — Context

Keep CRESCO explanation minimal.

Suggested framing:

> I’m trying to understand the authority object that exists after an autonomous action crosses standing policy, especially what should happen between human approval and actual execution.

Do not pitch the full product.

### 1:00–4:00 — Why one-use grant?

Primary question:

> What led you to a one-use exact grant rather than a short-lived session or temporary policy envelope?

Follow-ups only if needed:
- Was this driven by a specific test/failure?
- Which fields matter enough to force exact retry?
- What have you learned when the request changes after approval?

Goal:
Understand exception-shape reasoning.

### 4:00–7:00 — Approval → execution gap

Primary question:

> You mentioned the approval-to-execution gap is something you’re examining. What failure modes are you most concerned about there?

Then:

> If a grant is approved under policy revision N and the standing policy changes before redemption, what do you think should happen?

Separate:
- current implementation;
- intended semantics;
- unresolved design.

Goal:
Test stale-policy importance without assuming CRESCO’s answer is correct.

### 7:00–10:00 — Attempt vs completion

Primary question:

> Sanction documents a grant as authorizing one attempt, not proving downstream completion. Was that mainly a deliberate product decision or a consequence of operating across external tools/providers?

Then:

> If the downstream action fails after grant consumption, what behavior would you ideally want?

Possible probes:
- restore grant?
- force new approval?
- inspect target first?
- execution-bound authorization?

Goal:
Test whether CRESCO’s atomic execute+consume difference has product value.

### 10:00–12:00 — Policy Diff / minimal authority

Primary question:

> When a request escalates, how much does the human need to know about exactly which policy dimensions were crossed?

Then:

> Is a decision code/remediation enough, or do you see value in explicitly representing the minimal authority delta being granted?

Do not describe Policy Diff as inherently better.

Goal:
Test whether CRESCO’s residual is valuable or over-designed.

### 12:00–14:00 — Enforcement boundary + gaps

Primary questions:

> Is an authorization plane enough for the users you’re testing with, or do they care about enforcement at the actual execution/capital path?

> What are the important things Sanction intentionally does not try to solve?

Goal:
Find white space and avoid building directly into Sanction’s roadmap.

### 14:00–15:00 — Close

Ask:
- Is there anyone else building agent/payment authorization you think I should speak with?
- May I send you the research synthesis afterward?
- Is there anything I misunderstood about Sanction’s semantics?

## Must-answer questions

If time is short, prioritize these five:

1. Why one-use exact grant vs scoped session / temporary envelope?
2. What should happen if standing policy changes after approval but before redemption?
3. What failure modes matter in the approval → execution gap?
4. Does "one attempt, not completion" create real operational pain or is it acceptable?
5. Do users/testers care about the exact violated-policy delta, or only approve/deny?

## Strong signals for CRESCO

These would strengthen a residual, but still require customer/operator validation:

- policy-change invalidation is materially important;
- external execution creates ambiguous authority-consumption outcomes;
- users want execution-bound or atomic authorization semantics;
- decision code alone is insufficient; humans need explicit scope/delta;
- recurring need exists for exception-to-policy without standing-policy mutation;
- Sanction intentionally avoids load-bearing execution enforcement.

## Weakening / kill signals

These would weaken generic Agentic CRESCO:

- exact grant + audit context is already sufficient;
- policy changes rarely occur during grant lifetime or need no invalidation;
- attempt-vs-completion ambiguity is operationally acceptable;
- users prefer scoped sessions;
- Policy Diff adds complexity without decision value;
- authorization-plane enforcement is enough;
- Sanction/Turnkey/Session.money already satisfy the practical workflow.

## Truth discipline after call

Do not write:
- "users need X" unless Eric reports real user/test behavior and we label it correctly;
- "Sanction cannot do X" unless confirmed by code/docs or Eric;
- "CRESCO is better" based on this call.

Write instead:
- OBSERVED — Eric says current implementation/design does X;
- TESTING_SIGNAL — testing surfaced Y;
- INFERRED — this may imply Z;
- UNKNOWN — requires operator/customer evidence.

## Immediate post-call actions

1. Fill `research/INTERVIEW-TEMPLATE.md`.
2. Update `research/OUTREACH-LOG.md`.
3. Update `research/SANCTION-DELTA.md`.
4. Re-evaluate Agent lane in `governance/GATEWAY-REGISTRY.yaml`.
5. Update PRD only if the evidence materially changes the thesis.
