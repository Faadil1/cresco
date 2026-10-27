# ALLOW_ONCE V1 — local validator negative-path proof runbook

**Evidence status: NOT RUN ON VALIDATOR.** This is a reproducible test procedure and runnable suite, not a claimed proof.

## Scope and safety

- Runs only on a fresh ephemeral validator at `http://127.0.0.1:18899`.
- No mainnet or public Devnet endpoint, funding wallet, transaction, deployment or migration is used.
- Creates a temporary **local-only** wallet, a token mint, charter, mandate, V1 allowance receipt, accounts and local simulated SOL funded from the local validator faucet.
- The runner compiles an SBF executable and preloads it at the Rust `declare_id!` address via `solana-test-validator --bpf-program`. **Never invoke `anchor keys sync`** merely to address the existing localnet/Devnet ID difference. Do not use `anchor test` without understanding its default deploy behavior.
- The suite refuses to run unless `CRESCO_V1_EPHEMERAL_LOCALNET=1` and the RPC endpoint exactly matches the loopback host/port.
- Tests run independently of live Pyth signatures because all V1 attempts here are refused **before the Pyth CPI**. This does not test success, price validity, or downstream transfer functionality.

## Environment prerequisites

- Solana CLI with `solana-test-validator`, an Anchor CLI compatible with `Anchor.toml` (`0.32.1`), Rust/SBF toolchain, Node.js and npm dependencies installed.
- The `target/deploy/keys.so` SBF and `target/idl/keys.json` files are produced by the runner's `anchor build`. It will fail closed if they are missing, or if the IDL's program address differs from Rust's `ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk`.
- A Git working copy of this PR branch, no production wallet, no production RPC.

From the repo root:

```bash
npm ci
npm run test:anchor:v1:local
```

The runner will clean up the validator ledger and disposable private key when the test terminates.

## Expected assertions

| Case | Expected behavior |
| --- | --- |
| Correct guardian-signed V1 grant | Create isolated receipt matching exact digest/amount/destination |
| Grant digest for different amount | Refuse, receipt PDA not created |
| Non-guardian signer attempting grant | Refuse, receipt PDA not created |
| Expired grant | Refuse, receipt PDA not created |
| Tampered execution amount | Refuse with `AllowanceActionMismatch`, balances and counters unchanged |
| Alternative token account with same mint and beneficiary | Refuse with `AllowanceActionMismatch`, balances and counters unchanged |
| Nonce mismatch | Refuse with stale nonce, receipt unused |
| Guardian pauses mandate | Refuse with `MandateNotActive`, vault/counters/receipt unchanged |

Before marking these `LOCAL` or `PROVEN`, attach the actual commit SHA, toolchain versions, SBF build hash, validator logs, Anchor test console output and transaction signatures. If the runner fails, document the **actual** error and do not infer pass/fail from syntax-only CI.

## Important unproven gates

1. Pyth Lazer signature verification and its account dependencies on local validator.
2. A successful authorized V1 transfer and one-time receipt consumption.
3. Replay of the consumed receipt.
4. Period ceiling 600/1000 then refused 401 with **valid signed market data**.
5. Full UI Family grant/execute/refusal/recovery loop and safe client V0-to-V1 migration.
6. Multi-asset household aggregate limit; current notional period counter is per asset.
7. SBF compile and local runtime are not covered by the repository's current generic Rust native `cargo test` workflow.

Keep PR #77 and stacked PR #78 draft; never merge or deploy based solely on these negative tests.
