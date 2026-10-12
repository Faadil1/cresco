# CRESCO Product Requirements — Crypto World’s Fair

Version: 1.0-locked-with-validation-gap  
Status: **CONCEPT LOCKED WITH VALIDATION GAP / LIVING PRD**  
Date: 2026-10-01

## 1. Purpose

This PRD coordinates the World’s Fair evolution of CRESCO.

It is intentionally written **before Concept Lock**. It records what must remain invariant, what is proven by the Stocklana baseline, which company directions remain alive, which claims are still hypotheses, and what evidence is required before implementation expands.

This document is expected to evolve. Material changes must be explicit and reviewable rather than silently introduced through code.

## 2. Mission

Determine what company CRESCO should become for Crypto World’s Fair without assuming that the Stocklana family-finance framing is the final market.

The working problem is:

> **How can a principal give another actor meaningful autonomy without turning one exceptional approval into broader standing authority?**

A more precise system statement:

> **CRESCO governs the lifecycle of delegated authority when an autonomous action reaches a standing boundary.**

## 3. Baseline vs World’s Fair Delta

### CRESCO BASELINE — Stocklana

Canonical source:
- https://github.com/Faadil1/cresco
- https://cresco-lac.vercel.app/

The baseline already proves:
- Solana Devnet program-controlled demo SPL-token execution;
- in-bound execution without guardian approval;
- capital-path refusal when the standing boundary is exceeded;
- versioned Mandates / nonces;
- stale authorization refusal after Mandate change;
- one-time exception path;
- mutation refusal for the current exact-action model;
- single-use consumption and replay refusal;
- Pyth-derived price / notional enforcement;
- explicit separation between learning/evidence and authority;
- fail-closed handling of stale/unknown evidence;
- ALLOW / REFUSE / PENDING / UNKNOWN semantics.

Truth boundary:
- Devnet;
- demo SPL-token execution;
- no brokerage claim;
- no custody claim;
- no mainnet claim;
- no real AAPL ownership claim;
- no real minor securities execution claim.

### CRESCO WORLD’S FAIR DELTA

This repository must prove the delta from the baseline:
- company / market selection;
- user evidence;
- competitive residual;
- refined authority model;
- exact role of Solana;
- economic mechanism;
- distribution hypothesis;
- differentiated killer demo;
- any new implementation;
- runtime evidence;
- final submission narrative.

Do not rewrite Stocklana history to make the World’s Fair story look cleaner.

## 4. Current Product Thesis

CRESCO separates four distinct concepts:

### 4.1 Standing Authority

What the delegate may normally do without synchronous principal approval.

Examples:
- allowed asset;
- allowed action;
- destination / venue scope;
- per-action amount;
- per-period amount;
- expiry;
- market / risk conditions.

### 4.2 Exceptional Authority

Additional authority granted for an action that crossed a standing boundary.

Current baseline form:
- exact request;
- one successful use;
- bound to current Mandate lineage;
- mutation refusal;
- replay refusal;
- standing Mandate unchanged.

The future exception shape is **not yet locked**. Discovery must determine whether real users need:
- exact-action capability;
- parametric temporary capability;
- scoped session;
- full co-sign/proposal;
- permanent widening.

### 4.3 Authority Evidence

Information that may inform future authority decisions.

Examples:
- learning progress;
- historical success;
- P&L;
- risk score;
- oracle evidence;
- agent evaluation;
- exception frequency;
- reputation.

Invariant:

> **Evidence may inform authority. Evidence never becomes authority by itself.**

### 4.4 Policy Evolution

An explicit authorized transition that changes future standing authority.

Example:

```
Mandate v7
→ authorized policy transition
→ Mandate v8
```

An exception is not Policy Evolution.

## 5. Uncompromising Core Invariants

These are preserved across all candidate markets unless Concept Lock explicitly proves that one is invalid:

1. Standing authority is explicit and versioned.
2. The delegate may act autonomously inside standing authority.
3. Boundary violations fail closed.
4. Proposal/request is not authority.
5. Some boundaries may be hard and non-exceptionable.
6. Soft boundaries may support an exceptional-authority path.
7. An exception never implicitly mutates standing authority.
8. Material mutation of a bound action invalidates its authorization.
9. Consumed one-time authorization cannot be replayed.
10. A standing-policy change is a separate authorized transition.
11. Old authorization material must not silently survive incompatible policy evolution.
12. Evidence, learning, profit, reputation or model confidence never auto-widens authority.
13. Market/risk evidence may restrict execution but never grants authority on its own.
14. The UI is not the enforcement boundary.
15. UNKNOWN is not success.
16. REAL FAILURE > FAKE SUCCESS.

