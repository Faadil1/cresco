# PRE-BUILD REALITY GATE

Status: ACTIVE  
Date: 2026-09-26

## Rule

No candidate direction may become Concept Lock because it sounds technically elegant, maps well to CRESCO’s current code, or is fashionable in the market.

It must pass every required gate with evidence.

## Candidate lanes

### Treasury / Crypto Ops

Working hypothesis:
Teams need a way to handle legitimate actions outside standing treasury authority without silently turning the exception into future standing authority.

Current status:
- Real Problem: PASS category-level
- Real User: PASS category-level
- 5-Year Durability: PASS
- WTP for CRESCO semantics: UNPROVEN
- Killer Demo: EXCELLENT
- Native Advantage: STRONG/PARTIAL
- Negative Event: PASS — Bybit/Safe mapped causally
- Technical Feasibility: PARTIAL — requires trusted semantic verification
- Competitive Residual: BLOCKED

Must prove:
- recurring legitimate boundary events;
- current workaround;
- exact vs temporary-envelope preference;
- stale-approval semantics;
- why Squads/Safe/Turnkey are insufficient;
- at least 2 users willing to trial.

### Agent Builders

Working hypothesis:
Agents need more than spending caps; they need explicit authority semantics when a legitimate action falls outside normal policy.

Current status:
- Real Problem: PASS category-level
- Real User: PASS
- 5-Year Durability: PASS
- WTP for CRESCO semantics: UNPROVEN
- Killer Demo: STRONG
- Native Advantage: STRONG
- Negative Event: STRONG category-level
- Competitive Residual: BLOCKED by Turnkey/SDP/Session/etc.

Must prove:
- real boundary events;
- actions that are “under cap but wrong”;
- escalation latency tolerance;
- exact vs scoped-session preference;
- existing workaround pain;
- at least 2 builders willing to integrate/test.

### Delegated Trading

Working hypothesis:
Trading systems need bounded delegated capital plus explicit, policy-aware override semantics for exceptional trades.

Current status:
- Real Problem: PASS
- Real User: PASS category-level
- 5-Year Durability: PASS
- WTP: SUPPORTED category-level / CRESCO-specific UNPROVEN
- Killer Demo: EXCELLENT
- Native Advantage: VERY STRONG
- Negative Event: PASS — Knight Capital mapped causally
- Technical Feasibility: PASS for a bounded one-venue vertical
- Competitive Residual: UNPROVEN
- Direct Pull: PENDING

Must prove:
- recurring legitimate trades blocked by risk limits;
- current override behavior;
- latency tolerance;
- exact trade vs temporary risk envelope;
- current OMS/risk-engine sufficiency;
- at least 2 operators willing to test.

### Family Progressive Agency

Working hypothesis:
Families prefer durable standing autonomy plus rare explicit exceptions over either per-action approval or broad child control.

Current status:
- Real Problem: PLAUSIBLE
- Real User: PASS
- 5-Year Durability: PASS
- WTP for CRESCO semantics: UNPROVEN
- Killer Demo: EXCELLENT
- Native Advantage: WEAK/PARTIAL
- Negative Event: PARTIAL category-level
- Competitive Residual: PARTIAL

Must prove:
- parents experience approval fatigue / precedent creep;
- exact exception is preferable to temporary limit change;
- decision lattice does not collapse to yes/no;
- child-controlled signer is acceptable;
- product can avoid securities/custody traps.

## Universal interview rule

Ask about **past behavior first**.

Do not lead with CRESCO.

Primary prompt:

> Tell me about the last time a legitimate action hit a spending, risk, permission, or approval boundary. What happened next?

Then reconstruct:
- standing rule;
- requested action;
- why it was legitimate;
- who decided;
- what new authority was issued;
- whether that authority remained afterward;
- whether it was reverted;
- whether the action changed between approval and execution;
- how long approval took;
- what failure would have cost.

Only after understanding the workflow should CRESCO concepts be shown.

## Exception Shape Classification

