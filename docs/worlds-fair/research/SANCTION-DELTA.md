# Sanction vs CRESCO — Residual Teardown

Date: 2026-09-26  
Status: HIGH-PRIORITY COMPETITIVE ANALYSIS

## Why Sanction matters

Sanction is the closest public reconstruction found so far for the Agent Builder lane.

It already implements:
- standing policy;
- approve / escalate / deny;
- human escalation;
- one-use, expiring grants;
- exact request retry;
- mismatch refusal;
- immutable policy revisions;
- stored decision context;
- deterministic evidence replay;
- audit exports;
- agent/tool/capability/spend governance.

Source:
https://github.com/ericlovold/sanction

## What CRESCO cannot claim against Sanction

Do not claim that CRESCO is novel because it has:
- one-use human approvals;
- exact retry after escalation;
- mutation refusal;
- policy revision history;
- audit/evidence;
- fail-closed authorization;
- standing budgets;
- human escalation.

Sanction already ships these patterns.

## Residual 1 — stale-policy semantics

### CRESCO baseline

CRESCO’s existing allowance is bound to the current Mandate nonce.

If standing authority changes and the nonce advances, old authorization material becomes stale and refuses.

### Sanction public code

The inspected `consumeGrantCore` path checks:
- wallet / agent identity;
- action type;
- source type;
- grant status;
- grant expiry;
- exact request/resource match;
- optional execution-token validity/budget.

In the inspected consumption path, there is **no visible comparison between the grant and the wallet’s current policy revision**.

The grant is sourced from an AuthorizationRequest that records the policy revision used at decision time, but the Grant model/path inspected does not visibly require that revision to remain current at redemption.

### Research conclusion

This is not proof that Sanction lacks stale-policy handling everywhere.

It is a **specific open question supported by code inspection**:

> If policy v7 produced an approval/grant and the wallet moves to policy v8 before redemption, should the v7 grant still execute?

CRESCO currently answers:
- incompatible standing-authority transition → old authorization stale.

Whether that is the right semantic for Agent/Treasury/Trading must be validated by users.

## Residual 2 — authorization attempt vs atomic execution

Sanction documentation explicitly states:

> A consumed grant authorizes one attempt, not proof of completion.

If downstream broker/tool forwarding fails after consumption, Sanction does not restore the grant; the outcome becomes unknown and the operator must inspect the target system.

This is a legitimate and honest architecture choice for a cross-provider authorization plane.

CRESCO’s current onchain allowance path is different:
- authority check;
- exact notional validation;
- capital transfer;
- allowance consumption

occur in the same Solana transaction.

If that transaction fails, state changes roll back atomically.

### Potential CRESCO residual

For onchain capital:

> **exception authority and capital execution can settle atomically.**

This may provide stronger semantics than an offchain authorization service that issues permission before a downstream system executes.

Status:
**TECHNICALLY REAL DIFFERENCE / PRODUCT VALUE UNPROVEN.**

## Residual 3 — semantic request vs capital-path action

Sanction spend grants currently bind semantic request fields including:
- action;
- amount;
- merchant;
- category;
- description.

Tool grants can bind the complete argument object.

But Sanction is primarily an authorization plane. Its own compatibility docs distinguish cooperative enforcement paths from hosted broker/gateway enforcement.

CRESCO’s current proof controls a specific onchain capital path directly.

Potential value:
- the delegate cannot simply ignore a CRESCO decision on that path;
- execution and authority state can be composably verified onchain.

Status:
**REAL ARCHITECTURAL DISTINCTION / MARKET VALUE UNPROVEN.**

## Residual 4 — explicit Policy Diff

Sanction returns machine-readable decision codes and, for denials, live values for the fired rule.

That is already close to explainable boundary evaluation.

The remaining CRESCO hypothesis must be narrower:

```
Standing policy vN
vs
Requested action
→ complete violated-dimension set
→ minimal exceptional authority
→ principal authorizes exactly that delta
→ post-execution standing policy remains vN
```

