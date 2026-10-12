# CRESCO World’s Fair — Engineering Quality Receipt

Date: 2026-10-02  
Status: **PROVEN — bounded World’s Fair v1**  
Source repository: `Faadil1/cresco`  
Branch: `feature/worlds-fair-orca-v1`  
PR: #11

## Verified live-proof head

`f42a7c6ebefe8df474bdc33895f6ed62fe4498ff`

## Required checks

| Check | Run | Result |
|---|---:|---|
| Node / repository regression | 37027682355 | PASS |
| Rust program check | 37027681436 | PASS |
| Orca Devnet discovery / quote | 37027681730 | PASS |
| World’s Fair bounded integration checks | 37027681684 | PASS |
| Devnet CRESCO→Orca live proof | 37027681883 | PASS |

The live-proof job also passed:
- Anchor SBF build;
- SBF stack safety guard;
- reused Devnet program reachability;
- RPC health preflight;
- seven required receipt scenarios;
- receipt validator;
- artifact upload.

## Real failures discovered and repaired

### Rust hash import

Observed:
`anchor_lang::solana_program::hash` was not available under the selected dependency layout.

Repair:
migrated to the split `solana-sha256-hasher` crate.

Post-repair:
Rust program check, Node regression and Anchor SBF build passed.

### Orca rollback error classification

Observed:
the real Orca CPI failure surfaced as native `AmountOutBelowMinimum`, while the proof harness only accepted the local wrapper markers.

Repair:
the harness now accepts the real Orca native min-output refusal as the expected rollback trigger.

Important:
rollback assertions were **not weakened**. The scenario still requires:
- allowance remains unused;
- amount counter unchanged;
- notional counter unchanged.

## Quality truth boundary

This receipt proves bounded engineering quality for the current World’s Fair v1 implementation and live Devnet slice.

It does not prove:
- formal security audit;
- mainnet production readiness;
- economic safety for real customer capital;
- clean-room judge self-serve setup;
- final accessibility/performance assurance;
- terminal submission readiness.

## Next quality trigger

Engineering Quality remains active for every material code change during the Product Exploitation Loop.
