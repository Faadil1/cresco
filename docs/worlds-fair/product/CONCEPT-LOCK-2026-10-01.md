# CRESCO World’s Fair — Concept Lock

Date: 2026-10-01  
Status: LOCKED_WITH_VALIDATION_GAP  
Human decision: PROCEED_IF_NO_OPERATOR_REPLY  
Build authorization: FALSE pending Technical Reality Check

## Why this lock exists now

The direct-operator outreach checkpoint produced no new replies beyond the Sanction founder/expert interview.

The project therefore proceeds under an explicit human-authorized **BUILD_WITH_VALIDATION_GAP** path.

This decision:
- does **not** convert missing operator evidence into PASS;
- does **not** prove willingness to pay;
- does **not** prove adoption;
- does **not** weaken the Reality Gate;
- does allow the project to stop waiting indefinitely and move to Technical Reality Check.

## Locked company direction

**CRESCO is an execution-bound delegated capital authority layer for Solana.**

The initial vertical focuses on **delegated trading / capital mandates**.

A principal allocates capital to a strategy/operator under a versioned standing Mandate.

The delegate may act autonomously inside standing authority.

When a legitimate action crosses a **soft** boundary, CRESCO may issue exceptional authority for that bounded action without permanently widening the standing Mandate.

When an action crosses a **hard** boundary, CRESCO refuses with no exception path.

## Locked target user for the World’s Fair vertical

Primary:
- capital allocator / principal;
- trading strategy operator or automated strategy acting as delegate;
- risk owner approving exceptional authority.

The demo may represent these roles with deterministic test actors. It must not imply institutional adoption.

## Locked core job

> Let a delegated trading strategy act autonomously inside standing risk limits, while allowing a principal to authorize a bounded exceptional trade without turning that exception into broader future authority.

## Locked product mechanism

```
Standing Mandate
→ requested trade/action
→ deterministic boundary evaluation
→ ALLOW or REFUSE

if SOFT boundary:
  REFUSE under standing authority
  → Policy Diff
  → principal decision
  → Exceptional Authority
  → execution-bound verification
  → capital execution + exception consumption
  → Standing Mandate unchanged

if HARD boundary:
  REFUSE
  → no exception path
```

## Locked differentiation hypothesis

CRESCO is **not** another wallet policy engine or approval ledger.

The differentiating hypothesis is:

> **Exceptional authority is enforced at the capital execution path, not merely recorded in an upstream authorization plane.**

This remains a hypothesis until real operator evidence exists.

## Locked World’s Fair vertical-slice semantics

For the first vertical slice:

- one supported Solana execution adapter/venue;
- one explicit trade-like capital action;
- one clearly SOFT boundary;
- one clearly HARD boundary;
- standing Mandate is versioned;
- old exceptional authority fails closed after Mandate nonce/version change;
- exceptional authority is one-use for the vertical slice;
- material action mutation invalidates the authorization;
- replay after successful consumption refuses;
- Pyth may restrict/refuse execution but never grants authority;
- the UI is not the guard;
- no arbitrary CPI passthrough.

### Soft boundary for the first slice

**Per-action / per-trade notional**.

Reason:
- maps directly to the current proven CRESCO primitive;
- is legible to judges;
- can support a true exception-to-policy path;
- does not require pretending every risk limit is negotiable.

### Hard boundary for the first slice

**Unsupported execution program / adapter or unparseable action semantics**.

Result:
- REFUSE;
- no “allow once” path.

## Conservative stale-authority semantics for v1

The vertical slice preserves the current safe rule:

> Any Mandate nonce/version change makes previously issued exceptional authority stale.

Status:
- LOCKED FOR V1 SAFETY;
- **NOT user-validated as the optimal long-term semantics**.

Future product discovery may narrow this to relevant-dimension staleness or explicit re-evaluation.

## Exception-shape decision

For the first vertical slice:
- **EXACT / ONE-USE exceptional authority**.

This is a bounded implementation decision, not a universal product claim.

The product architecture must not foreclose:
- temporary parameter envelopes;
- scoped sessions;
- dimension-specific exceptional capabilities.

Those remain future Product Exploitation Loop candidates only if later evidence justifies them.

## Counter semantics

For v1:
- exceptional execution still updates the relevant period counters;
- the exception does not mutate the standing limit.

This preserves the current CRESCO conservative model.

Status:
- bounded v1 design decision;
- not operator-validated as the only correct model.

## Explicit non-goals

The World’s Fair build will not claim:
- mainnet institutional trading;
- brokerage;
- custody;
- profitable strategy;
- production risk engine;
- arbitrary DeFi execution;
- universal semantic action hashing;
- customer adoption;
- institutional WTP;
- audited production security.

## Killer demo contract

The canonical demo remains:

1. standing Mandate permits ordinary autonomous action;
2. at least two in-bound actions execute without principal approval;
3. one legitimate action crosses the soft notional boundary;
4. CRESCO refuses under standing authority and exposes the Policy Diff;
5. principal grants one-use exceptional authority;
6. a meaningful mutation fails;
7. exact authorized action executes through the real Solana capital path;
8. exceptional authority is consumed;
9. replay fails;
10. standing Mandate remains unchanged;
11. stale-authority path fails;
12. hard-boundary path exposes no exception route;
13. stale/invalid required market evidence fails closed.

## Validation gap preserved

Still MISSING/BLOCKED:
- representative operator trial;
- two target operators willing to test;
- CRESCO-specific WTP/pull;
- real exception-shape distribution;
- operator stale-policy preference;
- operator value of atomic consume+execution.

These gaps remain visible in CURRENT, HANDOVER, Reality Ledger and Evidence Graph.

## Next gate

**TECHNICAL_REALITY_CHECK**
