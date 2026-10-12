# CRESCO World’s Fair V1 — Bounded Implementation Specification

Version: 1.0  
Date: 2026-10-01  
Status: CONVERGED_FOR_BUILD  
Source PRD: `product/PRD.md@1.0-locked-with-validation-gap`

## Product promise

A delegated strategy may swap autonomously inside a standing capital Mandate. A trade that crosses a soft notional boundary can receive one-use exceptional authority without widening the standing Mandate.

## Shared product core

All web/API/demo surfaces must call the same canonical authority + execution services.

No parallel demo-only policy engine.

## V1 actor model

- Principal: owns/controls standing Mandate transitions and exceptional approvals.
- Delegate/Strategy: proposes and executes actions inside authorized bounds.
- CRESCO Program: final authority enforcement + capital-path guard.
- Orca Whirlpools: constrained swap execution venue.
- Pyth: market evidence source where required; authority effect = NONE.

## V1 action

`SWAP_EXACT_IN` only.

Initial pair target:
`devUSDC → devUSDT` on Orca devnet.

## Standing Mandate fields required for v1

Reuse:
- status;
- version;
- nonce;
- expiry;
- max_action_notional;
- max_period_notional;
- market freshness/confidence.

Add/narrow where necessary:
- allowed venue program = Orca;
- allowed pool;
- input/output mint pair;
- swap action bit;
- max slippage/min-output rule if not fully carried by TradeActionV0.

## TradeActionV0 canonical fields

- action_kind;
- venue_program;
- whirlpool;
- input_mint;
- output_mint;
- input_amount;
- min_output_amount;
- max_notional_micro_usd;
- deadline;
- mandate_nonce.

Canonical encoding must be deterministic.

## ExceptionalAuthorityV0

Reuse/extend `AllowanceReceipt` so authorization binds:
- Mandate;
- principal;
- delegate;
- action semantic hash;
- exact/bounded notional;
- source nonce;
- expiry;
- one-use state.

V1 uses exactly one successful execution.

## Required product paths

### Success — standing autonomy

Two swaps inside the standing notional limit execute without principal intervention.

### Soft-boundary exception

A swap above the per-action notional limit:
1. refuses under standing authority;
2. emits Policy Diff;
3. principal grants exact one-use exception;
4. exact action executes;
5. exception consumed;
6. standing Mandate unchanged.

### Mutation

Change at least one meaningful bound field:
- pool;
- output mint;
- amount;
- min output/slippage;
- deadline.

Expected:
REFUSE.

### Replay

Replay consumed exception.

Expected:
REFUSE.

### Stale authority

Change Mandate nonce after exception issuance.

Expected:
REFUSE.

### Hard boundary

Unsupported program/pool/action.

Expected:
REFUSE with no exception option.

### Evidence failure

Required Pyth evidence stale/invalid/unavailable.

Expected:
UNKNOWN/REFUSE.

### Venue failure

Orca CPI fails.

Expected:
transaction rollback; CRESCO must not record successful execution or consumed exception.

## Observability

Every execution result should expose a bounded receipt containing:
- action ID/hash;
- Mandate address/version/nonce;
- decision;
- boundary class;
- violated dimensions when any;
- exceptional-authority ID when any;
- venue program/pool;
- Solana transaction signature when submitted;
- Pyth evidence status where material;
- execution status;
- exception consumption status;
- post-action standing Mandate version.

## Evidence Graph obligations

For each material live claim:
`CLAIM → SCENARIO → RUNTIME_EXECUTION → DEPENDENCY → RECEIPT → COMMIT → DEPLOYMENT`.

Required scenarios:
- SUCCESS;
- NEGATIVE;
- BOUNDARY;
- RECOVERY;
- EXTERNAL_DEPENDENCY_FAILURE.

## Highest safe action tier

**APPROVAL_GATED_WRITE**.

Use real devnet state changes with dev assets.

Replay remains fallback/evidence support, never the primary product mode.

## Non-goals

- arbitrary CPI;
- multi-venue routing;
- order books;
- leverage;
- borrow/lend;
- mainnet;
- real customer capital;
- production custody;
- generalized portfolio risk;
- temporary-envelope/session exception shape.

## Build acceptance criteria

Build is not candidate-ready until:
- Orca swap path is live on devnet;
- standing-limit enforcement is in the same product path;
- one-use exception is execution-bound;
- mutation/replay/stale/hard-boundary cases fail correctly;
- failure rollback is proven;
- Pyth role is truthful and load-bearing where claimed;
- receipts come from the real path;
- web/API surfaces use shared product core;
- fresh-environment setup is documented;
- judge can run core flow without hidden builder intervention;
- Product Exploitation Loop is run after the first live vertical slice.

## Validation gap

Market/operator evidence remains incomplete.

The build may prove mechanism and usability, not adoption, WTP or institutional demand.
