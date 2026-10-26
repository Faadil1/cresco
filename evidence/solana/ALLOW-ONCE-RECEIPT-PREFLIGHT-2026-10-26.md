# ALLOW_ONCE Devnet receipt preflight — 2026-10-26

Scope: execution provider only; no Solana program, wallet, account schema, UI, public runtime, or deployment change.

Before assembling the historical `execute_once_with_pyth` instruction, the provider now fetches the guardian allowance PDA and refuses missing, mismatched mandate/mint/request/beneficiary, used, stale-nonce, or expired receipts. This prevents avoidable fee-consuming failed transactions and gives a clearer fail-closed boundary in the Family experience.

**Important security limit:** this is defense-in-depth, NOT a substitute for onchain enforcement. The program currently compares a request-ID hash supplied by the caller with the stored request-ID hash. It does not derive a canonical hash of the actual transfer destination, amount, mint, nonce and guardian approval. This remains a P0 protocol gap requiring a versioned design and coordinated client/program migration; do not label fixed.

Evidence: source edit on isolated branch. Automated CI and negative-path tests are required before promotion. Do not merge or deploy. Colosseum submitted runtime and materials remain untouched.
