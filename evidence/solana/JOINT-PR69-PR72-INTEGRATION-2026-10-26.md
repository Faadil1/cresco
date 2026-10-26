# CRESCO — Joint integration gate: PR #69 + PR #72

Date: 2026-10-26
Branch: `test/joint-period-budget-69-72-2026-10-26`
Type: **non-release integration branch**, based on PR #69 head `cc941dc64ac0e10f5e9c5593ba047bf2a4f8a9b7` with PR #72 program changes `73bf06b171a0742412ec6d4f463d118205e8b805`.

## Purpose
Test both security changes together without merging PR #69 or #72 into `main`:
1. `update_asset_rule` preserves `period_started_at`, `spent_this_period`, and `spent_this_period_notional` when a guardian changes policy.
2. Historical `execute_once_with_pyth` enforces the remaining token and USD period caps before transfer or allowance consumption.
3. Existing nonce and allowance binding, amount validation, oracle freshness and account authority remain fail-closed.

## Validation gates
- GitHub Rust unit CI and Anchor SBF compilation at exact joint HEAD.
- **Still required:** Anchor local-validator integration exercise with one family/mandate, 600/1000 spent, guardian policy change, and one-use exception of 401 refused; verify unchanged vault, counters and allowance receipt after refusal. Repeat for USD cap and period rollover.
- **Still required:** review whether mandate USD period cap is per-asset or truly aggregated across mints. This change does not prove household-wide aggregation.
- **Still required:** canonical transfer-action request-hash binding review; not solved by either PR.
- No production deployment, no Devnet transaction, no merge, no release authority.

## Evidence boundary
`LOCAL_SOURCE` + CI results when observed; **not** `LIVE` or `DEVNET_PROVEN`.
