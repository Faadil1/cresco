# Negative Event Map — Trading + Treasury

Date: 2026-09-26  
Status: PRE-CONCEPT-LOCK / EVIDENCE MAP

## Rule

A real incident is useful only if the product response maps causally to the failure.

Do not claim “CRESCO would have prevented X” unless the mechanism actually blocks the demonstrated failure mode.

---

## A. Delegated Trading / Capital Mandates

### Positive signal / opportunity

Automated trading provides major execution-speed and efficiency benefits, but the same automation can amplify a small implementation or control error extremely quickly.

Primary source:
- SEC Knight Capital order / press release:
  - https://www.sec.gov/newsroom/press-releases/2013-222
  - https://www.sec.gov/litigation/admin/2013/34-70694.pdf

### Concrete negative event — Knight Capital, 2012

On 1 Aug 2012, Knight Capital’s automated router malfunctioned after a faulty software deployment.

SEC findings:
- more than 4 million executions;
- more than 397 million shares traded;
- several billion dollars of unwanted long/short positions;
- more than $460M loss;
- the incident unfolded over roughly 45 minutes.

The SEC specifically found inadequate controls immediately before market submission and inadequate aggregate capital-threshold controls.

### Observable impact

- >$460M loss;
- massive unwanted positions;
- severe firm-level solvency stress;
- later enforcement and $12M SEC settlement.

### Design implication

A delegated strategy must not be able to convert:
- software malfunction;
- stale code;
- loop behavior;
- corrupted strategy output

into unbounded capital execution merely because the delegate possesses a valid signing/execution credential.

Controls should exist **at the execution boundary**, not only in the strategy process.

Required control families:
- per-action notional;
- aggregate / period exposure;
- allowed venue/program;
- allowed assets;
- rate/frequency;
- price/slippage;
- kill/pause/revoke;
- fail-closed evidence;
- observable hard vs soft boundaries.

### What current CRESCO could plausibly help with

Current CRESCO already proves:
- max action notional;
- max period notional;
- per-asset amount;
- period counters;
- Pyth price/freshness/confidence;
- pause/revoke;
- capital-path refusal;
- atomic Solana execution state.

A future delegated-trading adapter could therefore bound the capital blast radius of certain erroneous strategy outputs.

### What CRESCO would NOT solve

Do not claim CRESCO would have “prevented Knight Capital.”

It would not itself solve:
- bad code deployment;
- defective strategy/router logic;
- incomplete testing;
- ignored operational alerts;
- exchange-side controls;
- every possible portfolio/risk dimension.

The valid counterfactual is narrower:

> If a delegated trading strategy emitted actions that exceeded an independently enforced capital Mandate, a CRESCO-like execution boundary could refuse those actions before capital execution.

### CRESCO response hypothesis

```
Strategy / bot
   ↓
TradeAction
   ↓
Mandate evaluation
   ├─ allowed → execute
   ├─ hard violation → refuse
   └─ soft violation → exceptional-authority workflow
```

The product question is not “can we enforce a limit?” Existing trading systems already do that.

The product question is:

> When the action is legitimate but outside the standing Mandate, what temporary authority object should be issued, and how is that authority tied to the current risk state?

---

## B. Treasury Intent / Authority

### Positive signal / opportunity

Multisig/self-custody systems protect very large amounts of onchain capital and enable organizations to operate without a single root-key holder.

Safe publicly reports more than $80B in secured assets.

Primary source:
- https://safe.global/security

### Concrete negative event — Bybit / Safe, 21 Feb 2025

Bybit reported that an Ethereum cold-wallet transfer workflow was compromised through a spoofed Safe UI / malicious frontend path.

Bybit states:
- almost $1.5B in losses;
- signers believed they were performing a routine cold-to-warm transfer;
- the transaction changed smart-contract logic and enabled attacker control.

Safe documentation later described a related class of harmful transaction where phishing could cause users to sign a transaction that looked legitimate but contained a malicious delegate instruction, and added warnings for unexpected delegate calls.

Primary sources:
- https://www.bybit.com/en/learn/this-week-in-bybit/bybit-security-incident-timeline
- https://help.safe.global/articles/4308960633-why-do-i-see-an-unexpected-delegate-call-warning-in-my-transaction

### Observable impact

- roughly $1.5B stolen;
- emergency recovery / reserve operations;
- major operational and reputational impact;
- industry-wide scrutiny of transaction verification and blind signing.

### Design implication

**Exact-action binding is insufficient if the principal is deceived about what the exact action actually is.**

A secure treasury workflow must distinguish:

```
what the UI says
vs
what the transaction bytes mean
vs
what the standing Mandate allows
```

Therefore a Treasury CRESCO would need:
- canonical transaction decoding;
- independent semantic representation;
- explicit program/instruction classification;
- hard invariants for dangerous authority-changing operations;
- trusted confirmation surface or independent verification channel;
- cryptographic binding between reviewed semantics and executed bytes.

### What current CRESCO could plausibly help with

Current CRESCO already proves:
- enforcement below the UI;
- exact one-use capital authority for its current action model;
- stale Mandate nonce;
- mutation refusal;
- replay refusal;
- atomic authority + token execution.

### What current CRESCO would NOT have prevented

Do not claim current Stocklana CRESCO would have prevented the Bybit incident.

If a signer is shown false semantics and authorizes the malicious transaction representation, an exact hash can faithfully bind the wrong thing.

A Treasury direction requires **new trusted-semantic verification**.

### CRESCO response hypothesis

```
Raw transaction / proposed instruction
           ↓
Independent decoder
           ↓
Canonical semantic action
           ↓
Mandate evaluation
           ↓
Policy Diff
           ↓
Principal sees trusted semantics
           ↓
Exceptional authority, if allowed
           ↓
Executed bytes must match reviewed semantics
           ↓
Atomic execution / consume
```

Hard-rule example:

```
ordinary vendor transfer
→ exceptionable

program upgrade / authority replacement / delegate-style control change
→ HARD REFUSE or higher security ceremony
```

---

## Comparison

| Dimension | Delegated Trading | Treasury Intent |
|---|---|---|
| Negative event quality | Very strong | Exceptional |
| Causal fit to current CRESCO | Strong but partial | Partial; requires trusted semantics |
| Solana-native capital path | Strong | Strong |
| Demo clarity | Strong | Exceptional |
| Required new architecture | Medium | Medium–High |
| Existing competitor maturity | Very high | Very high |
| False-counterfactual risk | Medium | High |
| Current leading question | exception shape + latency | trusted semantics + exception lineage |

## Current conclusion

Neither incident proves a company.

They prove two different structural failures:

### Trading
**Autonomous execution can outrun inadequate capital controls.**

### Treasury
**Human approval is unsafe if the representation being approved is untrusted.**

CRESCO should not combine both problems unless one selected vertical requires both.
