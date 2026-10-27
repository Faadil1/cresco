# CRESCO ALLOW_ONCE V1 — LOCAL negative-path proof, 8/8 PASS

**Evidence status: LOCAL PROVEN for the tested grant and pre-Pyth refusal paths only.** No claim of successful Pyth CPI, positive V1 transfer, replay after consumption, wallet ATA compatibility, Devnet or production deploy.

## Reproducible source

- Draft PR: https://github.com/Faadil1/cresco/pull/78
- Exact test head SHA: `ae736531d2ff17aac07a3a013704f183347a6978`
- Workflow: `v1-local-validator-refusal-proof`; GitHub Actions run **40434167607**, job **121958753186**; **SUCCESS**
- Solana `2.3.0` ephemeral local validator with program SBF preloaded at the existing Solana program ID `ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk`. Anchor CLI `0.32.1`. Disposable wallet and only local simulated SOL.
- Actual test output: `8 passing (6s)`, `PROOF v1_local_negative_suite=COMPLETE_NO_PYTH_CPI`

## Verified in the local validator

| Case | Actual result |
| --- | --- |
| Guardian signed grant with exact action digest and destination | `SUCCESS`; stored V1 receipt amount/destination/used=false verified |
| Digest describes a different amount | `AllowanceActionMismatch`; invalid receipt PDA does not exist |
| Someone other than charter guardian attempts grant | `ConstraintHasOne`; invalid receipt PDA does not exist |
| Guardian tries already-expired grant | `InvalidExpiry`; invalid receipt PDA does not exist |
| Execution amount altered | `AllowanceActionMismatch`; vault, destination, counter and receipt status unchanged |
| Exact authorized account substituted for another valid beneficiary-owned token account | `AllowanceActionMismatch`; vault, destination, counter and receipt status unchanged |
| Execution nonce mutated | `StaleNonce`; vault, destination, counter and receipt status unchanged |
| Guardian pauses mandate | `MandateNotActive`; vault, destination, counter and receipt status unchanged |

Local guardian-grant transaction signature (not a public-network transaction):

```text
52NsPyiLuR3114ucRJjQ4AcPSATNzhTTcpo4ce1HSmvgjv4sjUFX7H5ttAcwV68huQmDmHSGRSnpusC9VN8XSG7j
```

## Verification method

The tests use explicit beneficiary-owned SPL Token accounts with provided keypairs to isolate V1 authorization logic. For refused execution attempts the scenario snapshots actual token-account balances, `spent_this_period`, `spent_this_period_notional` and `allowance_v1.used` **before and after** the transaction, asserting exact equality. A deliberately invalid nonempty Pyth message was used because the tested authorization refusals must occur **before the Pyth CPI**. This provides no Pyth market validation.

## Mandatory outstanding gates

- Positive V1 transfer on a validator using properly signed Pyth market data.
- Receipt marked used after a positive transfer, and a replay definitively refused with no additional spend.
- Asset period caps and combined cross-mint household USD semantics with real Pyth pricing.
- Canonical ATA / Family wallet integration (the negative suite deliberately used non-ATA token accounts).
- Independent security review, migration/version strategy for V0 grants, live runtime proof and external approval.

**No branch merge, network deployment, public program upgrade, or Colosseum historical submission mutation.**
