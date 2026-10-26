# ALLOW_ONCE V1 — exact-action authorization contract (design only)

Status: **DRAFT / NOT IMPLEMENTED**. This document is a security migration contract, not an assertion of deployed protection.

## Observed V0 issue

The historical `grant_allowance_once` receives an arbitrary 32-byte `request_hash`. `execute_once_with_pyth` checks the same supplied hash and the receipt PDA, but does **not** independently recompute that hash from the executed transfer's amount, destination and mint. The Devnet client hashes `keys:allow-once:<requestId>`. Thus V0 receipt matching proves a shared identifier, not that the parent approved the exact capital action. Do not describe V0 as exact-action bound.

## Proposed V1 immutable authorization

Create a **separate, versioned V1 instruction and receipt type**; do not silently reinterpret existing V0 receipts or reuse V0 PDA seeds.

Canonical digest, computed identically by client and onchain:

`SHA256(domain || program_id || mandate || mandate_nonce_le_u64 || mint || beneficiary || destination_token_account || amount_le_u64 || max_notional_micro_usd_le_u64 || expiry_le_i64 || guardian)`

- `domain`: fixed bytes `CRESCO_ALLOW_ONCE_V1\0`.
- All public keys: raw 32-byte values in the specified order.
- Integers: fixed-width little-endian, never JS floating point.
- `destination_token_account` must be the actual writable token destination and satisfy token mint/owner constraints.
- `amount` is the exact transfer amount; no range authorization unless a **distinct** explicitly consented range-based instruction is designed.
- `max_notional_micro_usd` is an upper-bound market valuation check, **not** the same thing as an exact token amount.
- `guardian` is the charter's authorized guardian, verified onchain at grant time.
- Include program ID and V1 domain for replay separation.
- The receipt PDA uses V1-specific seeds including the digest. Reuse is prohibited.
- Expiry and nonce are validated at grant and execution; grant-time and execution-time clocks must use documented semantics.
- Validate amount, beneficiary, destination, mint and digest onchain before moving funds; consume receipt atomically with successful transfer.
- Preserve period caps and the mandate status/revocation checks; no exceptional bypass.
- Never accept caller-provided `request_hash` as sufficient evidence of action binding.

## Migration and compatibility

1. Introduce V1 additively, with separate API, account seeds and explicit client version selection.
2. Keep V0 unchanged until live clients and receipts have been inventoried; do not claim V0 is fixed by a client-side check.
3. Refuse fallback from failed V1 to V0; define an explicit sunset strategy after real deployment review.
4. No production wallet/key changes, Devnet transaction, upgrade, public deployment or Colosseum historical submission mutation without independent approval.

## Required negative tests (not yet executed)

- Change amount by 1; digest mismatch, vault/receipt/counters unchanged.
- Change beneficiary or destination ATA; digest mismatch, no transfer.
- Change mint, mandate, guardian, program ID or nonce; mismatch or stale authorization.
- Replay a consumed V1 receipt; fail closed.
- Expired, revoked, paused, or over-budget action; refuse without receipt consumption.
- Pyth price/market confidence failure; refuse without spending.
- Valid exact action; transfer once, update caps once, consume receipt once.
- Test cross-client deterministic vectors in Rust and JavaScript with actual local-validator transactions and evidence.

## Evidence integrity

Current evidence: source review and contract proposal only. No V1 code, onchain execution, signed Pyth fixture or validator proof. Separate security implementation PR and independent review required before marking PROVEN.
