# Primer Vault vs CRESCO — Trading Residual Teardown

Date: 2026-09-26  
Status: HIGH-PRIORITY COMPETITIVE ANALYSIS

## Why Primer Vault matters

Primer Vault is the closest public reconstruction found so far for the **delegated trading** lane.

Its public implementation already provides:
- agent-specific commissioned wallet identity;
- independent re-quote;
- per-trade max;
- daily volume limit;
- max slippage;
- price-impact measurement;
- min-reserve control;
- auto-approve threshold;
- human approval queue;
- exact request persistence;
- approval expiry;
- re-quote at approval;
- policy re-evaluation at approval;
- current agent-state re-check;
- duplicate approval idempotency;
- daily-volume reservations for pending trades;
- onchain execution and receipt/history handling.

This means CRESCO cannot differentiate on:
- delegated trading;
- per-trade limits;
- daily limits;
- slippage constraints;
- price-impact controls;
- human review;
- stale quote protection;
- policy re-check before execution;
- pending-request expiry;
- replay/double-click protection.

## The important semantic distinction

Primer Vault's human approval is **not equivalent to a CRESCO exception**.

### Primer hard-policy path

From the public `TradingService._evaluate_policy` implementation:

- trading disabled → reject;
- max slippage exceeded → reject;
- per-trade max exceeded → reject;
- min reserve violated → reject;
- daily volume exceeded → reject.

These conditions remain policy failures.

A human approval does not visibly override them.

### Primer escalation path

Human approval is used when the trade is already within the hard policy but requires review, including:
- no auto-approve threshold;
- amount above auto-approve threshold while still below hard cap;
- price impact above configured review threshold;
- unknown/unavailable valuation conditions.

At approval time Primer:
1. retrieves the same pending TradeRequest;
2. re-quotes;
3. re-applies the current policy;
4. refuses if the current policy now rejects;
5. refuses if price moved beyond the original tolerance;
6. otherwise executes.

Therefore Primer currently models:

```
STANDING POLICY
    ↓
inside hard policy?
 ├─ no → REJECT
 └─ yes
      ↓
auto-safe?
 ├─ yes → EXECUTE
 └─ no → HUMAN REVIEW
              ↓
        policy still valid?
          ├─ no → REJECT
          └─ yes → EXECUTE
```

## CRESCO's potentially different path

CRESCO's existing `execute_once_with_pyth` path deliberately does not re-apply the ordinary max-action boundary in the same way as normal `execute_within_mandate_with_pyth`.

It requires:
- Mandate active;
- correct Mandate nonce;
- enabled asset/action;
- exact one-time allowance;
- exact approved notional;
- valid Pyth evidence;
- one successful use.

This permits a principal-authorized exceptional action to cross the normal standing action boundary while the standing Mandate remains unchanged.

Conceptually:

```
STANDING MANDATE
    ↓
inside normal policy?
 ├─ yes → autonomous EXECUTE
 └─ no → REFUSE
           ↓
     SOFT boundary?
      ├─ no → HARD REFUSE
      └─ yes
           ↓
     principal may issue
     EXCEPTIONAL AUTHORITY
           ↓
     execute once
           ↓
     standing Mandate unchanged
```

This is a **real semantic residual** versus Primer's public trading flow.

## Why this matters

The difference is not:

> human approval vs no human approval.

It is:

> **review within standing authority** vs **issuing new exceptional authority without changing standing authority**.

Primer:
- human says yes to a trade that still satisfies the current hard policy.

CRESCO hypothesis:
- principal may say yes to a legitimate trade that does **not** satisfy one selected soft standing constraint;
- the exception is bounded and consumed;
- the ordinary standing constraint remains unchanged afterward.

Example:

```
Standing Mandate:
max trade = $100

Trade:
$140 SOL/USDC

Primer-style hard cap:
REJECT unless policy is changed.

CRESCO-style soft cap:
REFUSE normal path
→ principal sees +$40 Policy Diff
→ Allow this exceptional trade once
→ trade executes
→ standing max remains $100
```

## Important caveat

This does **not** prove CRESCO is superior.

Many mature trading systems may already support true one-trade risk overrides.

The key user question is:

> When a legitimate trade should cross a hard/standing risk limit, does the desk want to:
> - resize/abandon it;
> - temporarily widen the limit;
> - permanently edit the risk policy;
> - approve one exact trade;
> - approve a short-lived risk envelope?

## Other Primer findings that narrow CRESCO

### Stale-policy residual mostly collapses

Primer re-applies the **current** policy when a pending trade is approved.

Tests explicitly cover:
- trading switched off while pending;
- per-trade cap tightened while pending;
- price moved while pending.

So CRESCO cannot use “policy changed before approval” as a unique Trading feature.

### Quote staleness residual collapses

Primer re-quotes on approval and checks the fresh quote against the original minimum-output tolerance.

### Pending-budget race residual collapses

Primer reserves daily-volume capacity while trades wait for approval, preventing multiple pending trades from collectively exceeding the cap.

### Exact router allowance hygiene

Primer approves the exact token amount needed for a swap rather than infinite ERC-20 allowance.

## Residual questions worth testing

1. Do real desks need **one-trade override of a hard risk limit**?
2. Which limits are soft vs never exceptionable?
3. Is an exact trade override preferable to a temporary risk envelope?
4. Should a policy change after exception issuance invalidate the exception?
5. Does atomic onchain exception + trade execution matter?
6. Does explicit Policy Diff matter to risk/compliance operators?
7. Do existing OMS/RMS products already solve all of this adequately?

## Outreach

Primer Systems contacted at:
- [contact redacted]
- 2026-09-26

Discovery focus:
- what users do when a legitimate trade exceeds `per_trade_max`;
- whether they edit policy;
- whether one-off exceptions are requested;
- why some rules are hard rejects while others escalate;
- whether exceptional authority should remain separate from standing policy.

## Kill condition

Kill the delegated-trading wedge if:
- hard-limit crossings are rare/non-legitimate;
- desks prefer policy edits or temporary envelopes already well-served by existing RMS;
- true one-trade overrides already exist everywhere that matters;
- CRESCO's atomic/onchain semantics add no meaningful value.

## Survive condition

The lane strengthens only if operators confirm a recurring workflow shaped like:

```
standing risk limit blocks legitimate trade
→ policy should NOT be permanently widened
→ one bounded exceptional authorization is desirable
→ audit/stale/atomic semantics matter
```