Classify every observed real exception:

A. DECLINE — no new authority.  
B. EXACT ACTION — one specific action.  
C. PARAMETRIC TEMPORARY — bounded envelope for a short context.  
D. SCOPED SESSION — repeated actions inside temporary scope.  
E. PERMANENT EVOLUTION — standing policy changes.  
F. FULL CO-SIGN — principal jointly authorizes the action.

The distribution of real events across these classes determines the product.

## Decision-Lattice Test

Test whether users really need:

```
DECLINE
EXCEPTION
EVOLVE
```

or whether actual behavior collapses to:
- approve / deny;
- session / deny;
- widen / deny.

## Stale-Policy Test

Ask:

> An exception was approved under policy v7. Before execution, the standing policy changed to v8. Should the old exception still execute?

Record why.

Possible semantics:
- always stale;
- survives only if v8 is broader;
- survives if unrelated fields changed;
- must be re-evaluated against v8;
- principal explicitly chooses at issuance.

Do not pick one before user/domain evidence.

## Promotion threshold

A lane can be proposed for Concept Lock only when:
- multiple users independently report the boundary problem;
- workaround pain is measurable;
- exception shape is understood;
- stale-policy semantics are understood;
- incumbent residual is explicit;
- native advantage is tangible;
- at least two credible users want to test;
- one concrete negative event maps causally to the product;
- the killer demo is honest and provable.

Until then:

**BUILD_AUTHORIZED = FALSE**


## Reality Gate Rerun — 2026-09-26

### Delegated Trading

Passed:
- REAL PROBLEM — mature, repeated risk-control domain;
- REAL USER — allocator / strategy operator / risk owner is legible;
- 5-YEAR DURABILITY — trading risk control predates current AI/crypto cycles;
- KILLER DEMO — mechanism can be shown in ~90 seconds;
- NATIVE ADVANTAGE — onchain capital path, Pyth, atomic authority+execution;
- NEGATIVE EVENT — Knight Capital provides a verified failure pattern;
- TECHNICAL FEASIBILITY — current CRESCO can be extended vertically without a rewrite.

Still blocked:
- CRESCO-specific WTP;
- real operator exception-shape distribution;
- acceptable override latency;
- stale-policy expectation;
- competitive residual vs OMS/RMS;
- at least two operators wanting to trial.

Gate result:
**SURVIVES / CONCEPT LOCK BLOCKED ON DIRECT EVIDENCE.**

### Treasury Intent

Passed:
- REAL PROBLEM — high-consequence signing / delegated treasury risk;
- REAL USER — treasury operator / signer / policy owner is legible;
- 5-YEAR DURABILITY — durable treasury/security problem;
- KILLER DEMO — extremely legible;
- NEGATIVE EVENT — Bybit/Safe provides a verified failure class.

Still blocked:
- CRESCO-specific WTP;
- trusted semantic verification architecture;
- competitive residual vs Safe/Squads/security tooling;
- direct operator pull;
- exception-shape distribution;
- stale-policy semantics.

Gate result:
**SURVIVES / CONCEPT LOCK BLOCKED ON PRODUCT DELTA + DIRECT EVIDENCE.**

### Agent Builders

New evidence:
Sanction already covers one-use exact grants, mismatch refusal, policy revisions and evidence replay; Session.money covers scoped sessions.

Gate result:
**SURVIVES ONLY CONDITIONALLY.**

The generic Agent lane is removed from lead consideration unless discovery proves value in:
- stale-policy invalidation;
- atomic exception + onchain capital execution;
- Policy Diff/minimal exceptional delta;
- trusted semantics;
- another vertical-specific residual.

### Build authorization

Still:

**BUILD_AUTHORIZED = FALSE**

Allowed:
- discovery;
- evidence collection;
- technical feasibility spikes;
- demo specification;
- architecture comparison.

Not allowed:
- product feature implementation that silently chooses a wedge.


## Reality Gate Rerun — 2026-10-01