## 6. Hard vs Soft Boundaries — Working Model

Not every REFUSE should create an escalation path.

### HARD INVARIANT

Cannot be overridden through a delegate-originated exception request.

Examples to test:
- revoked Mandate;
- prohibited/sanctioned destination;
- invalid signer;
- stale/unknown critical evidence;
- unsupported program / asset where execution is forbidden.

### SOFT BOUNDARY

May permit exceptional authority.

Examples to test:
- amount exceeds normal per-action limit;
- approved vendor invoice exceeds normal budget;
- temporary slippage / risk deviation;
- new but trusted destination requiring principal review.

### EVOLVABLE POLICY

A principal may explicitly change future standing authority through a new Mandate version.

## 7. Policy Diff — Differentiation Hypothesis

The strongest current residual hypothesis is **policy-aware exceptional authority**.

Instead of only returning ALLOW/DENY, CRESCO may formally compute:

```
Standing Mandate vN
        ↓
Requested Action
        ↓
Policy Diff
        ↓
Which dimensions violated vN?
        ↓
Minimal exceptional authority
        ↓
Principal decision
        ↓
Execution + evidence
        ↓
Standing Mandate remains vN
```

Example:

```
Mandate v7:
asset      USDC
recipient  Vendor A
max amount $500

Requested:
asset      USDC        ✓
recipient  Vendor A    ✓
amount     $640        ✕

Policy Diff:
amount = +$140 beyond standing authority
```

Potential value:
- explainable boundary;
- explicit relationship between normal and exceptional authority;
- auditable exceptional delta;
- clearer stale-policy semantics;
- possible cross-provider portability.

**Status: UNPROVEN DIFFERENTIATION HYPOTHESIS.**

## 8. Current Technical Baseline Limitation

The Stocklana implementation proves exactness for its current execution model. It does **not yet prove a universal semantic action hash** over arbitrary financial transactions.

Current exactness includes:
- request identity / request hash;
- execution asset / mint;
- action type in hosted state;
- current Mandate nonce;
- exact Pyth-derived approved notional;
- one successful use;
- replay refusal.

Future directions such as treasury or arbitrary agent transactions may require canonical action semantics including, when applicable:
- recipient;
- chain;
- program / contract;
- instruction / method;
- calldata / arguments;
- asset;
- amount;
- venue;
- slippage;
- expiry;
- fee payer;
- oracle/risk context.

Do not claim this generalized binding until implemented and proven.

## 9. Competitive Reality

The following are **prior art / adjacent systems**, not enemies to dismiss:
- Solana Spend Permissions / allowances;
- Solana Developer Platform wallet policies;
- Squads Spending Limits + Vault Transactions + Proposals;
- Safe allowances / multisig transactions;
- Turnkey policy engine / delegated access / human-agent consensus;
- Privy agent policies;
- Crossmint agent wallets;
- Session.money scoped spending sessions;
- Sanction agent authorization plane (one-use exact grants + immutable policy revisions + evidence replay);
- OAuth 2.0 Rich Authorization Requests (RFC 9396);
- PSD2 dynamic linking;
- macaroons / capability attenuation;
- JIT / PAM / break-glass access;
- corporate-card spend controls.

Current conclusion:
- bounded delegation is not novel;
- spending caps are not novel;
- exact payment consent is not novel;
- transaction proposals are not novel;
- versioned policies are not novel;
- replay protection is not novel in isolation.

The unresolved question is whether CRESCO’s combination of:
- standing-policy lineage;
- boundary explanation / Policy Diff;
- exceptional-authority issuance;
- mutation/replay semantics;
- explicit separation from Policy Evolution;
- execution-path evidence

is sufficiently valuable and sufficiently distinct to support a product/company.

## 10. Hostile Reconstruction Tests

CRESCO must survive these before Concept Lock.

### Squads Test

Can CRESCO be reconstructed with:

```
Spending Limit
+
Vault Transaction
+
Proposal
+
Config Transaction
```

If yes, identify the residual value precisely.

### Safe Test

Can:

```
Allowance module
+
exact Safe transaction
+
nonce
+
guard/module logic
```

reproduce CRESCO sufficiently?

### SDP Test

Do:
- immutable policy revisions;
- operation snapshots;
- approval_required;
- approval requests;
- payload/idempotency fingerprints

already implement enough of the lifecycle?

### RFC 9396 / PSD2 Test

