# Who enforces what (submitted build, 2026-10-12)

CRESCO's claim is that the capital path, not the user interface, is the guard. That is true against the
actor (the teen, strategy or agent). Against the CRESCO server itself, it depends on the workspace mode:
with the opt-in **principal-wallet guardian** (LIVE on Devnet since 2026-10-12, see
[PRINCIPAL-WALLET-GUARDIAN.md](PRINCIPAL-WALLET-GUARDIAN.md)), the principal's wallet signs every guardian
instruction. In the default mode, the guardian is a server-held Devnet key. The table describes the default
mode; the last section describes the wallet mode.

| Guarantee | Enforced by | Notes |
|---|---|---|
| The actor cannot spend above the per-action notional, period amount or period notional | **Solana program** | Checked on every swap, with a Pyth Pro price verified on-chain |
| The actor cannot act while the mandate is paused or revoked | **Solana program** | `MandateNotActive` |
| An exception covers one exact swap (amount, minimum output, price limit, deadline, mandate nonce) | **Solana program** | Allowance PDA bound to the request hash; `AllowanceActionMismatch` otherwise |
| An exception is used at most once | **Solana program** (`AllowanceAlreadyUsed`) and the API (`REQUEST_ALREADY_DECIDED`) | The 5 of 5 campaign's replay step exercised the API check; the program check is the backstop |
| An exception granted before a rule change cannot be used after it | **Solana program** | Every lifecycle change advances the nonce; stale allowances refuse |
| Only the principal (or risk owner) can approve an exception | **CRESCO API** (role tokens; bound-wallet signature) | The grant transaction is signed by the server-held guardian key |
| The principal's wallet approved this exact exception | **Solana runtime**, when a wallet is bound | Ed25519 verification of the wallet's signature inside the grant transaction; the server still signs the grant |
| Pause, resume, revoke, revise, asset-rule edits are the principal's decision | **CRESCO API** | Executed on-chain by the server-held guardian key |
| An uncertain outcome is never shown as success | **CRESCO API** | UNKNOWN until reconciled from transaction signatures |

## What a compromised CRESCO server could do (default server-guardian mode)

- Grant an exception, change limits, pause or resume, because it holds the guardian key.
- It could not make the actor exceed limits without signing as the guardian, and every such change is a
  public, signed Devnet transaction that the history and Explorer expose.

## Principal-wallet guardian mode (opt-in, LIVE on Devnet 2026-10-12)

The principal's wallet is `charter.guardian`. Creating the mandate, every exact exception
(`grant_allowance_once`), pause and resume were signed by the owner's Phantom wallet in a live Devnet run
(workspace `ws-8431126ec17347e0`, receipts in PRINCIPAL-WALLET-GUARDIAN.md). The server prepares
transactions, pays execution fees, funds the Devnet vault and co-signs a memo that grants nothing; it
cannot grant, pause, resume or change limits. It accepts only the byte-identical transaction it prepared.

Still server-side in this mode: the operator's delegate key (it acts inside the standing mandate, which is
the product) and the Devnet funding. Revoke and limit revision in wallet mode share the pause code path but
were not exercised live.
