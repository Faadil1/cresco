# Killer Demo Specification — Trading vs Treasury

Date: 2026-09-26  
Status: DESIGN SPEC ONLY / NO BUILD AUTHORIZATION

## Purpose

Define the shortest honest demonstration that would make each surviving concept legible to a World’s Fair judge.

The demo must prove mechanism, not simulate success.

---

# Demo T — Delegated Capital Mandate

## Judge takeaway in one sentence

> **The strategy can trade by itself, but crossing one risk boundary does not give it broader future authority.**

## 90-second spine

### 0–15s — Establish useful autonomy

Show:

```
Principal capital: demo USDC
Delegate: trading strategy
Mandate v7:
  venue = selected Solana venue
  pair = SOL/USDC
  max notional = $100
  price/slippage boundary = configured
```

Two ordinary actions execute without human approval.

Screen language:
**Inside mandate → autonomous.**

### 15–30s — Real boundary

Strategy proposes an otherwise plausible trade that violates one soft parameter.

Example:

```
requested notional: $140
standing max: $100
all other dimensions: compliant
```

CRESCO refuses.

Show explicit Policy Diff:

```
PAIR        ✓
VENUE       ✓
PRICE       ✓
NOTIONAL    ✕  +$40
```

Screen language:
**Refused before capital moves.**

### 30–50s — Exceptional authority

Principal sees three conceptually separate actions:

- Decline
- Allow exceptional action
- Change standing Mandate

For the demo:
choose **Allow exceptional action**.

The authorization should display:
- source Mandate version / nonce;
- exact or bounded exceptional semantics;
- expiry;
- use count;
- post-execution standing authority.

### 50–65s — Mutation test

Before execution, mutate one meaningful field.

Preferred human-readable mutation:
- venue changes; OR
- pair/destination changes; OR
- notional changes beyond exceptional shape.

Result:
**REFUSE — authorization no longer matches.**

Do not use only $140 → $139 as the primary visual; keep an “even a smaller changed action fails” proof as technical depth.

### 65–80s — Exact execution

Restore authorized action.

Execute.

In the same Solana transaction:
- evaluate authority;
- evaluate market/risk evidence;
- execute supported trading CPI;
- update counters;
- consume exceptional authority.

Show confirmed transaction.

### 80–90s — State invariant

Immediately replay.

Result:
**REFUSE — exception consumed.**

Then show:

```
Standing Mandate:
v7
max notional = $100
UNCHANGED
```

Closing line:
**The exception moved. The boundary did not.**

## Hostile proof extensions

### Stale Mandate

Issue exception under v7.

Before execution:
principal changes relevant standing risk policy → v8.

Attempt old exception.

Expected:
REFUSE / STALE.

### Hard boundary

Attempt prohibited venue/program.

Expected:
REFUSE with **no exceptional path**.

### Oracle/evidence failure

Use stale Pyth evidence.

Expected:
UNKNOWN/REFUSE, never ALLOW.

## What this demo must NOT imply

- mainnet institutional trading;
- broker-dealer functionality;
- profitable strategy;
- real customer capital;
- universal DeFi risk engine;
- arbitrary CPI safety.

## Technical scope if selected

One:
- venue;
- pair;
- explicit action type;
- constrained adapter.

No arbitrary CPI.

---

# Demo R — Treasury Intent Firewall

## Judge takeaway in one sentence

> **A signer’s approval is only valid for the transaction semantics they independently verified — not whatever a compromised interface puts underneath the button.**

## 90-second spine

### 0–15s — Establish standing treasury authority

```
Treasury Mandate v7:
USDC
approved Vendor A
normal max = $50k
ordinary transfers only
```

Show one ordinary payment succeeding autonomously or through normal delegated flow.

### 15–30s — Legitimate exception

Create:

```
$75k USDC → Vendor A
```

CRESCO refuses normal execution.

Policy Diff:

```
ASSET       ✓
RECIPIENT   ✓
ACTION      ✓
AMOUNT      ✕ +$25k
```

Principal chooses exact/bounded exceptional authorization.

### 30–55s — Compromised representation attack

Now simulate a compromised frontend.

Visible UI attempts to show:
```
$75k → Vendor A
```

But raw transaction bytes contain one of:
- different destination;
- different program;
- authority-changing instruction;
- unsupported instruction shape.

An independent decoder/verification surface reconstructs the actual semantics.

Result:
**SEMANTIC MISMATCH / HARD REFUSE.**

Critical message:
**The UI is not the guard. The reviewed semantics are bound to the executed action.**

### 55–75s — Correct transaction

Restore legitimate transaction bytes.

Independent semantics match approval.

Execute atomically.

Exceptional authority consumed.

### 75–90s — Replay + unchanged authority

Replay:
REFUSE.

Show:
```
Standing treasury max = $50k
Mandate v7 unchanged
```

Close:
**Yes to this. Not yes to everything.**

## Hard-boundary proof

Attempt a program-authority/delegate-style mutation.

Instead of “Ask for approval”:

**HARD REFUSE — not exceptionable through this workflow.**

This is important: not every boundary becomes an escalation prompt.

## What this demo must NOT imply

- that exact hashing alone prevents UI compromise;
- that current CRESCO already has trusted semantic decoding;
- that it would have prevented Bybit;
- production custody;
- Safe replacement;
- audited treasury security.

---

# Demo collision

| Requirement | Trading | Treasury |
|---|---|---|
| Uses current CRESCO primitives | Higher | Medium |
| New semantic decoder required | Low | High |
| Pyth naturally relevant | High | Optional |
| Atomicity visible | High | High |
| Policy Diff visible | Excellent | Excellent |
| Mutation proof | Excellent | Excellent |
| Real-negative-event narrative | Strong | Extremely strong |
| 90s comprehensibility | Strong | Extremely strong |
| Regulatory/custody narrative risk | Medium | Medium–High |
| Build delta after Concept Lock | Medium | Medium–High |

## Current demo conclusion

### Trading
Better continuity from the existing CRESCO code and more natural Pyth/Solana usage.

### Treasury
Stronger human “aha,” but only if CRESCO adds trusted semantic verification; otherwise the Bybit narrative becomes misleading.

Do not select based on demo quality alone.
