# Principal-wallet guardian (opt-in)

Status on 2026-10-12: **LOCAL**. The code is in place and covered by unit tests, and the web build passes. It is **not LIVE** until a Devnet run with a real wallet (Phantom) is recorded below. Until then, the claims in `WHO-ENFORCES-WHAT.md` about the server-held guardian still describe every deployed workspace.

## What changes

A workspace created with `guardianMode: "principal-wallet"` makes the principal's own wallet the on-chain guardian of the CRESCO mandate (`charter.guardian`). Every instruction the program gates on `has_one = guardian` must then carry that wallet's signature. The server cannot produce it.

| Action | Server guardian (default) | Principal-wallet guardian |
| --- | --- | --- |
| Create charter, mandate, asset rule, vaults, policy | Server key signs, several transactions | Wallet signs **one** transaction the server prepared (the workspace delegate pre-signs as charter beneficiary) |
| Approve one exact exception (`grant_allowance_once`) | Server signs after a role token or a wallet-signed message | Wallet signs the grant transaction itself |
| Pause, resume, revoke, revise limits, edit asset rule | Server key | Wallet |
| Standing execution inside the mandate | Workspace delegate, fees paid by the lab key | Unchanged |
| Execute the granted exception once | Delegate, after the grant | Delegate, right after the wallet-signed grant confirms, with the same Pyth message and quote bounds |
| Fund delegate SOL and Devnet vault | Lab key | Lab key (Devnet convenience; no authority over the mandate) |

The server checks that the signed transaction is **byte-for-byte the message it prepared** and that every signature verifies before it sends anything (`WORLD_FAIR_GUARDIAN_TRANSACTION_ALTERED`, `WORLD_FAIR_GUARDIAN_SIGNATURE_INVALID`). Each prepared transaction can be submitted once, within 90 seconds.

Wallet-guardian workspaces get their own delegate (and so their own charter), so they can never collide with a server-guardian mandate. Once the mandate exists, the bound wallet cannot be swapped (`GUARDIAN_WALLET_FIXED`).

## What it does not change

- A compromised server can still prepare a transaction. It cannot make the wallet sign it, and the wallet shows what it signs.
- The delegate key for standing executions is still derived server-side. Inside the standing mandate the operator acts alone; that is the product.
- Replay of an exception is refused by the program (the allowance is single-use and bound to the exact request hash), not only by the API.
- Devnet only. No mainnet, no production custody.

## API

- `POST /workspaces` with `guardianMode: "principal-wallet"`.
- Bind the wallet (`POST /principal/wallet`) before bootstrap.
- Guardian actions answer `202 { needsGuardianSignature: { opId, kind, label, guardian, transaction, expiresAt, submitTo } }`.
- `POST /workspaces/{id}/guardian/submit { opId, signedTransaction }` (principal token) sends it and finishes the operation: READY after bootstrap, `EXECUTED` after a grant, the lifecycle event after a pause or limit change.

## Live test record

To fill in after the Phantom run on Devnet (workspace id, wallet, bootstrap signature, grant signature, execution signature). If this section stays empty, the mode is not claimed.
