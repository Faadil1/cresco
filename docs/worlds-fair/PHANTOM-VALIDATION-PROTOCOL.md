# Phantom validation protocol: principal-wallet guardian (PR #40)

Run by the owner. **Completed on 2026-10-12: LIVE.** The full record with Explorer receipts is in [PRINCIPAL-WALLET-GUARDIAN.md](PRINCIPAL-WALLET-GUARDIAN.md#live-test-record-owner-phantom-solana-devnet-2026-10-12).

## Preconditions

1. PRs merged in this order: #38, #39, #40. Both Workers have been redeployed from that commit: the API Worker, plus the frontend with `npm install` in `apps/web` (new dependency `@solana/web3.js`). Note the deployed commit hash.
2. Phantom: Settings, Developer settings, Testnet mode on, network **Solana Devnet**.
3. The Phantom wallet holds about 0.1 Devnet SOL. It pays rent for the charter, mandate, asset rule and vaults.
4. The lab guardian has enough Devnet SOL and devUSDC (it funds the workspace delegate and vault).

## Steps and expected results

| # | Action | Expected | Fails closed if |
| --- | --- | --- | --- |
| 1 | Open `/worlds-fair/desk?case=family`, tick "My wallet is the on-chain guardian", create | Workspace created, truth boundary `PRINCIPAL_WALLET_NON_CUSTODIAL` | no wallet: bootstrap is refused with `PRINCIPAL_WALLET_REQUIRED` |
| 2 | Parent view: "Connect the guardian wallet", sign the binding message | `WALLET_BOUND` in history | |
| 3 | "Sign and create the mandate", approve in Phantom | ONE transaction signed by your wallet, then READY | signing another wallet: "Connect the guardian wallet ..." |
| 4 | Explorer: open the charter account | `guardian` = your Phantom address | |
| 5 | Teen view: $0.30 | executes alone (no Phantom prompt) | |
| 6 | Teen view: $0.75 | refused, one exact request | |
| 7 | Parent: Approve exactly once, sign in Phantom **within 90 s** | grant signed by your wallet, then EXECUTED, standing authority changed: no | after 90 s: `GUARDIAN_OP_EXPIRED`, repeat the approval |
| 8 | Parent: Pause, sign in Phantom | mandate PAUSED only after your signature | |
| 9 | Teen: $0.30 while paused | refused, hard boundary | |
| 10 | Parent: Resume, sign | ACTIVE | |

Negative checks (optional):
- Reject in Phantom at step 7: the request stays PENDING and nothing is granted.
- Try to bind a second wallet after step 3: refused with `GUARDIAN_WALLET_FIXED`.

## Record

Filled on 2026-10-12: see [PRINCIPAL-WALLET-GUARDIAN.md](PRINCIPAL-WALLET-GUARDIAN.md#live-test-record-owner-phantom-solana-devnet-2026-10-12). Workspace `ws-8431126ec17347e0`, guardian `F1evavYnc3ScKDvfyCvws91Zj2bGAtyGzW6JyjUwSofp`.
