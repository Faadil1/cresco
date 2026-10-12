# CRESCO World’s Fair — Demo-First Architecture

Date: 2026-10-01  
Status: CONVERGED_FOR_BUILD

## Judge memory sentence

**A strategy can trade by itself, but one exceptional trade never becomes broader future authority.**

## 0–15 seconds

Show:
- Principal;
- Strategy;
- Standing Mandate;
- Orca devnet pair;
- per-trade notional limit.

Start a real in-bound swap immediately.

## 15–30 seconds

Second in-bound swap executes.

Then submit an otherwise valid swap over the standing notional limit.

Result:
`REFUSE_UNDER_STANDING_AUTHORITY`.

Show Policy Diff:
- program ✓
- pool ✓
- pair ✓
- evidence ✓
- notional ✕

## 30–50 seconds

Principal chooses:
**Authorize this exact exception**.

Show:
- source Mandate nonce;
- action hash;
- amount;
- pool/pair;
- expiry;
- uses = 1;
- standing Mandate after execution = unchanged.

## 50–65 seconds

Mutate output/pool or another material semantic field.

Expected:
`REFUSE_EXCEPTION_MISMATCH`.

## 65–80 seconds

Restore the exact authorized action.

One Solana transaction:
- authority checks;
- market/notional evidence;
- Orca CPI swap;
- counters;
- exception consumption.

Show confirmed signature/receipt.

## 80–90 seconds

Replay.

Expected:
`REFUSE_EXCEPTION_ALREADY_USED`.

Show:
- Standing Mandate version unchanged;
- normal max unchanged.

Close:
**The exception moved. The boundary did not.**

## Fast hostile extensions

- stale Mandate → old exception refuses;
- unsupported program/pool → hard refuse, no exception CTA;
- stale Pyth → UNKNOWN/REFUSE;
- forced Orca failure → rollback / no false success.

## Architecture

```
Web / API
   ↓
Canonical CRESCO application service
   ↓
TradeActionV0 canonicalizer
   ↓
Mandate + boundary evaluator
   ↓
Policy Diff
   ↓
Principal exceptional approval when soft
   ↓
CRESCO Solana program
   ├─ Mandate / nonce / semantic checks
   ├─ Pyth verification where material
   ├─ constrained Orca CPI
   ├─ counters
   └─ exception consumption
   ↓
Receipt / telemetry
```

## Runtime modes

Primary:
- LIVE DEVNET

Secondary fallback:
- deterministic replay of previously captured receipts

Fallback must be visibly labeled and cannot satisfy a live claim.
