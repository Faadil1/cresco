# ALLOW_ONCE V1 — implementation/evidence register (draft)

**Status: SOURCE IMPLEMENTED / CI PENDING / LOCAL VALIDATOR NOT PROVEN / NOT DEPLOYED**

This PR is stacked on the V1 digest fixture PR #77. Its target is the fixture branch, **not** `main`. Neither PR is merged.

## Code changes

- `grant_allowance_once_v1`: requires the charter guardian's signature, exact mint/beneficiary/destination token account, active mandate, matching nonce and valid expiry. Independently computes SHA-256 from the actual provided accounts and signed action values; rejects an inconsistent digest.
- Stores the authorization in a dedicated `AllowanceReceiptV1` with unique `allowance-v1` PDA seed namespace. The original V0 receipt and instruction remain unchanged.
- `execute_once_with_pyth_v1`: requires the beneficiary's signature, verifies the V1 receipt and exact action parameters using an onchain digest recalculation, checks active mandate and asset transfer permission, validates Pyth Lazer evidence, preserves exact signed notional requirement, and checks the asset's period token budget and mandate's period USD budget before transfer.
- On success, transfers the **exact authorized amount** to the **exact authorized token account**, increments counters, and marks V1 receipt used.
- Uses a pure `require_v1_exact_action` predicate called from the execution path; unit tests exercise rejection of changed amount, destination, nonce, guardian and digest.

## Security limitations / known prerequisites

1. **No V1 client integration yet.** The existing Family and Devnet execution paths still use V0 unless explicitly migrated in a separate reviewed PR. Do not label them V1-protected.
2. **No onchain validator execution proof yet.** Source compilation and pure unit tests cannot demonstrate successful Pyth CPI, atomic rollback, or state transitions on validator.
3. **No general cross-rail support.** This code is an additive Solana implementation, not an implementation for banks, fiat payment providers or other chains.
4. The `mandate.max_period_notional` accounting currently uses the **per-asset rule**'s notional counter; it is not a mathematically verified household-wide aggregate across multiple mints.
5. Existing V0 authorizations are **not migrated or invalidated** here. A V0 sunset requires explicit inventory, compatibility planning and approval.
6. Pending security review: policy around duplicate identical V1 grants, expiry semantics, amount+market-value consistency, PDA access rights, Token-2022 compatibility and Pyth failure behavior.

## Mandatory validator tests before READY

- Guardian grants exact 500-token-unit action to beneficiary A / destination ATA D; correct request executes **once** with signed Pyth evidence.
- On grant, a supplied digest for amount 501 or destination D2 is refused before account creation; unchanged balances and existing accounts.
- On execute, mutate amount / mint / beneficiary / destination / guardian context / mandate nonce / program-domain hash; transfer refused without receipt use or vault/counter movement.
- Replay spent receipt and attempt expired/revoked/paused mandate; fail closed.
- With period max 1,000 and spent 600, V1 exception 401 fails while 400 can pass within remaining budget. Verify vault, counters, receipt for both branches.
- Signed Pyth stale, invalid or excessive-confidence data: reject; no receipt consumption.
- Run full Family user-level grant -> proposal/approval -> execute -> refusal -> revoke -> recovery test, confirming no optimistic balance or silent fallback to V0.

## Governance

Do **not** merge, deploy, update program ID, transact on public networks, alter public UI or modify the historical Colosseum submission as a consequence of this draft.
