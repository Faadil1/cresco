# CRESCO World Fair — Uncertain-run recovery procedure

Status: **SOURCE-ONLY PROPOSED / NOT DEPLOYED**  
Related pull request: `Faadil1/cresco#32`  
Evidence class: `LOCAL` tests only. No new live transaction is implied.

## Scope

This procedure applies to the fixed World Fair `CANONICAL_LIVE` Operator Lab run
on Solana Devnet. It does not implement a secure operator authentication
system, arbitrary trades, mainnet support, or an automatic recovery mechanism.

## Contract

- `GET /api/v0.3/worlds-fair/run-status` is read-only.
- `AVAILABLE`: no known in-progress run or server-detected unresolved run.
  **Not** proof that a browser-lost prior run had no on-chain effect.
- `BUSY`: a durable lease is active. Do not launch a parallel run.
- `RECONCILIATION_REQUIRED`: a server-side run had unknown final outcome
  or the lease expired without confirmed release. Subsequent live POSTs
  are refused, with no automated override.
- `UNKNOWN`: the status service itself is unavailable. Never infer
  `AVAILABLE` or `PASS`.

## Operator recovery — human-gated, no writes

1. Stop live triggering and preserve the API response, diagnostic, partial
   receipt, request time, relevant GitHub run ID and deployed Worker identity.
2. Read the run-status endpoint, but do not use its `AVAILABLE` result as
   proof of zero effects after a browser timeout.
3. Read the current public runtime **without `ensure`** and record the
   mandate nonce, asset-rule spent counters, input/output vault balances.
4. Read Solana Devnet confirmations for any known signatures and the
   transaction history of the relevant Mandate/asset-rule/vault accounts.
   Compare with the last verified before-state. Distinguish confirmed,
   failed, pending, absent, and unobservable effects.
5. Preserve `UNKNOWN` wherever RPC, transaction status or before-state
   evidence is insufficient. **Never perform a blind replay**.
6. If an earlier attempt was confirmed, mark its consequence in the evidence
   graph even when the HTTP client missed the response.
7. Escalate to the authorized product/operations owner for a separately
   designed and reviewed administrative recovery mechanism. No public
   `reset`, override token or automatic quarantine-clear endpoint exists.
8. Authorize a new live operation only as a new, explicit protected action,
   with reconciled state and a new execution/intent identity. An expired
   lease or manually observed `AVAILABLE` is not authorization.

## Remaining P0 gaps

- Authenticated separation of operator, principal and risk-owner roles.
- Durable request/intent identity and idempotency across client timeout,
  Worker restart, browser reload and final receipt recovery.
- Operator-visible last confirmed receipt and exact chain signature binding.
- Secure administrative release after independent chain reconciliation.
- Bounded economic / spam control for an anonymous live shared Devnet wallet.
- External clean-room tests of negative and recovery paths.
- Explicit concurrency serialization for manual GitHub live workflows,
  independently of the hosted Durable Object lock.

## Negative evidence retained

The historical PR #19–#28 failures, especially partial on-chain effects
without complete receipts, remain negative events. A passing offline or
simulated regression suite is **not** equivalent to live reliability or
post-deployment recovery proof.
