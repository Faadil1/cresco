# CRESCO World’s Fair — Manual Hosted Intermittent UNKNOWN

Date: 2026-10-03  
Status: **NEGATIVE EVENT OBSERVED — RELIABILITY GAP ACTIVE**  
Truth state: **OBSERVED**

## Context

A manual browser recording of the public CRESCO Cloudflare runtime was reviewed after the prior automated browser 7/7 proof.

Public frontend:
`https://cresco.faadil-casecraft.workers.dev`

Observed manual path:
- normal CRESCO navigation worked;
- `/worlds-fair` loaded;
- runtime state reached `Ready`;
- Mandate nonce shown: `7`;
- user clicked **Run live authority sequence**;
- the live run remained active for roughly tens of seconds;
- the browser then displayed:
  `Live outcome is UNKNOWN: WORLD_FAIR_LIVE_RUN_UNCONFIRMED`.

## Interpretation

This does **not** invalidate the earlier browser-triggered 7/7 PASS. It proves instead that the hosted live-run path is currently **intermittent**.

Therefore:
- end-to-end capability is proven;
- repeatable judge/operator reliability is **not** yet proven;
- technical self-serve must not be promoted as stable while this intermittent UNKNOWN remains reproducible.

## Observability gap discovered

At the time of this manual failure:
- backend errors carried a generic outer code plus an internal message;
- the frontend surfaced only `WORLD_FAIR_LIVE_RUN_UNCONFIRMED`;
- the browser did not expose the exact failed phase;
- no partial receipt / last-confirmed-effect ledger was shown.

As a result, the manual recording cannot distinguish whether the failure occurred in:
- RPC read/rate-limit;
- Pyth evidence fetch;
- Orca quote;
- standing execution;
- exact exception;
- rollback;
- stale-authority transition;
- transaction confirmation.

## Required repair

1. Add phase-aware diagnostics to the live provider.
2. Return only sanitized reason codes/messages to the public API.
3. Preserve a partial fail-closed receipt with completed phases and confirmed effects.
4. Distinguish:
   - safe read retry;
   - state reconciliation required;
   - non-retryable invariant/semantic failure.
5. Improve Solana signature reconciliation without blindly resubmitting uncertain writes.
6. Repeat real hosted browser runs after deployment.

## Gate effect

Until repaired and re-proven, classify hosted self-serve as:

`HOSTED_SELF_SERVE_PARTIAL__INTERMITTENT_LIVE_RUN`

Do not claim stable/repeatable judge self-serve.

The independent external-human validation gap remains separate.
