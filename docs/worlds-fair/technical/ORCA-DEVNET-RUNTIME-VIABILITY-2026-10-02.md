# Orca Devnet Runtime Viability — 2026-10-02

Status: **PROVEN_FOR_SELECTED_POOL_DISCOVERY**  
Evidence class: **LIVE DEPENDENCY DISCOVERY / NOT YET CRESCO CAPITAL-PATH PROOF**

## Purpose

Verify that the bounded World’s Fair Orca target selected in Backend Engineering Intelligence is actually reachable and quoteable on Solana Devnet before promoting the CRESCO → Orca execution path.

## Observed runtime

Source repository: `Faadil1/cresco`  
Observed commit: `a8bc358de4311acf5e5a587b8bc316fa1805c451`  
GitHub Actions run: https://github.com/Faadil1/cresco/actions/runs/36985128783  
Network: Solana Devnet

Observed values:

- Orca Whirlpool program: `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc`
- pool: `63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg`
- token A / input: devUSDC `BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k`
- token B / output: devUSDT `H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm`
- direction: A → B
- quote mode: exact input
- sample input: 100,000 base units = 0.10 devUSDC
- estimated output: 99,989 devUSDT base units
- minimum output at the tested quote: 98,999 base units
- Orca oracle PDA and tick-array accounts resolved from live devnet state

## What this proves

The selected Orca devnet pool is present, its mint pair matches the bounded implementation spec, and the official Orca SDK can resolve a live exact-input quote from current Devnet state.

## What this does not prove

This is **not** yet proof that:

- the CRESCO Solana program successfully CPIs into Orca;
- standing-authority swaps execute through the CRESCO capital path;
- one-use exceptional authority is consumed atomically with an Orca swap;
- rollback, replay, stale-authority or Pyth-failure scenarios pass;
- any mainnet, institutional, audited or customer-capital claim is valid.

Those remain under `BUILD__FIRST_LIVE_VERTICAL_SLICE`.

## Truth boundary

- `ORCA_POOL_RUNTIME_VIABILITY = PROVEN`
- `CRESCO_ORCA_LIVE_CORE_LOOP = NOT_YET_PROVEN`
- `MAINNET = FALSE`
- `PRODUCTION_TRADING = FALSE`
