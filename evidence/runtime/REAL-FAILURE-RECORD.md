# Real Failure Record

This file preserves concrete failures that materially shaped the current build.

## 1. Devnet funding blocked

Date: 2026-09-23

Signal:
The Solana program build path was ready for an external Devnet deployment proof.

Negative event:
The Devnet payer had 0 lamports and faucet attempts were rate-limited.

Observable impact:
The program could not be truthfully claimed as deployed.

Design lesson:
A successful compile is not a successful deployment. External prerequisites must fail explicitly instead of being hidden behind a green-looking demo.

Response:
The proof path retained the explicit BLOCKED_FUNDING state. A later run used a funded Devnet-only signer and produced a verifiable deployment.

Initial run:
https://github.com/Faadil1/keys/actions/runs/35890663439

## 2. Exact one-time action mismatch

Date: 2026-09-25

Signal:
Allow once should let a guardian approve one exception without changing standing authority.

Negative event:
A guardian-approved $12 request was materially changed to $11 before execution.

Observable impact:
The Solana path refused with AllowanceActionMismatch. The changed action did not execute and the one-time permission remained available for the exact approved action.

Design lesson:
A one-time exception must not behave like a generic ceiling. The approved action itself must be bound.

Response:
The deployed program binds the permission to the request, execution asset, Mandate nonce, exact notional, and one successful use. The exact $12 action executes. Standing Key stays v7 to v7. Replay refuses with AllowanceAlreadyUsed.

Canonical run:
https://github.com/Faadil1/keys/actions/runs/36150024852

Detailed proof:
../solana/ALLOW-ONCE-EXACT-ACTION-CANONICAL-PROOF-2026-09-25.md
