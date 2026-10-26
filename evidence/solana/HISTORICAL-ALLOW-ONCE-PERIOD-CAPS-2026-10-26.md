# CRESCO — Historical ALLOW_ONCE transfer: hard-period budget repair

Date: 2026-10-26
Scope: `Faadil1/cresco`, isolated branch `fix/legacy-once-period-hard-caps-2026-10-26`
Baseline: `main@6464dd2ca88479963a536b6c44f178839d132eef`
Classification: **SOURCE_CHANGE / LOCAL_UNIT_TESTS_COMMITTED — release blocked**

## Observed P0 issue
The historical `execute_once_with_pyth` instruction validated mandate authority, allowance nonce, expiry, request hash, exact Pyth-based notional, and token vault ownership, but **did not enforce either remaining period budget** before `transfer_from_vault`. It incremented token and USD counters after the transfer. This could permit a one-use exception to bypass `AssetRule.max_period_amount` and `Mandate.max_period_notional`. Unlike this transfer path, `execute_swap_once_with_pyth` already enforces both period ceilings.

## Repair
- Before any token CPI or allowance consumption, compute checked next-period token and USD spend.
- Reject a token-period cap crossing as `PeriodAmountExceeded`.
- Reject a configured USD-period cap crossing as `PythPeriodNotionalExceeded`. A zero USD-period cap retains its existing documented meaning: no global USD period ceiling.
- Reject overflow of either counter.
- Preserve one-use transfer's intended exceptional **per-action** permission; do not broaden any limits, mutate account schemas, edit request hash semantics, change signer authority, or change deployment configuration.

## Test assertions added (Rust unit, same helper called from the instruction)
- Token spend 600 + 400 under a 1000 cap: allow exactly at the cap.
- Token spend 600 + 401: refuse.
- USD spend 6,000,000 + 4,000,001 under a 10,000,000 cap: refuse.
- Allow zero global USD-period cap while still requiring the token period cap.
- Refuse arithmetic overflow of either counter.

## Integration / dependency boundaries
- Companion **PR #69**, still a separate draft, prevents guardian edits from zeroing the same period counters. This branch does not contain PR #69 and must not be treated as a full repair until both changes are integrated and tested **together**.
- Companion **PR #70** covers Family UI truth and practice-credit error recovery; unrelated to on-chain authority.
- Unresolved separate P0: the legacy transfer `request_hash` is derived off-chain from a request identifier rather than recomputed on-chain from canonical transfer material (unlike Orca swap). A safe repair must reconcile the guardian approval contract, dynamic Pyth-based token amount and existing Devnet clients. **Not fixed by this change**; do not claim exact transfer-action hash binding proven on-chain.
- Existing one-time allowances on the deployed program are unaffected because **no program was deployed**. Deployment of the changed program requires explicit approval, build and state-compatibility review.
- A test of this helper is not equivalent to an end-to-end Anchor validator exercise. Need locally built SBF + validator negative tests asserting token balances and allowance `used` unchanged after cap refusals.
- No real funds, new authorizations, wallet calls, Devnet transactions, mainnet operations, deployment or merge.

## Validation status
- Static review: source and regression cases committed.
- GitHub CI: **PENDING independent observation at exact PR head**.
- Anchor SBF integration: **NOT_PROVEN**.
- Live Devnet: **NOT_RUN**.
- Public runtime commit binding: **NOT_CHECKED**.
- Gate: `BLOCKED_FOR_PROMOTION` until independent code review, negative-path validator receipts and explicit owner authorization.

## Family-first sequencing
Product progression continues: P0 protocol integrity; P1 verified guardian-first household identity, child invitation, consent/segregation/recovery; P1 end-to-end Family runtime; P2 culturally informed financial education (Canada/Nigeria). YC and funding artifacts are parallel, not release authorities.
