# CRESCO World’s Fair — First Live Vertical Slice Receipt

Date: 2026-10-02  
Status: **PROVEN**  
Evidence class: **LIVE / Solana Devnet**  
Product state: **FIRST_LIVE_VERTICAL_SLICE**

## Runtime

- Network: Solana Devnet
- CRESCO program: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- Protected CI principal: `FuKsZH234Zcy11rXPHWwiPwyuhLjth7brBVsd5BD5Nzk`
- Orca Whirlpools program: `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc`
- Orca devUSDC/devUSDT pool: `63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg`
- Pyth symbol: `Crypto.USDC/USD`
- Pyth feed id: `7`
- Pyth authority effect: **NONE**

## Canonical live-proof run

- Workflow: `worlds-fair-orca-devnet-proof`
- Run: `37037374212`
- Job: `110938798095`
- Result: **SUCCESS**
- Artifact: `worlds-fair-orca-v1-runtime-receipt`
- Artifact ID: `11240747626`
- Artifact digest: `sha256:9981020726439b4271dcb6c584d160ccdfc4c161458d8e191a025a9a17b65350`
- PR head verified by the run: `e419d514d0367a5f92761ac034b3046e62980e57`
- Receipt `GITHUB_SHA` / PR merge ref: `b7365c93e8940237d46c7a6331303dddd06cc2e5`

The workflow's receipt validator returned:

`WORLD_FAIR_ORCA_RECEIPT_VALID=PASS`

## Representative scenarios

| Scenario | Result | Consequence |
|---|---|---|
| Standing autonomy | PASS | Two live swaps execute without principal approval inside standing authority |
| Soft notional boundary | PASS / REFUSE | `PythNotionalExceeded`; only the per-action notional dimension is violated |
| Exact one-use exception | PASS | Exact exceptional action executes; allowance is consumed; standing Mandate stays unchanged |
| Semantic mutation | PASS / REFUSE | `AllowanceActionMismatch` |
| Replay | PASS / REFUSE | `AllowanceAlreadyUsed` |
| Hard unsupported program | PASS / REFUSE | `InvalidOrcaProgram`; no exception path |
| Missing Pyth evidence | PASS / REFUSE | `PythMessageInvalid` |
| Orca failure / rollback | PASS / REFUSE | `AmountOutBelowMinimum`; allowance remains unused and counters remain unchanged |
| Stale authority | PASS / REFUSE | `StaleNonce` after Mandate nonce transition |

## Key live transaction evidence

- Orca bootstrap swap: `2Bh6PGjgRSxANt4ZDzxW35TnVu57PNLLZ3L2LBd159d93s3PdwqiM9f23XZ46xZWN8au22FcpXi1EUazVoTyCqi6`
- Exact exception grant: `5h7e4JmorYkgc137b6Y6XssDKL4FtCkru65VHe6bVdw3hUAMp3642qPJnnF6ZFgWPcni27byrU7yigcmoJZfwSBx`
- Exact exception execution: `4mFMK9Qnn8cKWdVxhwV4J93vUb8UFFbTkfYSADmWXN2FNweHC4AqVWXdVumNL12CuNf4nyyTESLBitaX7dLi8TNK`
- Policy transition used for stale-authority proof: `2esfGnkJeACsUDZArL6qh2XQ4DPWBHb1gzG459HZkZbco7KHF4aUKVKQntUVJriRQyYahSQ4Gq5Djktu7WeBmiiR`

## Runtime / source binding

The program was deployed during the rerun of workflow run `37021918279`, whose source head was:

`783ba885addd7926bc0028e56340833d13c973c5`

The successful verifier head was:

`f42a7c6ebefe8df474bdc33895f6ed62fe4498ff`

A GitHub compare from deployment-source head to verifier head shows only:

- `.github/workflows/worlds-fair-orca-devnet-proof.yml`
- `scripts/worlds-fair-orca-v1-proof.cjs`

No `programs/keys/**`, `Cargo.toml`, or other on-chain program source changed between those heads.

This proves source equivalence for the deployed program semantics. A separate non-destructive binary dump/hash comparison is being added to strengthen the binding to bit-level equivalence; until that passes, the binary-hash edge remains **ACTIVE**, not silently upgraded.

## Truth boundary

This receipt proves:

- real Solana Devnet state changes;
- load-bearing Orca CPI execution;
- load-bearing Pyth evidence/refusal behavior;
- standing authority;
- soft boundary;
- exact exceptional authority;
- mutation/replay protection;
- rollback;
- stale-authority invalidation.

It does **not** prove:

- mainnet readiness;
- production custody;
- institutional trading;
- audited production security;
- operator demand;
- willingness to pay;
- customer adoption.

Vertical Slice is an entry point, not Definition of Done.

## Bit-level runtime binding

The strengthened run rebuilt the CRESCO program for the reused Program ID and dumped the actual on-chain program bytes.

- local rebuild SHA-256: `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`
- on-chain dump SHA-256: `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`
- verdict: `WORLD_FAIR_RUNTIME_COMMIT_BINDING=PASS`

The same run then repeated the complete live CRESCO→Orca slice and receipt validation successfully.
