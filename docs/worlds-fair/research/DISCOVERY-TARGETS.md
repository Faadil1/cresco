# Discovery Target Shortlist

Date: 2026-09-26
Status: outreach candidates — no contact claimed

## Selection rule

Prioritize people who can answer from recent operating behavior, not generic Web3 opinions.

## Agent Builders

### Eric Lovold — Sanction

Why:
Sanction is the closest public semantic overlap found so far: exact retry, one-use grant, human escalation, immutable policy revisions and evidence replay.

Public references:
- https://github.com/ericlovold/sanction
- https://getsanction.com/
- public contact listed in Sanction privacy policy: [contact redacted]

Questions:
- Which user requests drove one-use grants instead of temporary sessions?
- How often do escalations occur?
- Do users care about the relationship between the violated rule and the grant, or only the final approval?
- Do policy changes invalidate already approved grants?
- Which fields have caused real GRANT_MISMATCH events?
- What do customers ask for that Sanction intentionally does not solve?

Priority: VERY HIGH — both competitor teardown and expert discovery.

### Session.money / LazorKit ecosystem

Public handles surfaced:
- @session_money
- @0xYann_
- @chaukhac_
- @kay_x64

Why:
They made the opposite product bet: agent requests a bounded session (duration + cap + scope), human approves once, then many actions can execute.

Question:
Why a session instead of exact transaction tickets? What behavior led to that design?

Priority: VERY HIGH — direct Exception Shape Test.

### AgentWallet SDK maintainers / users

Public project:
https://github.com/up2itnow0822/agent-wallet-sdk

Why:
Another explicit model of autonomous spending under caps with escalation above thresholds.

Questions:
- What happens after an above-threshold request is approved?
- Is the approval exact, threshold-based, or a temporary policy change?
- What integration complaints appear most often?

Priority: HIGH.

## Treasury / Crypto Ops

### Squads operators / DAO finance contributors

Why:
Squads is the baseline standing-authority system CRESCO must beat.

Start with:
- teams using Spending Limits for recurring operations;
- DAO finance / operations leads;
- MetaDAO launch teams with public monthly spending-limit configurations.

Public evidence source:
https://github.com/metaDAOproject/programs

Questions:
- last legitimate transaction above the spending limit;
- proposal vs config-change workflow;
- how often temporary increases happen;
- whether an already-approved proposal survives config changes;
- which evidence is required for audit.

Priority: VERY HIGH.

### RaYYeR220 — squads-treasury-skill

Public repo:
https://github.com/RaYYeR220/squads-treasury-skill

Why:
Built explicit tooling around Squads treasury configuration risk and proposal lifecycle. Useful as a technical/operator expert even if not a buyer.

Priority: HIGH.

## Delegated Trading

### Ergonia / Flint Labs

Public evidence:
https://jobs.solana.com/companies/flint-labs/
https://jobs.solana.com/companies/ergonia/

Why:
Crypto-native Solana market-making and exchange teams with explicit risk-system work.

Questions:
- last legitimate order blocked by risk controls;
- exact trade vs temporary risk envelope;
- acceptable approval latency;
- whether overrides happen in humans, code or both;
- stale-policy semantics;
- whether onchain enforcement improves the workflow.

Priority: VERY HIGH.

### Ellipsis Labs / Phoenix ecosystem

Public figures / references:
- Eugene Chen
- Rahul Jain
- https://www.ellipsis.xyz/ / Phoenix ecosystem

Why:
Long-running Solana order-book / market-making experience; strong source for whether delegated-capital exception semantics matter in low-latency environments.

Priority: HIGH.

## Organizational Spend — analogue lane

### Ramp community user pattern

Public thread:
https://community.ramp.com/t/set-a-date-on-temporary-limit-increases/1228

Use as behavioral evidence, not as a person to cold-contact outside the forum without context.

Key signal:
Operators may prefer a temporary envelope with explicit expiry over exact-action authorization.

## Outreach sequencing

1. Sanction / Session.money — fastest way to attack the Agent lane.
2. Squads/MetaDAO treasury operators — validates real boundary workflow.
3. Ergonia/Flint/Ellipsis — validates trading override shape and latency.
4. Corporate-spend analogues — informs exception taxonomy, not necessarily World’s Fair wedge.

## Interview evidence standard