Does rich transaction consent + dynamic linking + single-use implementation reduce CRESCO to an implementation convention?

### Session Test

Do users prefer a scoped temporary envelope/session to an exact exceptional action?

### Feature Absorption Test

If an incumbent adds:

```
approveExactOnce(action)
```

does CRESCO still have independent value?

## 11. Candidate Company Directions

No direction is locked.

### A. Treasury Intent / Authority

High-consequence delegated treasury actions.

Potential value:
- policy-aware exception;
- trusted semantic representation;
- exact authorization lineage;
- replay/mutation handling;
- audit.

Critical warning:
exact-action binding does not prevent an incident where the principal is deceived into authorizing the malicious action itself. A treasury concept may require independent semantic decoding / trusted display binding.

### B. Delegated Trading / Capital Mandates

Principal allocates capital to a trader/bot under standing risk parameters.

Potential rules:
- assets;
- venues;
- notional;
- exposure;
- slippage;
- Pyth conditions;
- period limits;
- drawdown;
- hard/soft risk boundaries.

Critical questions:
- exception latency;
- existing OMS/risk override quality;
- exact vs parametric exception shape.

### C. Agentic Financial Authority

Not “another agent wallet.”

Potential value:
- authority lifecycle around existing wallet/signing infra;
- boundary negotiation;
- Policy Diff;
- explicit exceptional authority;
- cross-provider semantics.

Critical threats:
- Turnkey;
- SDP;
- Session.money;
- Sanction;
- wallet incumbents;
- fast feature absorption.

**Current evidence update (2026-09-26): HIGH COMPETITIVE RISK.**

Sanction publicly documents a very close reconstruction of the agentic CRESCO path:
- approve / escalate / deny;
- human approval that mints a one-use grant;
- exact same request required on retry;
- field mismatch refusal;
- immutable policy revisions;
- exact evaluated context persisted;
- replayable decision evidence.

Therefore `exact request + human escalation + one-use grant + policy lineage` is no longer a sufficient residual for the Agent lane. Agentic CRESCO must prove an additional valuable layer such as explicit Policy Diff / minimal exceptional authority, capital-path enforcement semantics, cross-provider portability, or a vertical workflow incumbents do not already solve.

### D. Family Progressive Agency

Current baseline narrative remains active as:
- possible product;
- UX laboratory;
- most legible principal/delegate explanation.

Not yet proven as the commercial wedge.

### E. Organizational Spend / Procurement

Commercially intuitive:
- legitimate out-of-policy expense;
- exact/temporary exception;
- preserve normal employee budget.

Critical weakness for World’s Fair:
- weak blockchain-native advantage unless a real composability or settlement requirement is found.

## 12. Discovery Lanes

### Treasury / Crypto Ops

Research question:

> What actually happens after a legitimate treasury transaction hits a standing spending/policy boundary?

Evidence required:
- recent real event;
- current workaround;
- frequency;
- approver;
- whether standing authority changes;
- exact vs temporary-envelope preference;
- stale-policy behavior;
- measurable cost/risk.

### Agent Builders

Research question:

> When an agent needs a legitimate action outside normal wallet policy, what authority object should be issued?

Test:
- exact action;
- scoped session;
- cap increase;
- co-sign;
- policy change;
- no escalation.

Also test:
- actions under cap that still should not be authorized;
- acceptable escalation latency.

### Delegated Trading

Research question:

> How are legitimate trades that fail pre-trade limits handled today, and what override semantics are actually required?

Test:
- exact trade;
- temporary risk envelope;
- automated risk sentinel;
- human approval;
- time sensitivity;
- stale exception after risk-policy changes.

## 13. PRE-BUILD REALITY GATE

Every candidate must prove:

### REAL PROBLEM
A recurring, observed workflow—not a theoretical security story.

### REAL USER
A clearly identifiable principal/delegate pair and buyer.

### 5-YEAR DURABILITY
The problem survives current crypto/AI fashion cycles.

### WILLINGNESS TO PAY
Evidence specific to the mechanism/workflow, not only category TAM.

### KILLER DEMO
A short demo where the advantage is understandable without long explanation.

### NATIVE ADVANTAGE
Solana/onchain execution materially improves the product.

### NEGATIVE EVENT
At least one concrete, real, verifiable failure with:

1. positive signal/opportunity;
2. concrete negative event;
3. observable impact;
4. design implication;
5. CRESCO response.

### COMPETITIVE RESIDUAL
Incumbent primitives do not already solve the workflow sufficiently.

