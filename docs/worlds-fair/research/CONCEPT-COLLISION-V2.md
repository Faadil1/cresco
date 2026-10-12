# Concept Collision v2 — Evidence-Weighted, Pre-Concept-Lock

Date: 2026-09-26  
Status: PRE-CONCEPT-LOCK  
Build authorized: NO

## Purpose

Use all evidence gathered so far to narrow the surviving company directions without silently converting research confidence into Concept Lock.

This is not a scorecard of abstract attractiveness. It asks:

> Which direction currently has the strongest combination of real problem shape, recurring boundary events, Solana-native enforcement value, competitive residual, and killer-demo potential?

## New evidence incorporated

### Trading infrastructure
- FIX risk-limit standards support multiple simultaneous limits and explicit actions after breaches.
- Modern OMS/RMS vendors such as TRAFiX allow permissioned users to change account/trader/destination/firm risk limits intraday in real time.
- Regulatory rules require exceptional, temporary, risk-verified overrides for specific blocked trades.

Interpretation:
- “dynamic risk controls” are commodity;
- “change a limit in real time” is commodity;
- the potential residual is the **exception object and its lifecycle**, not the risk rule itself.

### Organizational spend
Ramp supports temporary limit increases with automatic reset. Public user behavior shows demand for custom-duration temporary authority.

Interpretation:
- exact-action approval is not universally preferred;
- temporary parametric envelopes are a real exception shape;
- “exception must not become permanent policy” is real, but card platforms already understand it.

### Agentic authorization
Sanction already provides one-use exact grants, mismatch refusal, immutable policy revisions, decision evidence and human escalation.
Session.money provides scoped, onchain spending sessions.

Interpretation:
- generic Agentic Authority is heavily reconstructed by existing systems;
- only narrower residuals survive: stale-policy semantics, atomic exception+capital execution, complete Policy Diff/minimal delta, trusted semantics, vertical-specific workflows.

## Collision result

### 1. Delegated Trading / Capital Mandates

**Current status: LEADING EVIDENCE LANE — NOT LOCKED**

Why it remains strong:
- the problem shape is explicitly real in mature trading systems;
- exact/temporary override behavior is operationally necessary;
- CRESCO already has capital-path enforcement, Pyth, notional checks, versioned authority and atomic onchain execution;
- Solana provides a natural execution substrate rather than a decorative audit log;
- the killer demo can show autonomous in-bounds execution, hard risk refusal, exceptional authority, atomic execution and stale/replay refusal.

What is already commodity:
- pre-trade risk checks;
- intraday limit changes;
- hard/soft controls;
- kill switches;
- multi-dimensional risk limits;
- human/admin overrides.

The surviving residual must be:

```
Standing capital mandate vN
→ trade proposal
→ complete violated-risk diff
→ exceptional capability
→ atomic trade + consume
→ standing mandate unchanged
→ explicit stale semantics if mandate changes
```

Primary kill questions:
1. Do real trading teams already have this exact override lifecycle in their OMS/RMS?
2. Is human approval latency incompatible with valuable opportunities?
3. Do they want exact trade authorization or a temporary risk envelope?
4. Is onchain atomicity materially valuable compared with current risk infrastructure?
5. Can an allocator/trader workflow exist without creating custody/broker-dealer claims?

### 2. Treasury Intent / Authority

**Current status: SECONDARY HIGH-VALUE LANE — NOT LOCKED**

Strengths:
- high-consequence capital;
- recurring delegated authority already proven via Squads Spending Limits;
- strong audit/security value;
- easier human approval latency than high-speed trading;
- atomic onchain execution can matter.

Weaknesses:
- Squads/Safe already reconstruct large parts of the decision lattice;
- exact proposals are mature;
- temporary standing authority may be sufficient;
- independent semantic verification may be needed for UI-compromise scenarios.

Surviving residual:

```
standing treasury authority
→ transaction outside policy
→ semantic/policy diff
→ exact or bounded exception
→ trusted representation
→ atomic execution
→ unchanged standing authority
```

Primary kill question:
Do operators actually need explicit exception lineage beyond ordinary proposal + spending limit workflows?

