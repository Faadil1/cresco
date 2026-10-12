# Public Discovery Evidence — 2026-09-26

Status: PUBLIC / NON-INTERVIEW EVIDENCE

## Purpose

Capture observable behavior before conducting interviews.

This file does **not** claim customer discovery. Public documentation, product behavior, regulatory requirements, forum posts and public repositories are weaker than direct user interviews, but they can identify where the real questions are.

## 1. Organizational spend: evidence favors temporary envelopes

### Ramp — temporary limit changes

Ramp currently supports temporary increases to recurring card/fund limits. An approver can approve a temporary change that automatically resets at the end of the current spend cycle, or toggle it into a permanent change.

Source:
https://support.ramp.com/temporary-changes-to-spending-limits-on-your-card-or-funds

Observed implication:
- users do not necessarily want exact-transaction approval;
- they may want a **temporary bounded envelope**;
- temporary and permanent authority are explicitly separate decisions.

### Ramp community — requested custom expiry

A public Ramp user described repeated cases where a cardholder needed a temporary increase for 6–8 weeks. Because the existing temporary increase resets every cycle, the workaround was either:
- manually re-apply it every cycle; or
- make the increase permanent, then remember to reduce it later.

The user explicitly requested an expiry date for the temporary authority.

Source:
https://community.ramp.com/t/set-a-date-on-temporary-limit-increases/1228

Observed implication:
- permission drift / forgotten rollback is a real operational behavior;
- however, the demanded object is **parametric temporary authority**, not an exact single transaction;
- this is evidence against assuming CRESCO exact-once is the universal exception shape.

### OSFI acquisition-card audit

A Canadian public-sector audit found purchases above a $5,000 acquisition-card threshold where temporary limit increases were permitted with prior approval, but evidence of the required approvals could not be demonstrated for the sampled transactions.

Source:
https://www.osfi-bsif.gc.ca/en/about-osfi/reports-publications/audit-employee-expense-reimbursement-acquisition-card-management

Observed implication:
- approval lineage / evidence can be as important as the limit itself;
- temporary authority without durable proof creates audit risk.

## 2. Treasury: standing autonomy is already real

### Squads

Squads Spending Limits let designated members move a defined amount of an asset from a treasury without full multisig approval. Parameters include token, maximum amount, time frame and optional destination restrictions.

Source:
https://docs.squads.so/main/navigating-your-squad/settings/spending-limits

Observed implication:
- the principal/delegate + standing-authority model is already operational;
- CRESCO cannot differentiate on bounded treasury autonomy itself.

### MetaDAO programs

Public MetaDAO code configures monthly Squads spending limits for launch teams, including explicit examples of 50k, 60k, 100k, 175k and 250k USDC monthly spending limits.

Source:
https://github.com/metaDAOproject/programs

Observed implication:
- standing delegated authority is not hypothetical;
- there are real onchain treasury workflows to interview about boundary events;
- the missing evidence is what teams do **when those standing limits are legitimately insufficient**.

## 3. Agent builders: exact one-use escalation already exists

### Sanction

Sanction publicly describes:
- standing policy with auto-approve, escalation and deny;
- one-use grants after human approval;
- retry of the exact same request with a `grant_id`;
- field mismatch refusal (`GRANT_MISMATCH`);
- immutable policy revisions;
- storage of the exact evaluated context;
- replayable evidence;
- policy simulation before changes;
- audit exports.

Source:
https://github.com/ericlovold/sanction

Particularly important public semantics:
- spend request fields include action, amount, merchant, category and description;
- after escalation, the identical request must be retried with the one-use grant;
- changing request fields requires a new approval.

Observed implication:
- **exact request + human escalation + one-use grant + policy revision + audit context is not a CRESCO-exclusive residual**;
- the generic Agentic Authority lane is therefore at severe competitive risk;
- CRESCO would need a materially different residual such as explicit Policy Diff/minimal exceptional delta, capital-path/onchain semantics, or a vertical-specific authority workflow.

### Session.money

Session.money lets an agent request a bounded spending session by proposing:
- duration;
- cap;
- scope.

A human approves once, then the agent executes within the onchain cap.

Source:
https://www.session.money/

Observed implication:
- the competing exception shape is a **scoped session**, not exact-action approval;
- interviews must determine which shape operators actually prefer.

## 4. Delegated trading: the decision lattice is structurally validated

European algorithmic-trading rules require firms to have procedures for orders blocked by pre-trade controls that the firm still wants to submit. These overrides must be:
- tied to a specific trade;
- temporary;
- exceptional;
- verified by risk management;
- authorized by a designated person.

Sources:
https://handbook.fca.org.uk/technical-standards/s119c1039
https://eur-lex.europa.eu/eli/reg_del/2017/589/oj/eng

Observed implication:
- `REFUSE → exceptional authorization without permanent limit change` is a real, mature operational pattern;
- this strongly validates the *problem shape*;
- it does **not** validate CRESCO as the solution because trading risk systems may already implement the workflow adequately.

### Existing trading-risk products

Raptor and TRAFiX publicly describe configurable pre-trade limits, real-time/intraday changes and overrides.

Sources:
https://raptortrading.com/products/
https://trafix.com/our-services/

Observed implication:
- competitive residual must be tested against real OMS/EMS/risk workflows;
- CRESCO cannot assume that exact exception semantics are missing.

## 5. Current evidence impact by lane

| Lane | New public evidence | Effect |
|---|---|---|
| Treasury / Crypto Ops | Squads + MetaDAO prove standing delegation | Problem environment strengthened; exception workflow still unknown |
| Agent Builders | Sanction already implements very close one-use exact escalation semantics | **Competitive residual sharply weakened** |
| Agent Builders | Session.money implements scoped sessions | Exception-shape uncertainty increased |
| Delegated Trading | Regulations explicitly require specific temporary exceptional overrides | **Problem shape strongly validated** |
| Org Spend | Ramp user requests custom-duration temporary limit; OSFI audit shows approval-evidence gaps | Temporary-envelope + evidence need validated |
| Family | No new evidence in this pass | Unchanged |

## 6. No-interview rule

None of the evidence above counts as:
- willingness to pay;
- customer pull;
- user preference for CRESCO;
- a validated wedge;
- Concept Lock.

Direct interviews / trials remain required.