## 14. Concept Lock Entry Criteria

A direction may enter Concept Lock only when all are true:

- multiple target users independently describe recurring boundary events;
- current workaround has measurable friction/risk/cost;
- exception shape is understood;
- decline / exception / evolve decision lattice maps to real behavior;
- stale-policy semantics are understood;
- competitive residual survives teardown;
- native advantage is tangible;
- at least two credible target users/builders want to try the approach.

## 15. Concept Lock Output — Required

When the gate passes, this PRD must be updated to include:
- selected wedge;
- primary principal/delegate pair;
- buyer;
- verified negative event;
- current workaround;
- economic mechanism;
- competitive residual;
- exact exception shape;
- hard/soft boundary model;
- Solana-native advantage;
- distribution;
- killer demo;
- MVP / non-goals;
- technical requirements;
- evidence plan;
- kill criteria.

Then set:

`Status: CONCEPT-LOCKED`

Only after that:
- Technical Reality Check;
- Backend Engineering Intelligence;
- Demo-First Architecture;
- Build.

## 16. Collaboration Rules

1. This PRD is the coordination source of truth.
2. Do not silently change the wedge through implementation.
3. Do not convert a hypothesis into a claim without evidence.
4. Do not force Family, Agentic, Treasury or Trading because of sunk work.
5. Do not constrain divergent product thinking by current permissions, deployment convenience or deadline.
6. Deadline affects sequencing after Concept Lock, not the ambition of the concept.
7. Collaborator latency must not block deadline-critical execution once a direction is locked.
8. Every material product decision must preserve a short rationale and evidence.
9. Public README/submission claims must be strictly weaker than or equal to runtime evidence.
10. Keep private collaborator notes / exploratory strategy out of the public submission surface when they do not help judges or users.

## 17. Current Decision

**NO CONCEPT LOCK.**  
**NO NEW PRODUCT BUILD YET.**

Next work:
1. complete semantic teardown against SDP / Squads / Safe / Turnkey / Session.money / Sanction;
2. run Treasury / Agent Builder / Delegated Trading discovery;
3. classify exception shape from real events;
4. determine stale-policy semantics;
5. identify any residual that survives the Sanction reconstruction;
6. rerun PRE-BUILD REALITY GATE;
7. Concept Lock only if evidence supports it.

## 18.1 Sanction residual update — 2026-09-26

Further code inspection narrowed the Agent-lane residual again.

### Stale-policy semantics

Sanction’s public grant-consumption path visibly checks:
- grant identity / owner;
- status;
- expiry;
- exact resource/request match;
- optional execution-token limits.

In the inspected path, no explicit comparison against the **current policy revision** is visible at grant redemption.

CRESCO’s current Mandate nonce semantics invalidate authorization material after a standing-authority transition.

This creates a concrete discovery question:

> If an exception is approved under policy vN and the standing policy becomes vN+1 before execution, should that exception still work?

Status:
**TECHNICAL DIFFERENCE OBSERVED / CORRECT PRODUCT SEMANTIC UNPROVEN.**

### Authorization attempt vs atomic capital execution

Sanction explicitly documents that a consumed grant authorizes **one attempt**, not proof of downstream completion. A failed downstream action does not restore the grant.

CRESCO’s current Solana path consumes its one-time allowance in the same transaction as the controlled token movement; failed execution rolls back state atomically.

Potential residual:

> For onchain capital, exceptional authority and execution can settle atomically.

Status:
**REAL ARCHITECTURAL DIFFERENCE / CUSTOMER VALUE UNPROVEN.**

### Consequence for Agentic direction

Agentic CRESCO is not allowed to Concept Lock around:
- one-use grants;
- exact retry;
- human escalation;
- policy revisions;
- audit evidence.

It must instead validate at least one materially valuable residual:
- stale-policy invalidation semantics;
- atomic exception + capital execution;
- complete Policy Diff / minimal exceptional delta;
- trusted semantic representation;
- cross-provider/onchain enforcement that users materially prefer.

See:
- `research/SANCTION-DELTA.md`
- `research/OUTREACH-PACK.md`
- `research/OUTREACH-LOG.md`

## 18. Public Discovery Update — 2026-09-26

This section records public behavioral evidence. It is **not** a substitute for interviews.

### Organizational spend

Ramp supports temporary increases that revert automatically to the original standing limit. A public user requested custom expiry dates because multi-cycle temporary needs otherwise require repeated increases or a “permanent” increase that must later be manually reduced.