### 3. Agentic Financial Authority

**Current status: HIGH COMPETITIVE RISK / CONDITIONAL**

Sanction + Session.money + Turnkey + SDP already cover:
- standing budgets;
- policy evaluation;
- escalation;
- human approvals;
- exact one-use grants;
- scoped sessions;
- mismatch refusal;
- policy revisions;
- replayable evidence.

Possible remaining residuals:
- stale-policy invalidation at grant redemption;
- atomic grant + onchain capital execution;
- complete Policy Diff/minimal exceptional delta;
- capital-path enforcement rather than cooperative authorization;
- vertical-specific semantics.

Kill threshold:
If direct discovery shows these residuals are not important, remove Agentic as a lead wedge and keep agents only as a delegate type supported later.

### 4. Family Progressive Agency

**Current status: UX / HUMAN-COMPREHENSION REFERENCE + CONDITIONAL PRODUCT LANE**

Strength:
No other lane explains principal/delegate/boundary/exception/evolution as intuitively.

Weaknesses:
- commercial willingness to pay unproven;
- Solana-native advantage weak;
- minors/securities/custody complexity;
- Apple/Google/family-finance incumbents already understand approval semantics.

Do not kill until direct family discovery occurs, but do not let it anchor the company by inertia.

### 5. Organizational Spend

**Current status: STRONG ANALOGUE / WEAK WORLD’S FAIR WEDGE**

Public behavior validates:
- temporary authority;
- explicit expiry;
- rollback problems;
- audit evidence.

But blockchain-native advantage remains weak.

Use this lane to learn exception shape, not as the current World’s Fair default.

## Strongest cross-lane residual

The strongest surviving cross-lane product hypothesis is no longer “Allow Once.”

It is:

> **State-aware exceptional authority that can be issued without mutating standing authority, with explicit semantics for what changed, when the exception becomes stale, and whether authority consumption settles atomically with execution.**

Breakdown:

### Policy Diff
What exact dimensions of standing authority were crossed?

### Exception Shape
Exact action, temporary envelope, scoped session, or another bounded capability?

### Stale Semantics
What happens if standing policy changes before the exception executes?

### Atomicity
Does consuming authority and executing the governed capital action settle together?

### Post-State Proof
What authority remains after the exception?

## World’s Fair concept candidates surviving this collision

### Candidate T1 — Delegated Capital Mandates

Principal allocates capital to a strategy/trader/bot under an onchain Mandate.

Standing controls can include:
- assets;
- venues/programs;
- order/trade size;
- exposure;
- price deviation;
- slippage;
- daily loss/drawdown;
- frequency;
- expiry.

Boundary:
- hard refuse;
- exact exceptional trade;
- temporary bounded risk envelope;
- explicit mandate revision.

### Candidate T2 — Treasury Intent Firewall

Treasury delegates ordinary ops under standing authority.

Exceptional high-value action requires:
- independently decoded semantic action;
- Policy Diff;
- bounded exceptional authority;
- atomic onchain execution;
- evidence showing standing authority unchanged.

### Candidate P — Mandate / Exception Runtime

Horizontal platform thesis.

Do **not** build this first.

It is only allowed to emerge after a vertical proves:
- recurring problem;
- recurring exception object;
- value of lineage/atomicity;
- portability demand.

## Concept Lock still blocked by

1. Direct user/operator evidence.
2. Exception-shape distribution.
3. Stale-policy expectation.
4. Evidence that current OMS/RMS or treasury tooling is insufficient.
5. At least two credible users/operators wanting to test.
6. A verified negative event that maps causally to the selected concept.
7. A crisp Solana-native advantage that is not “immutable audit log.”

## Immediate next action

Continue public evidence collection and technical feasibility analysis while outreach responses are pending.

The highest-value non-blocking technical question is now:

> Can the existing CRESCO Solana program be generalized from “exact approved notional for one demo action” into a canonical delegated-capital Action + Mandate + Exception model without losing atomicity or creating an over-generalized policy engine?

That analysis is allowed as a Technical Feasibility Spike. It does not authorize product build.
