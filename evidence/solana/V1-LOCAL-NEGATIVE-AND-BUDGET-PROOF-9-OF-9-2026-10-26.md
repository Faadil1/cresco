# CRESCO — V1 and periodic-budget local validator proof, 9/9 PASS

**Evidence integrity:** `LOCAL / PROVEN` for the enumerated, pre-Pyth refusal and standing-transfer policy paths. **Not a positive Pyth V1 transfer proof.**

## Immutable tested provenance

- Draft PR: https://github.com/Faadil1/cresco/pull/79
- Tested commit: `e12ff1f0065ba5fa42beb9ac346b41f436b4a74b`
- GitHub Actions workflow: `v1-local-validator-refusal-proof`, run **40434269262**, job **121959082822**, conclusion **SUCCESS**
- Test output: `9 passing (7s)`, `PROOF v1_local_negative_suite=COMPLETE_NO_PYTH_CPI`
- Also on the tested head: standard `test` (JavaScript) and `rust-program-check` workflows concluded **SUCCESS**.
- Toolchain: Anchor CLI `0.32.1`, Solana `2.3.0` local test validator with preloaded SBF of the modified `keys` program at existing ID `ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk`, isolated throwaway payer, local RPC `127.0.0.1:18899`.

## Directly observed local results

| Case | On-validator observation |
| --- | --- |
| Parent signs exact Allow Once V1 action | Receipt created, amount and exact destination matched, unused `true`; transaction succeeded |
| Parent sends digest for a different action | `AllowanceActionMismatch`, invalid receipt account not created |
| Impostor guardian attempts grant | `ConstraintHasOne`, invalid receipt account not created |
| Already expired grant | `InvalidExpiry`, invalid receipt account not created |
| Execution amount modified | `AllowanceActionMismatch`; unchanged balances, counters, receipt usage |
| Execution destination swapped to another valid recipient-owned token account | `AllowanceActionMismatch`; unchanged balances, counters, receipt usage |
| Execution nonce modified | `StaleNonce`; unchanged balances, counters, receipt usage |
| Existing window prematurely shortened | `InvalidPeriod`; mandate nonce, balances and counters unchanged |
| Parent edits standing budget after 600 of 1,000 spent; attempts 401 more | 600 retained; `PeriodAmountExceeded`; vault and destination balance, counters and receipt state unchanged |
| Paused mandate execution attempt | `MandateNotActive`; unchanged balances, counters and receipt usage |

One **Mocha test** combines the earlier-window shortening and 600/1000 overage cases; the CI log reports **nine passing tests** total, not ten.

Local-only signed guardian authorization transaction:

```text
5Kp5rjg43UXnyd5jmzzkjZyRTDBFXv1pEzc64PkUE4SqcX3uRGFtMCyA3va2AhxKGTaKGvaegXT93hMy3Dt4zMFD
```

This transaction occurred only on the throwaway validator and is **not available on Devnet or Mainnet explorers**.

## Evidence boundaries / non-claims

1. The V1 execution tests deliberately provide invalid market data and expect refusal **before** Pyth Lazer CPI. No real Pyth signed data, positive V1 transfer, receipt consumption or replay refusal after use has been tested here.
2. The budget 600/1000 check uses real on-validator `execute_within_mandate` token transfers and verifies policy edit/refusal; it is not a Pyth-priced V1 success or multi-mint household aggregate USD proof.
3. Token accounts are ordinary, beneficiary-owned SPL accounts created with explicit token-account keypairs; the canonical associated token account (ATA) user-wallet flow remains separate and unproven.
4. No public Devnet/Mainnet activity, main branch merge, contract upgrade, live Family UI routing, production balances or historical Colosseum submission changes.
5. PR #77, #78 and #79 stay draft/unmerged, pending the positive signed-market proof, external review, Family UX migration and explicit release authorization.

The previous `V1-LOCAL-PARTIAL-PROOF-2026-10-26.md` retains the exact history of the earlier failed 5/9 run and its client-encoding repair; this document records the later **9/9 green** run.