A useful interview must capture:
- one recent concrete event;
- standing policy;
- boundary crossed;
- current workaround;
- exact authority object issued;
- duration/use count;
- approver;
- latency;
- audit evidence;
- policy-change interaction;
- measurable cost/risk;
- whether they would trial a different mechanism.

Do not count:
- “sounds cool”;
- generic security concern;
- TAM commentary;
- willingness-to-pay hypotheticals without workflow evidence.


---

# Discovery Targets — Wave 2 After Sanction Interview

Date: 2026-09-29
Status: READY_FOR_OUTREACH

## Why this wave is different

The Sanction founder interview sharpened the research boundary:

> Sanction wants to govern decisions/authorization, not act as the fiduciary execution layer.

The next discovery wave must therefore prioritize people who actually operate:
- institutional wallets;
- trading desks;
- risk systems;
- Solana vaults;
- onchain execution infrastructure.

The core question is now:

> **Who owns final authority at execution time, and what happens when a legitimate action crosses standing policy without justifying a permanent policy change?**

---

## Priority A — Fordefi product / security / trading workflows

### Why

Fordefi is unusually close to the CRESCO residual because it combines:
- institutional MPC wallet infrastructure;
- transaction simulation;
- transaction-policy enforcement;
- approval workflows;
- signing and broadcasting;
- API-driven trading;
- Solana support;
- institutional trading and treasury users.

Public materials show that Fordefi lets trading firms set:
- protocol/action policies;
- notional caps;
- gas/slippage limits;
- token allowances;
- approver workflows.

Key research question:

> When an otherwise legitimate transaction violates a standing hard cap, can an authorized principal approve that one transaction without permanently editing the policy?

Secondary questions:
- what happens if policy changes after approval but before signing/broadcast?
- are exceptions represented separately from policy edits?
- do institutional customers want exact-action override or temporary envelope?
- what does Fordefi treat as hard and non-overrideable?

Public contact surfaces:
- [contact redacted]
- [contact redacted]

Potential founder/product routes:
- Josh Schwartz — CEO/co-founder
- Dima Kogan — CTO/co-founder
- Michael Volfman — VP R&D/co-founder

Evidence sources:
- Fordefi policy engine
- Fordefi trading-firms solution
- Keyrock customer story

Status: **TOP PRIORITY / READY**

---

## Priority A — Keyrock / Jeremy de Groodt / trading operations

### Why

Keyrock is a real institutional market maker operating onchain both manually and algorithmically and publicly describes Fordefi as its DeFi wallet/policy layer.

This is direct operator evidence, not infrastructure-founder evidence.

Primary target:
- Jeremy de Groodt — Co-Founder & CTO

Research question:

> Tell us about the last time a legitimate automated/onchain trade could not proceed because of a wallet, risk, venue, notional or approval limit. What happened next?

Then:
- resize/abandon?
- policy edit?
- temporary limit?
- exact one-trade exception?
- co-sign?
- how quickly did the decision need to happen?
- what evidence had to survive afterward?

Public route:
- Keyrock official contact form
- market-making / ecosystem-development contact route

Status: **TOP PRIORITY / DIRECT OPERATOR**

---

## Priority A — Wintermute / Head of Risk

### Why

Wintermute combines:
- high-frequency / algorithmic crypto trading;
- DeFi execution;
- dedicated risk/control functions.

Public leadership identifies:
- Alain Passini — Head of Risk
- Jonathan Chan — Global Head of Business Development & Partnerships

Alain is particularly relevant because his background spans:
- digital asset risk;
- prime brokerage;
- e-trading;
- institutional financial controls.

Research question:

> When a pre-trade/risk control blocks a legitimate action that the desk still wants to execute, what authority object or workflow actually exists?

Need to understand:
- trade-specific override;
- temporary envelope;
- policy change;
- designated risk approval;
- latency tolerance;
- audit lineage.

Public route:
- Wintermute official contact form → Other / Legal & Compliance where appropriate.

Status: **TOP PRIORITY / DIRECT RISK OPERATOR**

---

## Priority A — Kamino Institutional / Curator infrastructure

### Why

Kamino is directly relevant to CRESCO World’s Fair:
- Solana-native;
- institutional vault infrastructure;
- strategies operate under risk mandates/parameters;
- Galaxy has just launched institutional USDC/USDT curated vaults on Kamino.

