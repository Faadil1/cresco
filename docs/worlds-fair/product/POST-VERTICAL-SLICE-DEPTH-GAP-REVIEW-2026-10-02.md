# CRESCO — Post-Vertical-Slice Depth Gap Review

Date: 2026-10-02  
Trigger: **FIRST_LIVE_VERTICAL_SLICE = PROVEN**  
Policy: Product Reality / Integration-First Product Exploitation v1.3  
Status: **ACTIVE — PRODUCT EXPLOITATION LOOP**

## Question

> What separates the proven live slice from something a real operator or judge could use tomorrow?

## What is now genuinely live

The core authority mechanism is no longer proof-only:

- CRESCO program executes on Solana Devnet;
- Orca Whirlpools is load-bearing;
- Pyth evidence is load-bearing where claimed;
- standing swaps execute;
- a soft per-action notional boundary refuses;
- an exact one-use exception can execute;
- mutation and replay refuse;
- unsupported program refuses as a hard boundary;
- missing evidence refuses;
- Orca execution failure rolls back without consuming authority or counters;
- a Mandate nonce transition invalidates stale exceptional authority;
- the real path emits a machine-readable runtime receipt.

Canonical receipt:
`evidence/runtime/FIRST-LIVE-VERTICAL-SLICE-2026-10-02.md`

## Depth gaps

### P0 — Real user / judge surface

**Status: MISSING**

The proven behavior is currently exercised through a CI/harness path. A judge/operator cannot yet run the World’s Fair core loop from a product surface.

Required outcome:

- a World’s Fair operator surface;
- uses the same canonical authority + execution implementation;
- no parallel demo-only policy engine;
- visibly distinguishes standing authority, Policy Diff, exceptional authority and policy evolution;
- links confirmed Solana signatures/receipts;
- preserves fail-closed UNKNOWN/REFUSE semantics.

### P0 — Runtime / commit binding hardening

**Status: ACTIVE**

Source-equivalence binding is proven between the deployed-program source head and the successful verifier head.

Still desirable:

- on-chain program dump;
- SHA-256 comparison against a deterministic local rebuild for the same Program ID;
- record the hash pair in the evidence graph.

This is evidence hardening, not a reason to downgrade the already observed live behavior.

### P0 — Shared Product Core

**Status: PARTIAL**

The on-chain core is shared. The existing CRESCO API/web stack still reflects the Stocklana/family surface.

Required outcome:

- expose a bounded World’s Fair API/service layer around the same live Orca path;
- use that service from the judge-facing UI;
- CI proof should call the same reusable core where practical rather than remain a separate behavioral implementation.

### P1 — Judge self-serve / deterministic demo environment

**Status: MISSING**

Required:

- known Devnet program/pool/accounts;
- safe seeded demo state;
- deterministic canonical sequence;
- reset/recovery strategy that does not leak rent or depend on repeated program deployment;
- primary live mode;
- replay only as visibly labeled fallback.

### P1 — External dependency failure / clean-room behavior

**Status: PARTIAL**

Pyth-missing and Orca-failure paths are proven.

Still required:

- document fresh-environment setup;
- explicitly test RPC unavailable/rate-limited behavior at the user surface;
- verify that the product never reports success on timeout/unknown execution state.

### P1 — Observability / receipts

**Status: PARTIAL → STRONG**

The live harness has a strong receipt.

Still required at product surface:

- action hash;
- Mandate version/nonce;
- violated policy dimensions;
- exceptional-authority ID;
- Solana signature;
- execution/rollback status;
- post-action standing authority state.

### P1 — Real operator evidence

**Status: BLOCKED VALIDATION GAP — PRESERVED**

Still missing:

- representative delegated-trading operator feedback;
- CRESCO-specific pull/WTP;
- evidence that exact one-use is preferred over temporary/session-shaped exceptions;
- operator preference on stale-policy invalidation and exception latency.

This gap does not invalidate the live mechanism, but it blocks adoption/WTP claims.

## Product Exploitation decision

Do **not** add broad feature count.

Next product depth should concentrate on one coherent vertical:

1. **World’s Fair operator lab / judge surface**
2. backed by **the same live CRESCO→Orca core**
3. showing **standing autonomy → Policy Diff → exact exception → live execution → replay/stale/rollback consequence**
4. with receipts and Explorer links above the fold
5. with a stable reusable Devnet runtime instead of repeated ephemeral deployments.

## Next implementation gate

**PRODUCT_EXPLOITATION_LOOP__REAL_USER_SURFACE_AND_SHARED_CORE**

Acceptance criteria:

- judge can initiate the canonical flow without editing code or running GitHub Actions;
- live transaction path remains server-side and secrets never reach the browser;
- no arbitrary CPI or arbitrary user-controlled Program ID;
- World’s Fair UI and API share one execution service;
- live vs replay state is explicit;
- receipts bind user-visible outcomes to the actual Devnet transaction;
- negative, boundary and rollback outcomes remain first-class;
- existing validation gaps remain visible.

## Deferred until this gate passes

- visual polish as a substitute for depth;
- multi-venue routing;
- mainnet;
- leverage/borrow/lend;
- generalized agent wallet;
- broad portfolio features;
- submission recording;
- terminal Judge Performance Assurance.