Implication:
- some real workflows prefer a **parametric temporary envelope** rather than exact-action authorization;
- forgotten rollback / permission drift is observable operational pain.

A Canadian OSFI audit also documented transactions above acquisition-card thresholds where temporary increases were allowed but evidence of required approvals could not be demonstrated.

Implication:
- approval lineage / evidence is a real operational requirement.

### Treasury

Squads already provides standing delegated authority through Spending Limits. Public MetaDAO code configures monthly Squads spending limits for operating teams.

Implication:
- delegated treasury autonomy is real, not theoretical;
- the unresolved workflow is what teams do when a legitimate transaction exceeds that standing authority.

### Agent builders

Sanction proves that exact one-use escalation semantics already exist outside CRESCO.

Implication:
- Agentic Authority survives only if direct discovery finds a residual beyond one-use exact grants and policy evidence.

Session.money makes the competing product bet that a human should approve a bounded **session** (duration + cap + scope), not a single exact action.

Implication:
- Exception Shape Test is now critical.

### Delegated trading

European algorithmic-trading rules explicitly require procedures for specific trades blocked by pre-trade controls but still intended for submission. Overrides must be temporary, exceptional, risk-verified and authorized by a designated person.

Implication:
- the CRESCO decision-lattice problem shape is strongly validated in a mature financial domain;
- the remaining question is whether existing OMS/EMS/risk systems already solve it sufficiently well.

See:
- `research/PUBLIC-EVIDENCE-2026-09-26.md`
- `research/DISCOVERY-TARGETS.md`


## 19. Negative-Event + Killer-Demo Update — 2026-09-26

Two lanes now have causal incident mappings and bounded demo specifications.

### Delegated Trading

Primary negative event:
- Knight Capital 2012 automated-routing incident;
- >4M executions, >397M shares, >$460M loss;
- SEC findings included inadequate controls immediately before market submission and inadequate aggregate capital-threshold controls.

CRESCO relevance:
- supports the case for an independent capital-path Mandate;
- current CRESCO already has max action/period notional, per-asset rules, Pyth validation, pause/revoke, period counters and atomic execution state;
- CRESCO must NOT claim it would have prevented the full Knight incident.

Killer-demo thesis:
> The strategy can trade by itself, but crossing one risk boundary does not give it broader future authority.

Required proof sequence:
1. two in-bound autonomous actions;
2. one legitimate out-of-bound action;
3. Policy Diff;
4. exceptional authority;
5. meaningful mutation refusal;
6. exact/bounded action executes;
7. exception consumed;
8. replay refuses;
9. standing Mandate unchanged;
10. stale-Mandate negative path.

### Treasury Intent

Primary negative event:
- Bybit / Safe incident, 21 Feb 2025;
- roughly $1.5B stolen after signers were deceived by a compromised/spoofed transaction representation.

CRESCO relevance:
- proves that exact-action hashing alone is not sufficient when the signer is shown false semantics;
- a Treasury direction therefore requires trusted/independent semantic decoding and binding between reviewed semantics and executed bytes.

Killer-demo thesis:
> A signer’s approval is only valid for the transaction semantics they independently verified — not whatever a compromised interface puts underneath the button.

Required proof sequence:
1. normal standing authority;
2. legitimate exceptional payment;
3. Policy Diff;
4. principal authorization;
5. compromised UI / transaction semantic mismatch;
6. HARD REFUSE;
7. legitimate bytes restored;
8. atomic execute + consume;
9. replay refusal;
10. standing authority unchanged.

### Current collision

- Delegated Trading: best continuity with current CRESCO architecture and strongest natural Pyth/Solana role.
- Treasury Intent: strongest human-readable security demo, but requires more new architecture and a trusted semantic verifier.
- Demo quality does not decide Concept Lock.

See:
- `research/NEGATIVE-EVENT-MAP.md`
- `research/KILLER-DEMO-SPECS.md`
- `research/TECH-FEASIBILITY-DELEGATED-CAPITAL.md`


## 20. Primer + TradFi Override Update — 2026-09-26

### Primer Vault

Primer Vault's public trading implementation reconstructs most generic delegated-trading control:
- commissioned agent identity;
- independent re-quote;
- per-trade / daily limits;
- slippage / price-impact controls;
- human approval;
- pending expiry;
- re-quote and current-policy re-evaluation at approval;
- duplicate-safe approval;
- onchain trade execution.

Important semantic residual:
Primer's human approval is **review within current standing policy**. Hard limits such as per-trade max, daily volume and max slippage reject; approval does not visibly mint authority beyond those limits.

