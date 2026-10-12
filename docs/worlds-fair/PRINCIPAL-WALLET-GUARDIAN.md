# Principal-wallet guardian (opt-in)

Status on 2026-10-12: **LIVE on Solana Devnet** (opt-in), verified by the owner with Phantom; see the record at the end. Workspaces created without this option still use the server-held lab guardian, as described in `WHO-ENFORCES-WHAT.md`.

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

## Live test record (owner, Phantom, Solana Devnet, 2026-10-12)

**Result: LIVE.** Run by the owner with Phantom on Devnet. Every guardian action below was signed by the principal's wallet; the lab key only paid execution fees, funded the vault and co-signed a memo.

- Workspace: `ws-8431126ec17347e0` (Family; Maya (16) / John / Grace), limit $0.50
- Guardian (Phantom): `F1evavYnc3ScKDvfyCvws91Zj2bGAtyGzW6JyjUwSofp`, funded with 0.2 Devnet SOL from the lab guardian via the manual `devnet-fund-wallet` workflow ([tx](https://explorer.solana.com/tx/4SP3evytedi3ZHhYbzTHweJnHp7euV4xah6Qqxj63ehnHq9CuZaTEY3Tbfm4rxMfQQoCjvizvWP1g56XdyiD2FaJ?cluster=devnet))
- Deployed code: bootstrap on `10a2af5`; approvals, pause and resume on `434482e` (PR #45 fix), both auto-deployed by Cloudflare Workers Builds

| Time (ET) | Step | Result | Receipt |
| --- | --- | --- | --- |
| 15:35:27 | Bootstrap, ONE wallet-signed transaction | mandate ACTIVE, guardian = wallet | [bootstrap.wallet](https://explorer.solana.com/tx/4bHDYC7KNJ5pmwioSjTAhAt5hhu9Bw5TKoEQzzewryjQKVBDRD9eqYXTycovWF81rZGWc2RvBi8SwYiB3Juq546M?cluster=devnet) |
| 15:37:32 | Teen $0.30 | executed alone, no wallet prompt | [standing.execute](https://explorer.solana.com/tx/66QoPwpPeHQWcGBF87SpAv2j3imsaYpRmnABLkat7fuJox9h6PetzSfWFNKpapP92WbXYTYWto4cDGY91SMPPGLM?cluster=devnet) |
| 15:37:44 | Teen $0.75 | refused by the program (PythNotionalExceeded), one exact request | |
| ~15:38 | First approval attempt | `GUARDIAN_TRANSACTION_ALTERED`: Phantom rewrote the unsigned grant; nothing sent. Fixed by PR #45 (lab co-signs a memo) | |
| 15:46:02 | Parent approves (wallet-signed grant) | executed once, standing limit unchanged | [grant](https://explorer.solana.com/tx/5vvFEZ3Ykf7QP4tiMZiJZm7cUD3p7FDUxWpDke9bgGeMFE5cfWpLP7ys8jMYxp6SS2aMgoVH2v1NcmX7NFCPLe3p?cluster=devnet) · [execute](https://explorer.solana.com/tx/5QH3cn1ReQTaK4bvSc2wiwmXhzi8jFKJkKzoLWNndJTbgNS1cSDTKMf8sU8B7FXazu5nHhc1ubAP7ZpYBe9otFE3?cluster=devnet) |
| 15:46:57 | Teen $0.30 | executed alone | [standing.execute](https://explorer.solana.com/tx/23te8yx2qJBysCaV4DRhYY7KBrpWsD8ba5XKaZ9KVRVoHURDxP5r2nGhR9p8cbxaAKQ5ubv3phrE33LG9vKHQHMn?cluster=devnet) |
| 15:47:08 → 15:47:28 | Second exact request, wallet-signed approval | executed once, limit unchanged | [grant](https://explorer.solana.com/tx/24P8ss9rGmxdyYg2gVbmdfFbS9bFWtvm8wPL8Uf1UskVT2y7XjyzPykjVL9yLniCQ6mxfeWVr3z1LhHBT65FK6T4?cluster=devnet) · [execute](https://explorer.solana.com/tx/5vhqwLM1zgbYs9M4aYND7i2H6UDH3MG5jevafgz8UDXagYNWMvvEPMZXLwXgNHC8ykdDtsQYwAkUy3FFW9eL9voV?cluster=devnet) |
| 15:47:42 | Pause (wallet-signed) | PAUSED | [mandate.paused](https://explorer.solana.com/tx/2RTB79uv29sCLVFbMGS9BuYS6aq8t2sb7mqEpHfzKyTVwUMR5AaPLpyuUDdT97wW8yK5XmHJTo7VHshEnJY2jD8A?cluster=devnet) |
| 15:48:12 | Teen $0.30 while paused | refused by the program (MandateNotActive), no exception path | |
| 15:48:35 | Resume (wallet-signed) | ACTIVE | [mandate.active](https://explorer.solana.com/tx/X7VHBnyYy6RRyAUndgG733BLKprfir1QDgxEMXF6oehywWTUP8TuNYdVivm7o4seS8d21dDQMMBwN8NEa9hXrUK?cluster=devnet) |

Not covered by this run: revoke, limit revision and asset-rule edits in wallet mode (same code path as pause and resume, not exercised live), and the wallet-swap refusal (`GUARDIAN_WALLET_FIXED`, unit-tested).
