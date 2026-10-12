# Delegated Trading Boundary Taxonomy

Date: 2026-09-26
Status: PRE-CONCEPT-LOCK / DESIGN HYPOTHESIS

## Purpose

Define which standing-risk boundaries could plausibly support exceptional authority and which must remain non-exceptionable.

This is not final product policy. Direct operator discovery may change the classification.

## Core rule

A REFUSE does not automatically imply an escalation path.

Every evaluated rule must declare its boundary class:

```
HARD
SOFT_EXACT
SOFT_ENVELOPE
EVOLVABLE_ONLY
UNKNOWN_FAIL_CLOSED
```

## Boundary classes

### HARD

No delegate-originated exception path.

Use when allowing the action would undermine the integrity of the authority system itself.

Candidate examples:
- Mandate revoked;
- Mandate paused;
- wrong delegate / signer;
- unsupported execution program;
- malformed action;
- action cannot be deterministically decoded;
- capital path cannot verify execution semantics;
- critical evidence is cryptographically invalid.

Result:

```
REFUSE
NO EXCEPTION REQUEST
```

### UNKNOWN_FAIL_CLOSED

The system cannot establish required evidence.

Candidate examples:
- stale/unknown Pyth evidence;
- unavailable required oracle;
- unparseable market state;
- execution adapter cannot verify required accounts/instruction shape.

Result:

```
UNKNOWN / REFUSE
NO AUTHORITY CREATED FROM ABSENCE OF EVIDENCE
```

This preserves:
> Evidence can restrict authority; evidence cannot grant authority.

### SOFT_EXACT

A legitimate action may exceed the normal standing boundary, but the principal may authorize exactly that action once.

Best current candidate:
- per-trade notional.

Example:

```
standing max = $100k
requested trade = $140k
other dimensions compliant

→ REFUSE normal authority
→ Policy Diff: NOTIONAL +$40k
→ principal grants exact trade
→ execute once
→ standing max remains $100k
```

### SOFT_ENVELOPE

The workflow may require a bounded temporary range rather than one exact action.

Candidate examples:
- temporary volatility regime;
- temporary spread/slippage adjustment;
- event-driven increased size for a short period.

Possible shape:

```
max_notional = $140k
venue = X
pair = SOL/USDC
expires = +10 min
aggregate_exception_budget = $280k
max_uses = 3
```

This is NOT allowed into the MVP unless discovery shows exact-action is too restrictive.

### EVOLVABLE_ONLY

The principal may change this standing rule, but not through a one-off delegate exception.

Candidate examples:
- delegate identity;
- authorized venue list;
- strategy role;
- core asset universe;
- long-lived leverage regime;
- persistent position/exposure policy.

Result:

```
REFUSE
→ optional recommendation to change Mandate
→ explicit vN → vN+1 transition
```

## Candidate trading dimensions

| Dimension | Working class | Why | Discovery question |
|---|---|---|---|
| Mandate active/revoked | HARD | authority root | should any exception survive revoke? likely no |
| Delegate identity | HARD | principal/delegate binding | can substitute delegate ever be legitimate? |
| Supported program/adapter | HARD | execution-integrity boundary | should a new venue require full policy change? |
| Action parsability | HARD | cannot authorize unknown semantics | none |
| Oracle signature validity | HARD | evidence authenticity | none |
| Oracle freshness | UNKNOWN_FAIL_CLOSED | market evidence unavailable/stale | ever allow with alternate evidence? |
| Per-trade notional | SOFT_EXACT candidate | canonical exceptional-trade use case | exact vs temporary envelope? |
| Daily/period volume | SOFT_EXACT or SOFT_ENVELOPE | one legitimate trade may cross remaining daily budget | does exception consume/raise period budget? |
| Price impact | SOFT_EXACT candidate | Primer already escalates this to human review | should high impact ever exceed standing max? |
| Slippage tolerance | HARD or SOFT_EXACT | Primer treats as hard; may represent execution quality | do desks ever override max slippage per trade? |
| Venue allowlist | EVOLVABLE_ONLY candidate | new venue changes risk model materially | ever approve one trade on new venue? |
| Asset allowlist | EVOLVABLE_ONLY candidate | new asset changes risk universe | ever approve one exceptional asset? |
| Drawdown limit | HARD candidate | indicates strategy-level risk stop | are overrides ever permissible? |
| Leverage cap | HARD/EVOLVABLE_ONLY candidate | systemic blast-radius control | trade-specific override or policy change? |
| Position concentration | HARD/SOFT candidate | context dependent | one trade exception or risk-policy change? |
| Deadline | HARD for expired action | stale intent | should principal re-authorize a new action instead? |

## Post-exception counter semantics

This is a critical design question.

Example:

```
Daily standing budget = $500k
Already used = $450k
Exceptional exact trade = $100k
```

After execution, what is the normal standing state?

Possible semantics:

### Model A — exception counts against standing period

```
spent = $550k
standing remaining = $0
normal trades blocked until reset
```

The exception does not expand the period budget.

This is conservative and matches the principle:
> exceptional authority does not mutate standing authority.

### Model B — exception has separate exceptional ledger

```
standing spent = $450k
exceptional spent = $100k
standing remaining = $50k
```

The principal authorized $100k outside the standing budget without consuming the remaining standing budget.

This treats normal and exceptional authority as independent buckets.

### Model C — dimension-specific

Some exceptional dimensions affect standing counters; others do not.

Example:
- trade size exception still increments period volume;
- venue exception does not alter any numeric budget;
- slippage exception records separate risk evidence.

**Do not choose without operator evidence.**

Current CRESCO baseline behaves closer to Model A for its amount/notional counters:
the exceptional execution updates the period counters even though it bypasses the normal per-action boundary.

## Hard boundary principle

A hard boundary must not expose:

```
"Ask for more room"
```

Otherwise the UI teaches the delegate that every safety condition is negotiable.

Instead:

```
HARD REFUSE
reason
required remediation
```

Example:
- stale evidence → refresh evidence;
- revoked Mandate → principal must create/reactivate authority through the authorized policy path;
- unsupported venue → no execution.

## Soft boundary UX

A soft boundary may expose:

```
REFUSED UNDER NORMAL AUTHORITY

Why:
NOTIONAL +$40k

Available principal actions:
- Decline
- Authorize this exception
- Change standing Mandate
```

The delegate does not choose the outcome.

## Policy Diff structure — conceptual

```
PolicyDiff {
  mandate_version
  mandate_nonce
  action_hash
  violations: [
    {
      dimension,
      standing_value,
      requested_value,
      delta,
      boundary_class
    }
  ]
}
```

This is evidence, not authority.

## Exceptional Authority structure — conceptual

Only after principal action:

```
ExceptionalAuthority {
  principal
  delegate
  source_mandate
  source_nonce
  action_or_scope
  allowed_deltas
  expires_at
  uses
  status
}
```

The exact schema is deliberately not implementation-ready yet.

## Key product test

The strongest user-discovery question now becomes:

> Which risk limits are genuinely soft enough that you sometimes want one trade to cross them without changing the standing policy?

Follow with:

> What should happen to every other limit and counter after that exceptional trade?

If operators cannot identify recurring soft boundaries, the Delegated Capital thesis weakens substantially.

## Demo implication

The killer demo should use **one unmistakably soft boundary** and **one unmistakably hard boundary**.

Example:

```
SOFT:
max trade $100 → request $140
→ exceptional authority possible

HARD:
unsupported venue/program
→ REFUSE
→ no Allow Once option
```

This proves CRESCO is not simply “a button to override risk controls.”