CRESCO's current one-time allowance can instead authorize a selected soft-boundary action beyond the normal standing action cap while leaving the Mandate unchanged.

Status:
**REAL COMPETITIVE DIFFERENCE / PRODUCT VALUE UNPROVEN.**

### TradFi prior art

Specific temporary trade overrides are established institutional practice and regulatory requirement in some jurisdictions.

Therefore CRESCO must not claim novelty for:
- one-trade risk override;
- risk-manager approval;
- temporary exceptional permission.

Potential novelty/value must come from applying those semantics to:
- machine-delegated onchain capital;
- explicit Mandate / exceptional-authority state;
- atomic exception consumption + execution;
- verifiable lineage;
- delegate-native discovery and request flow.

### Current working company hypothesis

> **Delegated Capital Authority for autonomous onchain strategies.**

This is still a hypothesis, not Concept Lock.

See:
- `research/PRIMER-VAULT-DELTA.md`
- `research/CONCEPT-COLLISION-V3.md`


## 21. Trading Boundary Taxonomy — 2026-09-26

Delegated Trading must not treat every risk failure as exceptionable.

Working boundary classes:
- **HARD** — no exception path;
- **UNKNOWN_FAIL_CLOSED** — evidence unavailable/invalid;
- **SOFT_EXACT** — one exact exceptional action may be authorized;
- **SOFT_ENVELOPE** — bounded temporary authority, only if discovery requires it;
- **EVOLVABLE_ONLY** — standing Mandate may change through explicit vN → vN+1 transition, not Allow Once.

Leading soft-boundary candidate:
- per-trade notional.

Leading hard-boundary candidates:
- revoked/paused authority;
- wrong delegate;
- unsupported/unparseable execution path;
- invalid critical evidence.

Important unresolved question:
How should exceptional execution affect standing period counters?

Possible models:
- count exceptional execution against standing period usage;
- keep a separate exceptional ledger;
- dimension-specific accounting.

No model is locked before operator discovery.

See `research/TRADING-BOUNDARY-TAXONOMY.md`.


## 22. Conditional Gateway Registry — Mandatory

CRESCO World’s Fair is governed by:

- `governance/GATEWAY-REGISTRY.yaml`
- `governance/PRODUCT-DEPTH-LIVE-REALITY-v1.2.1.md`
- `governance/REALITY-LEDGER.md`

Every gate must always have an explicit status:

`ACTIVE` / `N/A` / `BLOCKED` / `PROVEN`

A gate cannot disappear because the current phase does not need it yet.

`N/A` means currently not applicable and must be re-evaluated when scope, architecture, runtime, sponsor dependencies, evidence state or submission state changes.

Product Depth & Live Reality v1.2.1 is active throughout the project:
- Vertical Slice ≠ Definition of Done.
- Technical Proof ≠ Live Product Integration.
- Static/replayed evidence alone cannot satisfy a Live Core Loop claim.
- Real product depth requires load-bearing integration, real consequence, representative success/negative/boundary/recovery paths, real-user/operator evidence, observability/receipts, reproducibility and a Post-Vertical-Slice Depth Gap Review.
- One external trial ≠ adoption.
- Organic usage excludes scripted traction.
- Depth ≠ feature count.
- Heavy polish cannot compensate for weak product reality.

Promotion order remains:

```
REAL PROBLEM
→ NATIVE MECHANISM
→ LIVE INTEGRATION
→ PRODUCT DEPTH
→ REAL USER / OPERATOR LOOP
→ REAL CONSEQUENCE
→ EVIDENCE & OBSERVABILITY
→ UX / DESIGN
→ SUBMISSION PACKAGING
```


## 23. Sanction Founder Interview Update — 2026-09-29

A founder/competitor discovery interview with Eric Lovold materially sharpened the Sanction boundary.

### Confirmed concerns

Eric identified:
- stale approvals;
- action drift between what was approved and what executes;
- unknown downstream outcomes;
- duplicate-retry risk;
- authority consumption without successful downstream effect.

Important conceptual distinction:

> **Approved ≠ done.**

### Stale-policy nuance

Eric supports explicit revocation invalidating an outstanding approval and indicated that a new hard restriction/freeze should probably block an earlier approval.

He did **not** establish that every policy revision should invalidate every outstanding grant.

Therefore CRESCO must keep stale semantics explicit rather than assuming one universal rule.

### Atomicity

The interview did **not** validate that users or Sanction want authorization consumption + external execution as one atomic state transition.

CRESCO's onchain atomicity remains:
- technically real;
- potentially useful;
- commercially unproven.

