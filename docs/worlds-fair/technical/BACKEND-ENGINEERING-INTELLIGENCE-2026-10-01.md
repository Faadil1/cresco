# Backend Engineering Intelligence — Venue/Adapter Selection

Date: 2026-10-01  
Status: PROVEN_FOR_V1_ARCHITECTURE  
Locked product: Execution-bound delegated capital authority for Solana

## Decision

Select **Orca Whirlpools on Solana Devnet** as the first execution adapter for the World’s Fair vertical slice.

This is a bounded implementation choice, not a claim that Orca is the only or final venue for CRESCO.

## Why Orca fits the locked mechanism

Primary-source findings checked 2026-10-01:

1. Orca Whirlpools is an open-source Solana AMM with the same official program deployed on mainnet and devnet:
   `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc`.
2. The current Orca repository targets Anchor `0.32.1`.
3. The historical CRESCO program also targets Anchor `0.32.1`.
4. Orca publishes dedicated CPI examples for on-chain Anchor integrations.
5. Orca publishes devnet tutorial assets/pools, including SOL/devUSDC and devUSDC/devUSDT.
6. A swap is simple enough for a judge to understand as a real capital action, while still requiring real state change and a constrained execution adapter.

Primary references:
- https://github.com/orca-so/whirlpools
- https://github.com/orca-so/whirlpools-cpi-examples
- https://github.com/orca-so/whirlpools-sdk-tutorial-kit

## Why not OpenBook V2 for v1

OpenBook V2 remains technically credible:
- deployed on devnet;
- explicit CPI client feature;
- appropriate for order-book semantics.

But for the first vertical it adds more account/state/order lifecycle complexity than required to prove CRESCO’s core authority mechanism.

It remains a future depth candidate only if order-specific semantics materially improve product value after the first live slice.

Primary reference:
- https://github.com/openbook-dex/openbook-v2

## V1 venue target

Program:
`whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc`

Initial devnet pool candidate:
- pair: **devUSDC / devUSDT**
- pool: `63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg`

Reason:
- both sides are token-like assets;
- avoids making native-SOL wrapping the center of the first authority proof;
- official Orca tutorial kit exposes the pool on devnet;
- easy to reason about notional and slippage.

Fallback pool:
- SOL / devUSDC, tick spacing 64:
  `3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt`

Pool viability must still be verified at runtime before the build is promoted as live.

## TradeActionV0

Implementation contract:

```rust
TradeActionV0 {
    action_kind: SWAP_EXACT_IN,
    venue_program: Pubkey,
    whirlpool: Pubkey,
    input_mint: Pubkey,
    output_mint: Pubkey,
    input_amount: u64,
    min_output_amount: u64,
    max_notional_micro_usd: u64,
    deadline: i64,
    mandate_nonce: u64,
}
```

The semantic authorization hash must bind the fields that materially define the authorized action.

Minimum binding:
- action kind;
- Orca program;
- exact pool;
- input mint;
- output mint;
- input amount;
- minimum output / slippage floor;
- deadline;
- Mandate nonce.

No arbitrary account list or arbitrary instruction payload may enter the authority hash as opaque caller-controlled semantics.

## Authority evaluation order

```
1. validate Mandate status + nonce
2. validate delegate
3. validate supported Orca program ID
4. validate supported pool / mint relationship
5. validate action canonical serialization/hash
6. validate deadline
7. validate Pyth evidence where required
8. compute/validate notional
9. classify boundary:
   - inside standing policy
   - SOFT notional boundary
   - HARD unsupported semantics/program/pool
10. if exception path:
    validate exact one-use exceptional authority
11. CPI into Orca swap
12. verify success through Solana transaction semantics
13. update CRESCO counters
14. consume exception in same transaction
15. emit receipt/telemetry
```

## Security boundary

CRESCO must constrain, not proxy.

Forbidden v1 patterns:
- caller-supplied arbitrary target program;
- arbitrary instruction bytes;
- arbitrary writable account metas;
- generic “execute any CPI”;
- trusting UI-computed semantic labels without onchain reconstruction/checks.

## Failure behavior

- wrong Orca program → HARD REFUSE
- unsupported pool → HARD REFUSE
- mint mismatch → HARD REFUSE
- expired action → REFUSE
- stale Mandate nonce → REFUSE
- stale/invalid required Pyth evidence → UNKNOWN/REFUSE
- semantic mutation after approval → REFUSE
- Orca CPI failure → transaction rollback; exception remains unconsumed if the whole transaction fails
- successful exception execution → allowance consumed atomically
- replay → REFUSE

## Runtime truth boundary

Initial execution target:
**Solana Devnet + Orca Devnet + dev tokens.**

Do not claim:
- mainnet;
- institutional capital;
- production trading;
- audited CRESCO-Orca integration;
- guaranteed pool liquidity;
- customer usage.

## Backend Engineering Intelligence verdict

**PROVEN_FOR_V1_ARCHITECTURE**

Orca is selected because it provides a real devnet venue, an on-chain CPI surface, current Anchor compatibility at the repository level, and enough execution realism to make the authority mechanism load-bearing.

## Next step

Converge the Demo-First Architecture and bounded implementation spec, then authorize build.
