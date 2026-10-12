# CRESCO World’s Fair — Technical Reality Check

Date: 2026-10-01  
Status: PASS_WITH_BOUNDED_DELTA  
Concept: Execution-bound delegated capital authority  
Vertical: Delegated trading / capital mandates

## Inputs checked

Historical CRESCO source:
- `Faadil1/cresco@0eb10dd8352bba69b9717d0d62d89794c9e384cc`
- `programs/keys/src/lib.rs`
- existing Solana devnet and Pyth evidence

World’s Fair research:
- `research/TECH-FEASIBILITY-DELEGATED-CAPITAL.md`
- `research/TRADING-BOUNDARY-TAXONOMY.md`
- `research/KILLER-DEMO-SPECS.md`
- `product/CONCEPT-LOCK-2026-10-01.md`

## What the current program really proves

Observed in source:
- versioned `Mandate` with nonce;
- ACTIVE / PAUSED / REVOKED states;
- global action/period notional policy;
- per-asset `AssetRule`;
- action masks;
- per-period counters;
- Pyth Lazer verification inside execution path;
- freshness/confidence constraints;
- one-use `AllowanceReceipt`;
- request-hash binding;
- exact-notional enforcement;
- stale allowance refusal through Mandate nonce;
- SPL token movement from a program-controlled vault;
- allowance consumption after successful capital movement in the same Solana instruction/transaction.

The current `execute_once_with_pyth` path:
1. validates authority and nonce;
2. verifies unused/non-expired allowance;
3. verifies request hash;
4. invokes canonical Pyth Lazer verification;
5. parses market evidence;
6. computes Pyth-derived notional;
7. requires exact allowed notional;
8. performs token transfer;
9. updates period counters;
10. marks allowance used.

Because these state changes occur inside one Solana transaction, a failed instruction rolls back the state transition.

## What the current program does NOT prove

It does not yet implement a true trading action surface.

Current governed capital action is effectively:
- `ACTION_TRANSFER`.

Missing:
- swap/order action types;
- selected trading venue/program;
- base/quote semantic binding;
- side;
- quantity semantics beyond token transfer amount;
- slippage or limit-price binding;
- deadline binding;
- constrained venue CPI;
- position/exposure/P&L/drawdown/leverage state.

It also does not prove universal arbitrary transaction semantics.

## Technical decision

The locked concept is technically feasible **without rewriting CRESCO**, provided the World’s Fair implementation remains vertical.

### Required bounded delta

Add one explicit trade-capable action path with:

```
TradeActionV0
  action_kind
  venue_program
  input_mint
  output_mint
  quantity
  max_notional
  max_slippage_or_price_constraint
  deadline
  mandate_nonce
```

Exact fields may be narrowed once the execution adapter is selected.

### Adapter rule

Use:
- **one supported Solana venue/adapter**;
- explicit program ID;
- explicit instruction construction/parsing;
- explicit account constraints.

Do not implement:
- arbitrary target program;
- arbitrary account metas;
- arbitrary instruction bytes;
- generic CPI passthrough.

## Capital-path invariant

The strongest existing CRESCO property must be preserved:

> authority verification, market/risk verification, capital execution, counter mutation and one-use exceptional-authority consumption remain in the same Solana transaction whenever the selected venue permits it.

If the selected venue architecture cannot preserve this atomic path, the implementation must truthfully downgrade the atomicity claim before build continues.

## Highest safe justified action tier

For the World’s Fair vertical:

**APPROVAL_GATED_WRITE**

Reason:
- the product’s value depends on a real state-changing capital action;
- READ_ONLY would materially weaken the concept;
- a devnet/test-asset execution is sufficient to exercise the real authority mechanism without claiming production institutional trading;
- principal exceptional approval remains explicit;
- unsupported/hard-boundary actions fail closed.

## Pyth role

Pyth remains load-bearing only where the selected trade/risk rule uses market evidence.

Allowed role:
- freshness;
- confidence;
- price/notional;
- execution constraint.

Forbidden role:
- granting authority;
- auto-widening Mandate;
- replacing principal approval.

## V1 safety semantics

Preserve:
- any Mandate nonce change invalidates existing exception;
- unsupported adapter/program = HARD REFUSE;
- stale/invalid required market evidence = UNKNOWN/REFUSE;
- one-use exception;
- mutation mismatch refusal;
- replay refusal.

## Required build architecture

```
Principal
  ↓
Standing Mandate
  ↓
Delegate / Strategy
  ↓
TradeActionV0
  ↓
Boundary Evaluation
  ├─ inside standing authority → EXECUTE
  ├─ soft boundary → REFUSE + Policy Diff → Exceptional Authority
  └─ hard/unknown boundary → REFUSE / UNKNOWN
  ↓
Constrained Venue Adapter
  ↓
Pyth/risk evidence where material
  ↓
Solana CPI / capital action
  ↓
atomic counters + exceptional-authority consumption
  ↓
receipt / telemetry
```

## Technical risks to resolve before implementation completion

1. venue adapter choice;
2. exact CPI/account constraints for that venue;
3. canonical TradeAction hash/serialization;
4. semantic mutation tests;
5. devnet/test asset availability;
6. venue behavior under partial/failing CPI;
7. current program account-size/state migration requirements;
8. transaction-size/compute-budget impact;
9. whether selected venue exposes the required action on devnet/local test environment.

## Verdict

**TECHNICAL_REALITY_CHECK = PASS_WITH_BOUNDED_DELTA**

Reason:
- core authority, stale, one-use, Pyth and atomic state/capital primitives are real and reusable;
- the missing work is a bounded trading action + constrained execution adapter, not a conceptual rewrite;
- arbitrary DeFi/CPI generalization would invalidate this verdict.

## Next gate

**BACKEND_ENGINEERING_INTELLIGENCE / DEMO-FIRST ARCHITECTURE CONVERGENCE**

Exact next action:
select the single Solana venue/adapter and produce the implementation-ready architecture/spec while preserving the locked truth boundary and validation gap.
