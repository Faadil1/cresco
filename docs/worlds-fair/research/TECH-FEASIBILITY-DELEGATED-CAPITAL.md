# Technical Feasibility Spike — Delegated Capital Mandates

Date: 2026-09-26  
Status: FEASIBILITY ONLY — NO BUILD AUTHORIZATION

## Question

Can the existing CRESCO Solana program evolve from its Stocklana transfer/notional proof into a credible delegated-capital / trading Mandate model **without discarding the proven atomic authority semantics**?

## Short answer

**Yes, with a bounded architectural extension.**

The current program already contains several reusable primitives:
- versioned `Mandate` with nonce;
- active / paused / revoked status;
- global per-action and per-period notional limits;
- per-asset `AssetRule`;
- action mask;
- period counters;
- Pyth Lazer verification inside the execution path;
- market freshness/confidence constraints;
- one-use `AllowanceReceipt`;
- exact-notional mismatch refusal;
- stale allowance refusal via Mandate nonce;
- atomic SPL-token movement + allowance consumption.

However, it is currently a **controlled token-transfer execution path**, not a generic trading risk engine.

## What already maps cleanly to Delegated Capital

### Mandate

Existing:
- `version`
- `nonce`
- `status`
- `expires_at`
- `max_action_notional`
- `max_period_notional`
- market freshness/confidence policy

Direct mapping:
- allocator → strategy standing authority;
- pause/revoke;
- max trade notional;
- max rolling/period notional;
- market-evidence quality.

### AssetRule

Existing:
- mint;
- action mask;
- max action amount;
- max period amount;
- period window;
- amount/notional counters;
- max unit price;
- Pyth feed.

Direct mapping:
- allowed assets;
- per-asset limits;
- price guardrails;
- rolling exposure counters.

### AllowanceReceipt

Existing:
- Mandate;
- principal/guardian;
- delegate/beneficiary;
- mint;
- request hash;
- exact approved notional;
- Mandate nonce;
- expiry;
- used flag.

Direct mapping:
- exceptional capital authority issued under one Mandate lineage.

### Atomicity

Current `execute_once_with_pyth` performs, within one Solana transaction:
1. authority / nonce checks;
2. allowance checks;
3. Pyth verification;
4. exact notional verification;
5. period-counter computation;
6. token transfer;
7. counter update;
8. allowance consumption.

If any instruction fails, Solana transaction rollback preserves the prior state.

This is a genuine reusable advantage for onchain exceptional authority.

## What does NOT yet exist

### 1. Generic Action semantics

Current onchain action model effectively supports one governed capital action:
- `ACTION_TRANSFER`.

It does not natively encode:
- SWAP;
- LIMIT_ORDER;
- MARKET_ORDER;
- CANCEL_ORDER;
- ADD_LIQUIDITY;
- REMOVE_LIQUIDITY;
- BORROW;
- REPAY;
- LEVERAGE_CHANGE.

### 2. Venue / program scope

No current Mandate rule binds an action to:
- Phoenix;
- OpenBook;
- Jupiter;
- Raydium;
- a specific Solana program;
- a specific instruction discriminator.

### 3. Full semantic action binding

Current exactness is real but specialized.

A generalized trading action may need:
- action type;
- input asset;
- output asset;
- venue/program;
- instruction;
- side;
- base/quote quantity;
- limit price;
- max slippage;
- deadline;
- account set / destination;
- optional oracle/risk snapshot.

### 4. Portfolio / position risk

Current counters track transferred amount/notional.

A trading product may require:
- open position;
- gross exposure;
- net exposure;
- realized/unrealized P&L;
- drawdown;
- leverage;
- concentration;
- per-venue exposure.

These require additional state or a narrower demo scope.

### 5. Trading execution adapter

Current action ends in `token_interface::transfer_checked`.

A real trading path would need to CPI into a venue/program or route through a constrained adapter.