### Policy Diff

The interview reinforced the importance of clear variables, finite rules and visible scope.

It did **not** prove that approvers want a full multi-dimensional Policy Diff at decision time.

### Sanction product boundary

Eric was explicit that Sanction:
- does not pass money;
- does not aim to be the fiduciary execution layer;
- is governance / decision infrastructure;
- wants to be a ledger, not a bank.

This materially sharpens the CRESCO residual:

> **CRESCO should not compete as another generic authorization ledger.**

A stronger hypothesis is:

> **Execution-bound delegated capital authority**, where the governed capital path itself enforces standing and exceptional authority.

This remains a hypothesis.

### Relationship signal

Eric offered technical help, possible repo review/contribution, future idea exchange and referrals.

Treat this as a valuable founder/community relationship, not customer validation or adoption.

See:
- `research/INTERVIEW-SANCTION-2026-09-29.md`
- `research/SANCTION-DELTA.md`


## 24. System Control Plane Reconciliation — 2026-10-01

This project has now been reconciled against the current canonical system in
`Faadil1/faadil-agent-system` on `main`.

This adoption begins **2026-10-01**. It is not backdated.

### Project status

- lifecycle: **ACTIVE**
- product state: **PRE-CONCEPT-LOCK**
- build authorization: **FALSE**
- exact next gate: **PRE_BUILD_REALITY_GATE__DIRECT_OPERATOR_EVIDENCE**
- terminal completeness: **FALSE**

### Newly active project-level control artifacts

- `state/HANDOVER.yaml`
- `governance/LIFECYCLE-COVERAGE.yaml`
- `governance/EVIDENCE-GRAPH.yaml`
- reconciled `governance/GATEWAY-REGISTRY.yaml`

### Product Reality v1.3

Central `PRODUCT-REALITY-POLICY.yaml@1.3.0` now governs future material touches.

Preserved laws include:

- Vertical Slice = entry point, not Definition of Done.
- Technical Proof ≠ Live Product Integration.
- PRODUCT VALUE + REAL ACTION > proof artifacts.
- Evidence is exhaust of real product behavior, not the primary engine.
- Live mode is primary; replay/deterministic evidence is secondary/fallback.
- Read-only is not the default when a safe, value-creating real action is feasible.
- After the first live World’s Fair vertical slice, run the Product Exploitation Loop while marginal product value, differentiation, integration depth, real consequence or resilience justifies cost/risk/deadline.

### Product Exploitation Loop status

**PENDING / NOT TRIGGERED.**

Reason:
the historical Stocklana baseline is not silently reclassified as the first live vertical slice of the not-yet-selected World’s Fair wedge.

The loop activates only after:
1. Concept Lock;
2. build authorization;
3. first live World’s Fair vertical slice.

### Evidence Graph

A bounded project graph now exists at `governance/EVIDENCE-GRAPH.yaml`.

It preserves:
- historical Stocklana proof at its real class;
- missing commit/deployment edges as missing;
- World’s Fair live claims as MISSING until a real runtime exists;
- operator-value hypotheses as UNKNOWN until direct evidence exists.

### Reference Intelligence

The Adevar Labs pre-audit-credit listing supplied during this project has been routed into the central Reference Intelligence inbox as:

`adevar_pre_audit_credits_cwf_2026`

State:
- pipeline: CLASSIFIED
- adoption: REFERENCE_ONLY
- authority: NONE

No product direction, security claim or side-track participation is implied by registration.

### Rule Lifecycle / Cross-project learning

Decision:
**NO_CHANGE.**

This reconciliation does not create a new universal rule. The Eric/Sanction interview remains one project-specific expert signal, not a cross-project law.

### Exact unresolved product question

The strongest current residual remains:

> Can CRESCO create valuable **execution-bound delegated capital authority** that sits below or beside a governance/authorization plane, preserving standing authority while allowing bounded exceptional authority at the actual capital path?

Still unproven:
- operator pull;
- CRESCO-specific willingness to pay;
- exact vs temporary/session exception preference;
- stale-policy semantics by operator;
- material value of atomic exception-consume + execution.

No Concept Lock is earned from the reconciliation itself.


## 25. Concept Lock — 2026-10-01

The direct-operator checkpoint produced no new replies beyond Eric/Sanction. The human owner explicitly instructed the project to advance if no reply arrived.

This creates a **BUILD_WITH_VALIDATION_GAP** path.

