# Collaborator Onboarding — CRESCO World’s Fair

Status: PRE-CONCEPT-LOCK  
Audience: collaborators joining the World’s Fair workstream

## 1. Start here

Read these in order:

1. `README.md`
2. `product/PRD.md`
3. `state/CURRENT.yaml`
4. `governance/GATEWAY-REGISTRY.yaml`
5. `governance/PRODUCT-DEPTH-LIVE-REALITY-v1.2.1.md`
6. `governance/REALITY-LEDGER.md`
7. `research/CONCEPT-COLLISION-V3.md`
8. `research/TRADING-BOUNDARY-TAXONOMY.md`
9. `docs/REALITY-GATE.md`

The PRD is the collaborative source of truth.

## 2. Current state in one paragraph

CRESCO began as a Stocklana family-finance proof of a deeper authority primitive: a delegate can act autonomously inside a standing Mandate; when an action crosses a soft boundary, the normal path refuses; the principal may then grant bounded exceptional authority without silently widening the standing Mandate.

For World’s Fair, the team is **not yet Concept Locked**.

The leading evidence lane is currently **Delegated Capital Authority for autonomous onchain strategies**, but it is still a hypothesis.

Treasury Intent remains a strong secondary lane.

Generic Agentic Authority is at high competitive risk.

Family remains an active product/UX research lane, not the default company direction.

## 3. What is proven already

From the Stocklana baseline:
- Solana Devnet capital-path enforcement;
- in-bound autonomous execution;
- fail-closed refusal;
- versioned Mandates / nonces;
- stale authorization refusal;
- one-time exception;
- mutation refusal;
- replay refusal;
- Pyth-derived price/notional checks;
- atomic token movement + exception consumption;
- evidence/learning does not auto-expand authority.

Truth boundary:
- Devnet only;
- demo SPL token;
- no brokerage/custody/mainnet/real-stock/minor-securities claims.

## 4. What is NOT proven

Do not treat these as facts:
- that Delegated Trading is the final wedge;
- that users prefer exact exceptions over temporary envelopes or sessions;
- that Policy Diff is valuable enough to buy;
- that CRESCO is a new category;
- that one-trade override is novel;
- that generic agent guardrails are white space;
- that onchain atomicity alone is a company;
- that customer demand or willingness to pay is proven.

## 5. Current leading residual

After teardowns of Sanction, Session.money, Primer Vault, Squads, Safe-style patterns and institutional trading overrides, the surviving hypothesis is narrower:

> Can CRESCO bring explicit standing authority vs exceptional authority into machine-delegated onchain capital, with verifiable lineage and atomic exception consumption + execution?

Current distinction under test:

```
review within standing policy
vs
exception to standing policy without mutating it
```

Example:

```
Standing Mandate:
max trade = $100k

Requested:
$140k legitimate trade

Normal path:
REFUSE

Principal may:
- Decline
- Authorize this exceptional action
- Change the standing Mandate

If exceptional action executes:
standing max remains $100k
```

## 6. Hard rule: not every refusal is overrideable

Working boundary classes:

- `HARD`
- `UNKNOWN_FAIL_CLOSED`
- `SOFT_EXACT`
- `SOFT_ENVELOPE`
- `EVOLVABLE_ONLY`

Example:

```
SOFT
per-trade notional exceeds standing cap
→ exceptional path may exist

HARD
unsupported/unparseable execution path
→ REFUSE
→ no "Allow Once"
```

This is critical to product integrity.

## 7. Current decision status

```
Delegated Trading / Capital Authority
→ LEADING EVIDENCE LANE
→ NOT CONCEPT LOCKED

Treasury Intent
→ SECONDARY HIGH-VALUE LANE

Generic Agentic Authority
→ HIGH COMPETITIVE RISK

Family
→ ACTIVE UX / PRODUCT RESEARCH LANE

BUILD_AUTHORIZED
→ FALSE
```

## 8. What collaborators may work on now

Allowed:
- challenge the current lane;
- user/operator discovery;
- competitive teardown;
- product-flow critique;
- hard-vs-soft boundary reasoning;
- Policy Diff UX;
- killer-demo narrative;
- visual reference exploration;
- prototype/mockup only when used to test comprehension;
- technical feasibility spikes;
- PRD edits supported by evidence.

Not allowed yet:
- silently locking the wedge through implementation;
- building a generalized policy engine;
- arbitrary CPI authorization;
- rewriting the baseline history;
- changing core invariants because a UI or demo is easier that way.

## 9. High-value product/design questions

A collaborator can add immediate value by attacking:

### A. Comprehension

Can a user understand, in seconds, the difference between:
- normal authority;
- a refused action;
- exceptional authority;
- permanent policy change?

### B. Hard vs soft boundaries

Does the interface make it visually obvious that:
- some boundaries are negotiable by the principal;
- some are not;
- UNKNOWN never turns into ALLOW?

### C. Policy Diff

Can the principal clearly see:

```
PAIR        ✓
VENUE       ✓
PRICE       ✓
NOTIONAL    ✕ +$40k
```

without turning the product into a generic risk dashboard?

### D. Post-exception state

After an exceptional action:
- what authority remains?
- what counters changed?
- what evidence is visible?
- can the user immediately tell that standing authority did not silently drift?

### E. World’s Fair demo

The current killer-demo candidate must communicate:

> The strategy can act autonomously, but one exceptional approval does not become broader future authority.

## 10. Design direction rule

Visual work should not default to:
- generic fintech SaaS;
- dark navy / black crypto dashboards;
- simplistic ivory;
- AI-slop gradients/cards;
- decorative motion.

Use TRACE/reference intelligence when product direction is sufficiently stable.

Motion must have a job:
- attention;
- orientation;
- causality;
- hierarchy;
- continuity;
- feedback;
- spatial comprehension;
- brand expression.

## 11. Collaboration protocol

For any material product suggestion, record:

- proposed change;
- evidence;
- user/problem affected;
- invariant affected;
- alternatives considered;
- what would falsify it;
- whether it changes the PRD;
- whether it requires Concept Lock.

Do not resolve strategic disagreement by implementation first.

## 12. Best first contribution

Review the current leading lane and answer:

1. Is the principal/delegate/boundary/exception model understandable without explaining the architecture?
2. Is `exception-to-policy` visibly different from ordinary human approval?
3. Which boundaries should look HARD vs SOFT?
4. Does the proposed Trading killer demo feel like a real product or a security mechanism looking for a market?
5. What product/company direction would you preserve or challenge before Concept Lock?

Post findings in the relevant GitHub issue and amend the PRD only when evidence warrants it.


## 13. Gateway rule

Every build stage uses the Conditional Gateway Registry.

A gate must never be silently omitted. It must always be one of:

`ACTIVE` / `N/A` / `BLOCKED` / `PROVEN`

`N/A` means “not currently applicable,” not “forgotten.”

Any scope, architecture, runtime, sponsor, evidence or submission change triggers a registry re-evaluation.
