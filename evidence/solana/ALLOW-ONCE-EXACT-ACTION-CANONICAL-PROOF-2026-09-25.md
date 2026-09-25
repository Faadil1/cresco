# ALLOW_ONCE Exact-Action Canonical Devnet Proof — 2026-09-25

Status: **PASS**

- Canonical program: `ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk`
- Workflow run: `https://github.com/Faadil1/keys/actions/runs/36150024852`
- Demo signer: `FuKsZH234Zcy11rXPHWwiPwyuhLjth7brBVsd5BD5Nzk`
- Grant signature: `3iWZ7HgZbo2gnuRUS4LPJeQRjvuHDJB1NexkCbnoGDTUvUV2do3t1LzjGkAx9Ydw2Sd52cy5k9kKvC2ATw84wqWy`
- Allowance receipt: `Hz8hoUnGbrSsGdbsfcg9rcYC6W3jGCWhWtgp5Buxw7y9`
- Approved execution signature: `2poU6T2VD64nTXfjFYTMTb57hRjiVqyzua8Lb1x1BLCKcyg9C6jPK8NduR9z18JbNsZHRphdDWYdS35JnFPTr2gD`

## Proven sequence

1. Guardian-approved one-time request: **$12**.
2. Materially changed execution attempt: **$11**.
3. Result: **REFUSE / `AllowanceActionMismatch`** before allowance consumption.
4. Approved **$12** action then executed successfully on Solana Devnet.
5. Standing Mandate version before: **7**.
6. Standing Mandate version after: **7**.
7. `standingAuthorityChanged=false`.
8. Replay of the consumed one-time permission: **REFUSE / `AllowanceAlreadyUsed`**.

## Judge-safe claim

> One request. One exact approved amount. One successful use. The standing Key does not move.

## Truth boundary

- Demo SPL token only.
- Server-held Devnet demo signer.
- No brokerage/custody claim.
- No real minor securities execution.
- No mainnet claim.
- Pyth-derived USD notional is used in the execution path.

## Additional real-negative proof preserved

The same canonical run also preserved an exhausted period boundary instead of resetting state for a prettier smoke:

`PYTH_PERIOD_NOTIONAL_EXCEEDED` → `REAL_NEGATIVE_EVENT_PRESERVED`.