The validation gap remains visible:
- direct operator evidence: MISSING/BLOCKED;
- CRESCO-specific WTP/pull: MISSING/BLOCKED;
- two credible target operators willing to test: MISSING;
- operator exception-shape distribution: MISSING;
- operator stale-policy preference: MISSING;
- atomic execution desirability: MISSING.

These are not converted into PASS.

### Locked World’s Fair product direction

**CRESCO = execution-bound delegated capital authority for Solana.**

Initial vertical:
**Delegated Trading / Capital Mandates.**

Primary user roles:
- principal / allocator;
- delegated trading strategy/operator;
- risk owner for exceptional authority.

Core job:

> Let a delegated strategy act autonomously inside standing risk limits while allowing a principal to authorize a bounded exceptional trade without turning that exception into broader future authority.

Canonical lock artifact:
`product/CONCEPT-LOCK-2026-10-01.md`

### V1 bounded semantics

- one supported Solana execution adapter/venue;
- one explicit trade-like action;
- SOFT boundary: per-action/per-trade notional;
- HARD boundary: unsupported or unparseable execution adapter/action;
- exception: exact, one-use;
- mutation invalidates;
- replay refuses;
- any Mandate nonce/version change invalidates the prior exception in v1;
- standing Mandate remains unchanged by the exception;
- exceptional execution still updates the relevant period counters;
- Pyth evidence may restrict/refuse but never grant authority;
- no arbitrary CPI.

The exact-one-use and all-revision-stale semantics are bounded v1 choices, not universal market claims.

## 26. Technical Reality Check — 2026-10-01

Verdict:
**PASS_WITH_BOUNDED_DELTA**

Canonical artifact:
`technical/TECHNICAL-REALITY-CHECK-2026-10-01.md`

Observed reusable baseline:
- versioned Mandate/nonce;
- active/paused/revoked authority state;
- notional policies and per-asset rules;
- Pyth Lazer verification in the capital path;
- one-use AllowanceReceipt;
- request/hash and exact-notional checks;
- stale authorization refusal;
- token movement, counter mutation and allowance consumption in one Solana transaction.

Missing bounded implementation delta:
- real trade-like action semantics;
- one selected venue/program adapter;
- base/quote and action parameter binding;
- constrained CPI/account semantics;
- semantic mutation tests.

Build remains **NOT AUTHORIZED** until Backend Engineering Intelligence and Demo-First Architecture converge the exact execution adapter and implementation contract.

## 27. Exact next gate

**BACKEND_ENGINEERING_INTELLIGENCE__VENUE_ADAPTER_SELECTION**

Exact next action:
select one Solana execution venue/adapter, define `TradeActionV0`, constrain CPI/program/account semantics, verify a safe test environment, and produce the implementation-ready Demo-First Architecture.


## 28. Backend Engineering Intelligence — 2026-10-01

Selected v1 execution adapter:
**Orca Whirlpools on Solana Devnet.**

Why:
- real devnet deployment;
- explicit on-chain CPI integration surface;
- current Orca repository uses Anchor 0.32.1, matching the historical CRESCO program;
- official devnet pools/tokens exist;
- a swap is enough real action to make CRESCO’s authority semantics load-bearing without introducing an order-book or arbitrary-DeFi platform.

Canonical artifact:
`technical/BACKEND-ENGINEERING-INTELLIGENCE-2026-10-01.md`

Initial pool candidate:
- devUSDC/devUSDT;
- Orca devnet pool `63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg`.

Runtime liquidity/availability remains to be proven before live promotion.

## 29. Bounded Implementation Specification

Canonical artifact:
`spec/WORLDS-FAIR-V1-IMPLEMENTATION-SPEC.md`

V1:
- `SWAP_EXACT_IN`;
- deterministic `TradeActionV0`;
- constrained Orca program/pool/account semantics;
- approval-gated real devnet write;
- shared product core;
- no arbitrary CPI.

## 30. Demo-First Architecture

Canonical artifact:
`technical/DEMO-FIRST-ARCHITECTURE-2026-10-01.md`

The judge-facing path begins with real autonomous action, reaches the soft boundary quickly, demonstrates exact exceptional authority, mutation refusal, atomic execution/consumption, replay refusal and unchanged standing authority.

## 31. Build authorization

Status:
**AUTHORIZED — BOUNDED WORLD’S FAIR V1 ONLY.**

Build authorization does not remove the operator-validation gap.

Exact next gate:
**BUILD__FIRST_LIVE_VERTICAL_SLICE**

After the first real end-to-end slice works, Product Reality v1.3 requires the Product Exploitation Loop before terminal polish.
