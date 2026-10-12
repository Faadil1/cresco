# CRESCO Semantic Teardown

Status: active  
Date: 2026-09-26

## Question

Can existing authorization systems reconstruct CRESCO closely enough that CRESCO is only a feature/workflow?

## Current comparison

| System | Standing authority | In-bounds autonomy | Boundary | Exceptional path | Mutation/replay | Permanent policy change | Residual question |
|---|---|---|---|---|---|---|---|
| CRESCO baseline | Versioned Mandate | Yes | REFUSE | ALLOW_ONCE | mismatch + used + stale nonce refusal | WIDEN → new version/nonce | Does Policy Diff + lineage matter? |
| Solana SDP | Policy profile + immutable revision | Yes | deny / approval_required | Approval Request | operation snapshot + idempotency/payload protections | new policy revision | Is CRESCO lifecycle materially richer? |
| Squads | Spending Limit | Yes | limit exceeded → normal transaction path | Vault Transaction + Proposal | proposal tied to transaction; stale mechanism | Config Transaction | Can this fully reconstruct CRESCO? |
| Safe | Spending Limit / allowance | Yes | out of allowance → Safe transaction | threshold-approved transaction | Safe transaction semantics; nonce | modify allowance/module | Is exact-once just standard multisig? |
| Turnkey | signing policies | Yes | policy deny / co-approval | human-agent consensus | signing request evaluated against policy | policy configuration | Is CRESCO only orchestration above Turnkey? |
| Sanction | policy + immutable revision | Yes | approve / escalate / deny | human approval → one-use grant | identical retry required; field mismatch refused; exact context retained; evidence replay | policy revision | **Very close reconstruction: what remains beyond explicit Policy Diff / capital-path semantics?** |
| Session.money | scoped session | Yes | session/cap boundary | human approves bounded session | session enforcement | create new session | Do users prefer envelope over exact action? |
| Primer Vault | trading policy + commissioned agent | Yes | hard reject or escalation | human review for policy-compliant trades | re-quote + current-policy re-check + pending expiry + duplicate-safe approval | edit policy | Can CRESCO own true exception-to-policy rather than review-within-policy? |
| RFC 9396 | authorization_details | within consent | outside consent denied | detailed consent | implementation dependent | re-consent | Does single-use + lineage add enough value? |

## Reconstruction Test

A near-complete CRESCO-like workflow can already be assembled conceptually as:

```
standing limit
+
transaction/proposal
+
nonce / stale checks
+
separate configuration transaction
```

Sanction makes the Agent-lane reconstruction even stronger:

```
standing policy
→ exact request
→ escalate
→ human approve
→ one-use grant
→ retry identical request
→ mismatch refusal
→ immutable policy revision + stored evaluated context
→ replayable evidence
```

Therefore the following are **not sufficient differentiation**:
- spend limits;
- one-time allowances;
- exact proposals;
- one-use human grants;
- exact retry requirement;
- versioning;
- policy revisions;
- audit logs;
- stored evaluated context;
- stale authorization;
- replay protection in isolation.

## Residual Hypothesis

CRESCO may still be distinct if it makes this relation first-class:

```
Standing Mandate vN
  ↕
Boundary violation
  ↕
Policy Diff
  ↕
Minimal exceptional authority derived from vN
  ↕
Execution evidence
  ↕
Standing Mandate remains vN
```

Candidate unique output:

```
NORMAL AUTHORITY:
what the delegate already had

EXCEPTION DELTA:
what extra authority was granted

POST-EXECUTION AUTHORITY:
what remains afterward
```

Potential residual dimensions that still require proof:
- explicit violated-policy dimension set;
- minimal exceptional delta computation;
- onchain/capital-path enforcement of that delta;
- domain-specific stale-policy semantics;
- cross-provider portability;
- trusted semantic representation of what the principal actually saw.

Status: **UNPROVEN / NARROWED FURTHER BY SANCTION**.

## Current implementation truth

The Stocklana CRESCO path already binds the one-time path to:
- request identity / request hash;
- execution asset / mint;
- current Mandate nonce;
- action type in hosted state;
- exact Pyth-derived approved notional;
- one successful use.

It does not yet prove arbitrary semantic binding across recipient / program / calldata / venue / slippage / fee payer for generalized transactions.

## Public behavioral evidence affecting exception shape

### Ramp
Public product behavior and forum requests show users want temporary increases that automatically revert, including custom-duration temporary authority. This is evidence that some real workflows prefer a **temporary envelope** rather than exact-action authorization.

### Trading
European algorithmic-trading rules explicitly require temporary, exceptional, risk-verified authorization for specific blocked trades. This validates the decision-lattice problem shape, but not CRESCO's competitive residual.

## Required Teardown Questions

### SDP
- Does an Approval Request preserve an explicit diff against the exact policy revision?
- Can an approval be modeled as an exception that leaves the standing profile unchanged?
- What happens after a policy revision changes while an approval is pending?
- Is exceptional authority itself reusable or transferable?

### Squads
- Can Spending Limit + Proposal + Config Transaction implement the full decision lattice?
- What exactly becomes stale after config changes?
- Can proposals express “exception to standing authority” rather than just independent transactions?
- Does the user need that semantic distinction?

### Safe
- Can module/guard architecture create exact, single-use, action-bound exceptions without changing allowances?
- If yes, is CRESCO only UX/orchestration?

### Turnkey
- Can policies + consensus approvals model the whole lifecycle?
- Is a transaction approval explicitly linked to violated policy dimensions?
- What information is preserved for audit?

### Sanction
- Does it compute the exact policy delta that caused escalation?
- Is the one-use grant explicitly derived from a policy revision?
- Does a policy change invalidate a pending/approved grant?
- Is the grant bound to a minimal authority delta or simply the repeated request context?
- What customer behavior drove one-use grants instead of sessions?
- Does it enforce at the actual capital execution layer or as an authorization plane the caller must respect?

### Session.money
- When do users prefer a scoped session over one exact action?
- Does session-based autonomy eliminate enough approval friction that exact exceptions are over-strict?

### RFC 9396 / PSD2
- How close can rich authorization + dynamic linking + nonce/expiry get to CRESCO?
- Is CRESCO’s value actually in delegated-policy lineage, not transaction consent?

## Kill Condition

If existing systems already provide adequate:
- standing autonomy;
- boundary decision;
- exact/temporary exception;
- stale-policy handling;
- clear audit lineage

and users do not value Policy Diff / explicit exceptional-authority lineage, then CRESCO’s current primitive is a feature rather than a company.


## Primer Vault — Trading reconstruction update

Primer Vault materially narrows the Trading residual.

Public code shows:
- per-trade max, daily volume and max slippage are hard policy rejects;
- human approval does not visibly override these hard caps;
- human review applies to trades that remain policy-valid but need review;
- approval re-quotes and re-applies the current policy;
- tightened policy while pending rejects;
- pending trades reserve daily volume;
- duplicate approval does not execute twice.

Therefore the relevant CRESCO distinction is no longer “human approval for risky trades.”

It is:

> **exception-to-policy vs review-within-policy**

Potential CRESCO residual:

```
Standing soft cap = $100
$140 legitimate trade
→ normal path REFUSE
→ principal grants bounded exceptional authority
→ execute once
→ standing cap remains $100
```

Status:
**CONCRETE COMPETITIVE RESIDUAL / USER VALUE UNPROVEN.**

See `research/PRIMER-VAULT-DELTA.md`.