Open questions:
- Do users need a *multi-dimensional diff*, or is one fired rule enough?
- Does “minimal authority delta” improve safety/audit enough to matter?
- Does the principal understand/care about this representation?

## What to ask Eric Lovold

1. When a one-use grant is minted under policy revision N, what happens if the policy changes before the grant is redeemed?
2. Was “grant authorizes one attempt, not completion” a deliberate customer-driven choice or a cross-provider implementation constraint?
3. Do customers ask to see *which exact policy dimensions* an escalated request violated, or is the decision code/remediation enough?
4. Why did Sanction choose one-use exact grants for escalation rather than scoped temporary sessions?
5. How often do real users hit escalation bands?
6. Which grant mismatches occur in real usage?
7. What customer requests does Sanction intentionally not solve?
8. Is enforcement at the capital/tool execution point important to customers, or is an authorization plane sufficient?
9. Have users asked for policy-change invalidation of already-approved grants?
10. Would an onchain atomic “grant + execution + consume” primitive be useful to Sanction, or redundant?

## Kill condition for Agentic CRESCO

Kill the generic Agent lane if:
- users do not care about stale-policy invalidation;
- attempt-vs-completion atomicity is not valuable;
- decision codes are sufficient and Policy Diff adds little;
- Sanction/Turnkey/Session-style control planes already satisfy the workflow.

Only keep Agentic as a lead wedge if discovery shows a recurring problem around one of these residuals.


## Founder interview update — 2026-09-29

Eric Lovold confirmed several important design concerns directly.

### Stale approval is a real concern

Eric identified stale approvals as one of the approval→execution failure modes.

His current reasoning:
- do not silently rewrite an approval;
- explicit revocation should invalidate;
- a newly added hard restriction/freeze should probably block earlier approval;
- the relevant change should be considered at redemption.

He did **not** say every policy revision should invalidate every grant.

CRESCO implication:
current nonce-bound invalidation is safe, but future vertical-specific semantics may need to distinguish incompatible/hardening changes from irrelevant policy edits.

### Action drift is a real concern

Eric explicitly raised the case where the action that executes is not materially the action the human thought they approved.

This strengthens the importance of:
- exact semantic binding;
- trusted representation;
- mutation refusal;
- execution-time verification.

### Unknown outcome and duplicate retry are real concerns

Eric described:
- action succeeds but response is lost;
- blind retry duplicates the effect;
- grant/authority is consumed but execution fails.

His key conceptual distinction:
**approved is not done.**

Recovery semantics were not completely clear in the transcript, so do not overstate the exact rule.

### Atomicity remains unvalidated

When asked whether authorization consumption and final execution should ideally be atomic if Sanction controlled the executor, Eric did not answer directly.

Therefore:
**CRESCO atomic exception + capital execution remains a technically real residual whose user value is still unproven.**

### Policy Diff remains unvalidated

Eric emphasized clear variables, finite/specific policies and agent scopes, but did not establish that a full multi-dimensional Policy Diff is needed at approval time.

Status:
**EXPLAINABILITY IMPORTANT / FULL POLICY DIFF DEMAND UNKNOWN.**

### Sanction explicitly stops before fiduciary execution

This is the strongest confirmed product-boundary finding.

Eric said Sanction:
- does not pass money;
- is not solving fiduciary execution;
- wants to be governance;
- wants to be a ledger, not a bank.

Potential CRESCO residual therefore becomes cleaner:

> **Execution-bound delegated capital authority, not another authorization ledger.**

This does not establish customer demand or moat.

### Layered authority is plausible

Eric said he sees room for different layers of authority/governance.

This supports architectural coexistence between:
- Sanction-like governance/authorization;
- wallet/executor/capital-layer enforcement.

Again, this is founder architecture reasoning, not market validation.

### Relationship signal

Eric offered:
- technical help;
- possible repo review/contribution;
- introductions/referrals;
- future idea exchange;
- interest in meeting the collaborator.

Treat as:
**HIGH-VALUE RELATIONSHIP SIGNAL / NOT CUSTOMER VALIDATION.**

See:
`research/INTERVIEW-SANCTION-2026-09-29.md`
