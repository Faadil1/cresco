# Who enforces what (submitted build, 2026-10-12)

CRESCO's claim is that the capital path, not the user interface, is the guard. That is true against the
actor (the teen, strategy or agent). It is not yet true against the CRESCO server itself. This page says
exactly where the line is today.

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

## What a compromised CRESCO server could do today

- Grant an exception, change limits, pause or resume, because it holds the guardian key.
- It could not make the actor exceed limits without signing as the guardian, and every such change is a
  public, signed Devnet transaction that the history and Explorer expose.

## What closes the gap

Make the principal's own wallet the on-chain guardian. The program already requires the guardian's
signature for `initialize_charter`, `transition_mandate`, `configure_mandate_policy`, `set_mandate_status`,
`update_asset_rule` and `grant_allowance_once`; no program change is needed. The server would prepare
transactions and the principal's wallet would sign and pay for them. Until then, the guardian is a
server-held Devnet key and CRESCO does not claim non-custodial approval.