Trigger:
- planned Thursday checkpoint reached;
- full Sanction founder interview synthesized;
- second outreach wave sent;
- no new operator replies beyond Eric as of the checkpoint;
- current System Control Plane v1 and Product Reality v1.3 reconciled.

### New evidence since 2026-09-26

PROVEN:
- Sanction founder/expert interview confirms stale approvals, action drift and unknown-outcome/duplicate-retry as real design concerns.
- Sanction explicitly positions itself as governance/ledger rather than fiduciary execution.
- The architectural residual therefore sharpens toward execution-bound delegated capital authority.

NOT PROVEN:
- operator/customer pull for CRESCO;
- CRESCO-specific willingness to pay;
- preferred exception shape;
- operator stale-policy expectation;
- material value of atomic exception-consume + execution;
- two credible target operators willing to test.

### Lane status

#### Delegated Trading

Status:
**SURVIVES / LEADING EVIDENCE LANE / CONCEPT LOCK BLOCKED.**

Reason:
- strongest native Solana fit;
- bounded technical feasibility exists;
- Primer reconstruction leaves an exception-to-policy residual;
- Sanction interview sharpens the governance-vs-execution boundary;
- direct representative operator evidence is still missing.

#### Treasury / Crypto Ops

Status:
**SURVIVES / SECONDARY HIGH VALUE / CONCEPT LOCK BLOCKED.**

Reason:
- high-consequence problem and strong killer demo;
- trusted semantic verification remains a major product delta;
- direct operator pull remains missing.

#### Agent Builders

Status:
**CONDITIONAL / HIGH COMPETITIVE RISK.**

Reason:
- generic authorization is heavily reconstructed by Sanction/Turnkey/Session-style systems;
- only execution-layer/capital-path residual remains interesting;
- no direct user pull has promoted it.

#### Family Progressive Agency

Status:
**HOLD AS ORIGINAL PRODUCT / UX LABORATORY.**

No new evidence promotes it to commercial lead.

### Gate result

`PRE_BUILD_REALITY_GATE = BLOCKED`

Blockers:
- direct representative operator evidence;
- CRESCO-specific pull/WTP;
- at least two credible target operators willing to test;
- exception-shape distribution;
- stale-policy expectation;
- atomic-execution operator value.

### Allowed next paths

1. **CONTINUE_DISCOVERY**
   - obtain direct operator evidence;
   - preserve build_authorized=false.

2. **EXPLICIT HUMAN BUILD_WITH_VALIDATION_GAP OVERRIDE**
   - allowed only as an explicit human decision;
   - does not convert missing evidence into PASS;
   - Concept Lock and PRD must record the validation gap;
   - all later claims remain truth-bounded.

No silent lock is permitted.

### Exact next gate

**PRE_BUILD_REALITY_GATE__DIRECT_OPERATOR_EVIDENCE**

### Exact next action

Obtain representative operator evidence for the surviving execution-bound delegated-capital hypothesis, or ask the human owner for an explicit build-with-validation-gap override before Concept Lock/build.


## Human Override Exercised — 2026-10-01

Observed checkpoint:
no new operator reply arrived beyond the existing Eric/Sanction evidence.

Human instruction:
**advance to the next step if there is no reply.**

Result:
`BUILD_WITH_VALIDATION_GAP` was explicitly exercised.

This does not change the evidence classification:
- direct operator evidence remains BLOCKED/MISSING;
- WTP/pull remains BLOCKED/MISSING;
- adoption remains unproven.

It authorizes progression through:
- Concept Lock;
- Technical Reality Check;
- Backend Engineering Intelligence;
- bounded implementation specification;
- Demo-First Architecture;
- bounded World’s Fair build.

Selected concept:
**execution-bound delegated capital authority for Solana**, initial delegated-trading vertical.

Selected v1 adapter:
**Orca Whirlpools devnet**.

Current exact next gate:
**BUILD__FIRST_LIVE_VERTICAL_SLICE**
