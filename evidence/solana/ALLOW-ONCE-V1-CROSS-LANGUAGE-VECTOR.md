# CRESCO ALLOW_ONCE V1 — immutable cross-language digest vector

**Status:** UNIT-TEST FIXTURE ONLY. Does not authorize capital or change V0 behavior.

Canonical byte encoding is a concatenation of:

1. UTF-8 bytes `CRESCO_ALLOW_ONCE_V1` plus a single null byte (`00`).
2. `program_id`: 32 raw bytes, all `01`.
3. `mandate`: 32 raw bytes, all `02`.
4. `mandate_nonce`: unsigned little-endian 64-bit integer `7`.
5. `mint`: 32 raw bytes, all `03`.
6. `beneficiary`: 32 raw bytes, all `04`.
7. `destination_token_account`: 32 raw bytes, all `05`.
8. `amount`: unsigned little-endian 64-bit integer `500`.
9. `max_notional_micro_usd`: unsigned little-endian 64-bit integer `1000`.
10. `expiry`: signed little-endian 64-bit integer `1234`.
11. `guardian`: 32 raw bytes, all `06`.

Byte stream length: **245 bytes**.

Expected independent SHA-256 output (hex):

```text
b0de98f1aaef73deac26c7da714b9979e6bc70756ad91a0e6360e56d6efd69b6
```

This output was separately calculated using standard SHA-256 over the specified bytes (without Solana dependencies). The Rust and JavaScript tests both assert this exact value and mutate all ten fields individually. JavaScript refuses non-safe numeric inputs so BigInt serialization does not silently round an approved amount.

## Pending verification

- Rust and JS tests on the final PR head must pass CI.
- Local Solana validator grant/execute/refusal paths remain **NOT IMPLEMENTED** for V1.
- Onchain implementation must bind `program_id` to the actual running program, `guardian` to the charter, the destination to the actual writable token destination, and execute exactly the amount committed. A client-supplied digest alone is NOT sufficient.
- The legacy V0 allowance path is not changed.
- This fixture makes no claim of production, Devnet or Colosseum submission updates.
