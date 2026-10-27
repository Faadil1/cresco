# CRESCO V1 — verified partial local validator evidence (2026-10-26 EDT)

**Evidence integrity:** `LOCAL / PARTIAL`. The overall CI run **FAILED** (5 tests passed, 4 failed). This file records only individual assertions that actually executed successfully; **never interpret it as V1 ready, a fully green validator suite, or a Pyth-positive proof**.

## Source

- PR: https://github.com/Faadil1/cresco/pull/79
- Exact observed commit: `54c2acb1f38e600fcaaf0a0fd3222d5c8b125ae2`
- GitHub Actions workflow: `v1-local-validator-refusal-proof`, run `40433737349`, job `121957351034`
- Environment: disposable Solana CLI `2.3.0` `solana-test-validator`, Anchor `0.32.1`, program SBF preloaded at `ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk`, local RPC `http://127.0.0.1:18899`, temporary local-funded keypair
- Validator/CLI not Devnet and not Mainnet. No real assets or production deployment.

## Observed successful local transactions and assertions

| Check | Evidence in job output | Result |
| --- | --- | --- |
| Guardian signs exact V1 grant | `PROOF v1_exact_guardian_grant=SUCCESS` | **LOCAL PROVEN** |
| Tampered hash at grant | `PROOF v1_grant_forged_digest=REFUSED code=AllowanceActionMismatch` | **LOCAL PROVEN** |
| Unauthorized guardian | `PROOF v1_non_guardian_grant=REFUSED code=ConstraintHasOne` | **LOCAL PROVEN** |
| Already-expired grant | `PROOF v1_expired_at_grant=REFUSED code=InvalidExpiry` | **LOCAL PROVEN** |
| Premature 3,600→10-second window | `PROOF guardian_early_period_shortening=REFUSED code=InvalidPeriod` | **LOCAL PROVEN** |
| Budget after 600/1,000 and rule edit | `PROOF v1_integration_period_cap_after_policy_edit=REFUSED code=PeriodAmountExceeded` and `PROOF period_counter_preserved=600/1000 policy_edit=true refused_overage=401` | **LOCAL PROVEN for standing transfer/counter path**, not V1 Pyth transfer |

The disposable local V1 grant transaction signature was recorded as:

```text
5N7v69fXVBH6uSrewF2ktvicFu3fU9YSUpvWZinrrtxapV2y5pQPomzkewZ7j5ZoEd2qc7XfvPULiwae4g7HtAbK
```

This signature belongs **only to the ephemeral local validator**, cannot be looked up on public Devnet/Mainnet, and has no public-network monetary significance.

## Why the overall suite failed

Four negative-path execution cases (`changed_amount`, `changed_destination`, `changed_nonce`, `paused_mandate`) all failed **before submission** due to Anchor's client serializer raising:

```text
Blob.encode[data] requires (length 1) Buffer as src
```

The client had supplied `[1]` as the `Vec<u8>` market-message argument instead of a Buffer. A follow-on draft commit replaced it with `Buffer.from([1])`. **No successful replay of these four tests is claimed until the next validator run completes.**

## Remaining gates — BLOCKED

- Confirm runtime execution and atomic zero-spend rollback of all four negative V1 paths.
- Confirm **positive** V1 transfer with genuinely Pyth-signed evidence, receipt consumed exactly once and replay rejected.
- Prove canonical ATA destination setup and Family UI wallet integration; this partial suite used explicitly keyed token accounts, not ATAs.
- Review cross-mint aggregate USD budgeting (currently per asset) and guardian policy migration.
- Keep stacked PR #77/#78/#79 draft and unmerged. No public deploy, program upgrade or modification of the historical Colosseum entry.