Public contact:
- [contact redacted]

Relevant public people:
- Michael Weisz — CEO
- Marius Ciubotariu — Co-Founder

Research question:

> When a curator/operator wants to make an action outside the currently configured risk mandate, is the correct operation a mandate change, a temporary bounded exception, or is the action simply impossible?

Then:
- how are parameter changes authorized?
- which parameters are hard vs evolvable?
- could an exception exist without mutating the vault mandate?
- what state/receipts should prove the exception afterward?

Status: **TOP PRIORITY / SOLANA-NATIVE**

---

## Priority A — Galaxy Curation / Eduardo Bermudez

### Why

Galaxy Curation now applies its institutional lending/trading risk framework directly to Kamino vaults on Solana.

Public materials explicitly say its:
- collateral standards;
- exposure limits;
- market monitoring

are applied to the onchain vault strategies.

Relevant public person:
- Eduardo Bermudez — Director of Trading

Research question:

> In institutional onchain vault management, what happens when a desirable action falls outside the current exposure/mandate parameters?

This can directly test:
- standing mandate;
- exceptional authority;
- temporary risk envelope;
- policy evolution;
- operational latency.

Public route:
- Galaxy Global Markets contact flow
- professional outreach to Eduardo Bermudez

Status: **TOP PRIORITY / REAL CAPITAL CURATOR**

---

## Priority B — Drift Protocol execution / risk team

### Why

Drift is a Solana trading venue with:
- real-time risk engine;
- circuit breakers;
- automated/algorithmic execution;
- institutional offering;
- builder/trader APIs;
- market-maker workflows.

Public builder-support routes:
- Telegram @wdotsol
- Telegram @airtightfish
- Discord

Research question:

> Which risk boundaries in Drift should *never* be overrideable, and which legitimate actions—if any—need a principal/risk-owner exception path?

Secondary:
- would a one-trade authority object make sense at the client/wallet layer?
- where should final enforcement live: strategy, wallet, protocol, or all three?

Status: **HIGH VALUE / SOLANA EXECUTION EXPERT**

---

## Priority B — Turnkey policy-engine team

### Why

Turnkey is an important Feature Absorption / signing-layer test.

It already supports:
- programmable wallet policies;
- limits;
- approvals;
- scoped sessions;
- Solana;
- transaction policy enforcement at the signing layer.

Public contact:
- [contact redacted]

Relevant public founders:
- Bryce Ferguson
- Jack Kearney

Research question:

> Is “exceptional authority beyond standing policy without editing the policy” naturally a wallet-policy feature, or does it require a separate execution/capital authority layer?

This is less valuable as customer evidence, but highly valuable for killing false architectural novelty.

Status: **COMPETITOR / ARCHITECTURE TEST**

---

## Priority B — Chaos Labs risk researchers

### Why

Chaos Labs is useful for the hard-vs-soft boundary taxonomy, not for customer validation.

Public research contacts include:
- Omer Goldberg — [contact redacted]
- Yonatan Haimovich — [contact redacted]

Their published methodologies cover onchain risk parameters and real-time risk-management design.

Research question:

> Which financial risk limits are conceptually safe to make exceptionable for one action, and which should only change through policy evolution?

Status: **RISK-DESIGN EXPERT / NOT OPERATOR VALIDATION**

---

## Recommended contact order

1. Fordefi
2. Keyrock
3. Kamino Institutional
4. Wintermute Head of Risk
5. Galaxy Curation
6. Drift
7. Turnkey
8. Chaos Labs

## Why this order

The first five can directly test whether CRESCO's surviving residual is:
- a real workflow;
- already solved;
- a wallet feature;
- a risk-desk procedure;
- or a meaningful execution-layer primitive.

## Strongest question across all operator interviews

> **Tell me about the last time a legitimate action hit a standing risk or policy boundary but you still wanted it to execute. What happened next?**

Do not introduce CRESCO until past behavior is understood.

## Pull test

Only after workflow discovery:

> If we gave you a Solana sandbox where standing authority and exceptional authority were separate, and the exception could be consumed by the actual capital execution path, would you test it with one representative workflow?

Strong signal:
- agrees to sandbox/test;
- provides anonymized event;
- introduces risk/ops owner;
- supplies integration constraints.

Weak signal:
- “interesting” / “cool” only.
