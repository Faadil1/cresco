# CRESCO — Security integration of PR #73 with V1 (staged draft)

**Status:** Source integration on draft branch. No merge, deployment, or validator execution claim.

## What was integrated

This stacked branch starts from PR #78, which itself is based on PR #77. It incorporates the behavioral security protections from PR #73 without merging any prior PR to `main`.

1. `update_asset_rule` no longer resets `period_started_at`, `spent_this_period` or `spent_this_period_notional` on guardian policy changes. The established rollover function still resets after the actual elapsed period.
2. Both historical `execute_once_with_pyth` (V0) and the new `execute_once_with_pyth_v1` use the same `checked_period_spend` helper and require both token and USD period caps to pass **before** transfers or receipt consumption.
3. Rust unit tests verify the 600/1000 ceiling, attempted spend 401 refusal, USD cap, optional USD cap and arithmetic overflow.
4. The Pyth-free isolated local-validator test adds a real 500+100 token spend, guardian rule edit with preserved 600 counter, and an in-bounds-action-limit attempt of 401 that must fail the period cap; vault, counters and receipt status must remain unchanged.

## Evidence boundary

- CI Rust unit success is source-level validation only; the test runner needs SBF compilation and execution on a local validator to support `LOCAL` proof.
- The 600/1000 validator scenario is for the **standing** transfer instruction. It proves the shared counter and update path but **does not** prove the V1 exceptional path with signed Pyth data. V1 USD limits, successful V1 transfer, receipt consumption and replay remain blocked.
- The mandate's USD period spending is still a per-asset counter, not an aggregate across all asset mints.
- Old V0 receipts remain V0: this branch preserves backward compatibility but does not provide exact-action security to old V0 grant/execute flow. V1 migration and eventual V0 deprecation require separate review.
- PR #73 remains open and unmerged; this branch is an integration candidate, not a substitute for review of its independently developed tests and evidence.

## Required gates before promotion

Rust tests, JS checks, local SBF validator (grant/refusal/period edit), independent review of merged behavior, signed Pyth success/refusal proof, full Family UX migration/recovery, and explicit release authorization. No Colosseum historical modification.
