# Concept Collision v3 — Exception-to-Policy After Primer + TradFi Override Test

Date: 2026-09-26
Status: PRE-CONCEPT-LOCK
Build authorized: NO

## What changed

Two new facts materially sharpen the Delegated Trading lane.

### Fact 1 — Primer Vault reconstructs most of agentic trading authorization

Primer Vault already implements:
- commissioned agent identity;
- independent quote;
- per-trade max;
- daily volume;
- slippage;
- price impact;
- reserve floor;
- auto-approve;
- human review;
- approval queue expiry;
- re-quote at approval;
- current-policy re-evaluation;
- duplicate-safe approval;
- onchain execution.

Therefore CRESCO cannot differentiate on “safe delegated trading with human approval.”

### Fact 2 — true one-trade risk override is an established institutional pattern

European algorithmic-trading rules explicitly require procedures for orders blocked by pre-trade controls that the firm nevertheless wishes to submit.

The override must be:
- temporary;
- exceptional;
- tied to a specific trade;
- verified by risk management;
- authorized by a designated individual.

Therefore CRESCO also cannot claim to have invented “one specific trade override.”

## The surviving distinction

The useful question is now:

> Can CRESCO transplant a mature institutional risk-override pattern into machine-delegated onchain capital with stronger execution semantics?

Working object:

```
Standing Mandate vN
        ↓
Autonomous delegate action
        ↓
Normal risk evaluation
        ↓
soft standing limit violated
        ↓
REFUSE normal authority
        ↓
Policy Diff
        ↓
Exceptional Authority
derived from vN
        ↓
constrained onchain execution
        ↓
exception consumed atomically
        ↓
standing Mandate remains vN
```

This is no longer a novelty claim about the decision lattice.

It is a product hypothesis about:
- bringing the lattice into autonomous onchain execution;
- making the authority object explicit and machine-verifiable;
- making standing vs exceptional authority separate onchain states;
- making execution + exception consumption atomic;
- preserving Mandate lineage and stale semantics;
- potentially allowing third-party verifiability.

## Primer distinction

Primer currently models:

```
inside current hard policy?
 ├─ no → REJECT
 └─ yes
      ↓
needs human review?
 ├─ no → EXECUTE
 └─ yes → APPROVE / REJECT
              ↓
        reapply current policy
              ↓
           execute
```

A principal approval is **review within standing authority**, not a visible override of:
- per-trade max;
- daily volume;
- max slippage.

CRESCO's baseline already supports a different semantic:

```
normal standing cap exceeded
→ normal execution refuses
→ principal creates one exceptional allowance
→ exact exceptional action may execute
→ standing cap remains unchanged
```

This is a real difference.

## Why this still may be only a feature

A mature RMS can implement a one-trade override.

A smart-wallet provider could add:
```
approve_exception(action, policy_revision)
```

Therefore CRESCO is not yet a company merely because the semantic exists.

It needs one or more of:

### A. Native atomicity
Exceptional authority and governed capital execution settle in one atomic onchain transaction.

### B. Verifiable lineage
Anyone can verify:
- which Mandate was active;
- which dimensions were exceeded;
- who authorized the exception;
- what executed;
- whether it was consumed;
- what standing authority remained.

### C. Delegate-native integration
Software/AI/strategy delegates can discover their Mandate, generate boundary requests, receive bounded authority and continue without root-key access.

### D. Portable authority semantics
The same principal/delegate/Mandate/exception model works across supported execution venues without each app inventing a different approval workflow.

### E. Risk-policy evolution without drift
Repeated exceptions can generate evidence/recommendations while only the authorized principal path can create vN+1.

All remain hypotheses.

## Current leading company hypothesis

Not:
- AI trading wallet;
- trading risk engine;
- generic policy engine;
- onchain multisig;
- family allowance app.

Potentially:

> **Delegated Capital Authority for autonomous onchain strategies.**

Narrow first wedge:
- one Solana venue / action class;
- principal allocates a bounded vault;
- strategy trades autonomously within Mandate;
- legitimate soft-boundary breach produces a specific exceptional-authority request;
- principal may authorize without modifying standing policy;
- capital execution and exception consumption are atomic.

## Killer differentiation test

Ask a trading operator:

> Your bot is capped at $100k per trade. One legitimate opportunity requires $140k and you do not want to make $140k the new normal. What does your system issue?

Possible answers:
- resize/abandon;
- edit max trade to $140k;
- temporary $140k limit for N minutes;
- exact one-trade override;
- risk officer co-sign;
- other.

Then ask:

> After that approval, what should a machine be able to prove about the standing limit and the exceptional authority?

If they do not care about that distinction, CRESCO's residual weakens.

## Concept Lock status

Still blocked.

Need:
1. at least two real operator workflows;
2. exception-shape distribution;
3. current RMS/OMS workaround;
4. latency tolerance;
5. evidence that onchain atomicity/lineage matters;
6. real willingness to trial.

## Current rank

1. Delegated Capital Authority — leading evidence lane, not locked.
2. Treasury Intent — strong demo, more architecture required.
3. Agentic generic — high competitive risk.
4. Family — active UX/product research lane.
5. Organizational Spend — analogue only for World’s Fair.