## Recommended architectural direction IF Trading passes Concept Lock

Do **not** generalize immediately into arbitrary CPI authorization.

Use a bounded vertical architecture:

```
Principal
  ↓
Mandate
  ↓
TradeAction
  ↓
VenueAdapter (one supported venue first)
  ↓
Risk evaluation
  ↓
ALLOW / REFUSE / EXCEPTION_REQUIRED
  ↓
CPI trade execution
  ↓
atomic state update + exception consume
```

### TradeAction v0

A canonical bounded struct could eventually include:

```
action_kind
venue_program
base_mint
quote_mint
side
quantity
limit_price_or_max_slippage
max_notional
deadline
mandate_nonce
```

The exact encoding must be defined only after the selected trading workflow is known.

## Policy Diff feasibility

Technically feasible.

Because policy values and action values are deterministic inputs, CRESCO can compute a violated-dimension bitmap / structured diff before execution.

Example:

```
ASSET          compliant
VENUE          compliant
NOTIONAL       +2,000 above limit
SLIPPAGE       +45 bps above limit
DEADLINE       compliant
```

Important:
The diff should not itself grant authority.

It is evidence used to construct or explain an exceptional-capability request.

## Exceptional capability shapes

The current AllowanceReceipt naturally supports **exact action once**.

Other shapes would require explicit new semantics:

### Exact Trade
Best fit with current architecture.

### Temporary Parameter Envelope
Would require:
- expiry;
- allowed parameter delta;
- possibly use count / aggregate budget;
- stale-policy behavior.

### Scoped Session
Would require:
- repeated executions;
- aggregate counters;
- session-level revoke;
- session-vs-Mandate lineage.

Do not implement all three before discovery identifies the required shape.

## Stale-policy semantics

Current CRESCO has a strong default:
- Mandate nonce mismatch → old authorization refuses.

This is technically easy to preserve for trading.

Possible future domain semantics:
- always stale after any Mandate change;
- stale only if a relevant policy dimension changed;
- re-evaluate exception against current Mandate.

Do not weaken the current fail-closed rule without user/domain evidence.

## Main security risk of generalization

### Arbitrary CPI trap

A “generic execution program” that accepts arbitrary:
- target program;
- accounts;
- instruction data

would greatly enlarge the attack surface and could recreate the exact authority problem CRESCO is meant to solve.

Therefore:

> **SCALE THE ACTION SURFACE ON EVIDENCE, NOT POSSIBILITY.**

Preferred World’s Fair architecture after Concept Lock:
- one known venue;
- explicit instruction parser/builder;
- explicit account constraints;
- no arbitrary CPI passthrough;
- fail closed on unsupported instruction/account shape.

## Feasibility verdict

### Reuse
HIGH.

### Required architectural delta
MEDIUM.

### Rewrite risk
LOW–MEDIUM if verticalized to one trading venue.

### Rewrite risk
HIGH if generalized prematurely into arbitrary DeFi / arbitrary CPI.

### Atomicity preservation
YES, if the trade CPI and exceptional-authority consumption remain inside the same Solana transaction.

### Pyth relevance
NATURAL for price / freshness / confidence / deviation constraints.

### Concept-Lock impact

Trading remains technically credible.

This spike **does not prove market need** and does not authorize implementation.

The lane still needs:
- operator discovery;
- actual exception shape;
- acceptable override latency;
- competitive residual vs OMS/RMS;
- selected venue/workflow;
- verified negative event.

## If Trading passes Reality Gate

The first demo architecture should prove one vertical slice only:

```
standing trade mandate
→ 2 valid autonomous actions
→ 1 action crosses risk boundary
→ REFUSE + exact Policy Diff
→ principal chooses exceptional authority
→ mutated trade refuses
→ exact trade executes atomically
→ exception consumed
→ replay refuses
→ standing Mandate unchanged
```

Do not build until Concept Lock.
