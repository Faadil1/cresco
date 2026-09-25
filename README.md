# CRESCO

**Financial independence should not happen all at once.**

CRESCO is a bounded-authority protocol for capital. Cresco is the family-facing product built on top of it.

A guardian defines a standing **Key**, implemented as a versioned Mandate. Inside that Key, a young person can act without asking for permission on every action. At the boundary, the action refuses or becomes a request. The guardian can say **Not this time**, **Allow once**, or **Widen the Key**.

> Learn in context. Act freely inside bounds. Ask for more freedom only at the boundary.

## Live product and proof

- Cresco: https://cresco-lac.vercel.app
- KEYS API: https://keys-api-stocklana.faadil-casecraft.workers.dev
- Network: Solana Devnet
- Program: ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk
- Canonical exact-action proof: https://github.com/Faadil1/keys/actions/runs/36150024852
- Current web CI: https://github.com/Faadil1/keys/actions/runs/36170242718
- Current Node/API CI: https://github.com/Faadil1/keys/actions/runs/36170242710

The current capital path moves a **demo SPL token**, not real securities. The current proven Money lane is AAPL with live Pyth market evidence. This is not brokerage, custody, mainnet execution, or real minor securities execution.

## The product model

The Key is standing authority, not a per-action approval queue.

| Situation | Result |
| --- | --- |
| Action is inside the active Key | ALLOW. No guardian approval is required. |
| Action reaches a standing boundary | REFUSE. The user can adjust, practice, or ask. |
| Guardian chooses Not this time | Standing Key stays unchanged. |
| Guardian chooses Allow once | One exact request can cross once. Standing Key stays unchanged. |
| Guardian chooses Widen the Key | A new standing Key version is created. |
| Market evidence is stale or insufficient | REFUSE or UNKNOWN. Never fabricate success. |
| Execution cannot be confirmed | PENDING or UNKNOWN. Never show a confirmed purchase. |

Learning, XP, P&L, badges, and AI scores never grant or widen authority.

Pyth can restrict or stop an action. Pyth can never grant more human authority.

## Canonical demo

The current judge-safe path is intentionally small:

1. **$5 AAPL** inside the Key: ALLOW.
2. **$12 AAPL** outside the current $10 action limit: REFUSE.
3. Ask for more room.
4. Guardian chooses **Allow once** for exactly $12.
5. Change the action to **$11**: REFUSE with AllowanceActionMismatch.
6. Restore the approved **$12**: ALLOW.
7. One-time permission becomes USED.
8. Standing Key remains **v7 to v7**.
9. Replay the same $12 permission: REFUSE with AllowanceAlreadyUsed.

The product point is simple:

> **The exception moved. The boundary did not.**

The technical point comes after the human interaction:

> **The UI is not the guard. The capital path is.**

## Why Solana

A normal database can reproduce much of the interface. KEYS uses Solana because the authority boundary is enforced in the same execution path that moves the demo capital.

The current program proves:

- program-controlled demo-token capital;
- in-bounds execution without guardian approval;
- out-of-bounds refusal;
- versioned Mandate and nonce lineage;
- stale authorization refusal;
- explicit guardian widening;
- pause and downward authority;
- exact single-use Allow once;
- replay refusal;
- signed Pyth verification in the capital path;
- Pyth-derived USD/notional enforcement;
- precommitted market-condition refusal.

## Real failure over fake success

**Real failure > fake success.**

Every build must retain at least one concrete, observable, verifiable negative event. A theoretical risk is not enough.

The required pattern is:

1. **Positive signal / opportunity**: why the problem is worth building for.
2. **Concrete negative event**: what actually failed, degraded, was rejected, lost value, or underperformed.
3. **Observable impact**: time, money, friction, blocked execution, error, churn, manual work, or another visible consequence.
4. **Design lesson**: what the failure teaches us the product must do or avoid.
5. **Response / mitigation**: how the build reduces, detects, contains, or refuses the failure.

Current examples are recorded in [evidence/BUILD-QUALITY-RECORD.json](evidence/BUILD-QUALITY-RECORD.json) and [docs/BUILD-QUALITY-RULES.md](docs/BUILD-QUALITY-RULES.md).

Two concrete examples are preserved:

- A Devnet deployment was blocked by an unfunded payer and faucet rate limiting. The workflow kept the state as BLOCKED_FUNDING instead of claiming deployment.
- A guardian-approved $12 one-time request was changed to $11. The Solana path refused it with AllowanceActionMismatch. The exact $12 then executed once, and replay refused with AllowanceAlreadyUsed.

Negative evidence stays in the record. It is not cleaned up simply because a later build passes.

## Fail-closed contract

KEYS treats refusal and uncertainty as first-class outcomes.

- **REFUSE** means the rule or evidence says the action must not execute.
- **PENDING** means execution was submitted but not confirmed.
- **UNKNOWN** means the system cannot prove the result.
- **ALLOW** is shown only when the relevant authority and proof are sufficient.

Examples covered by tests include stale authorization, stale or unavailable market evidence, unknown eligibility, unavailable authority runtime, out-of-bounds notional, changed one-time action, and replayed one-time permission.

## Architecture

~~~
Cresco
  |
  v
KEYS Cloudflare API
  |
  +-- Family state and reservations
  |     Durable Object / SQLite
  |
  +-- Market truth
  |     Pyth Pro / Pyth Lazer
  |
  v
KEYS Solana program
  |
  +-- Mandate
  +-- AssetRule
  +-- exact Allow once
  +-- version / nonce
  +-- refusal paths
  |
  v
Demo SPL-token capital movement
~~~

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the technical map.

## Market and representation truth

AAPL is the current proven Money execution lane.

The Explore layer can expose additional entitlement-checked Pyth markets for Learn and Practice, including equities, crypto, FX, metals, and commodities. Feed availability does not create Money eligibility.

Tessera and PreStocks are representation-learning integrations. They do not automatically create execution eligibility or KEYS authority.

A company, a token representation, holder eligibility, and KEYS authority are separate questions.

## Truth boundary

What is proven now:

- Solana Devnet program;
- program-controlled demo-token execution;
- AAPL live Pyth evidence in the execution path;
- role-scoped child/guardian demo sessions;
- persistent Family state;
- boundary requests and guardian decisions;
- durable reservations and idempotency;
- exact one-time permission;
- confirmed Devnet receipts;
- source-backed Learn and Practice;
- mobile and WebKit coverage.

What is not claimed:

- production KYC or identity verification;
- embedded production wallet custody;
- bank or card funding;
- brokerage;
- real AAPL or tokenized-stock ownership;
- Solana mainnet;
- real minor securities execution;
- universal issuer, venue, or jurisdiction eligibility.

See [docs/TRUTH-BOUNDARY.md](docs/TRUTH-BOUNDARY.md).

## Repository map

| Path | Purpose |
| --- | --- |
| apps/web | Cresco consumer frontend |
| programs/keys | Solana program |
| src | KEYS backend, runtime, market adapters, and Cloudflare state |
| test | Node/API policy and fail-closed tests |
| tests | Anchor/Solana proof tests |
| evidence | Verifiable proof and retained failure records |
| docs | Public architecture, API, product rules, demo, and truth boundary |
| product/PRD.md | Current product requirements |

Exploratory design work, collaborator handoffs, temporary state files, and submission strategy are intentionally not part of the public main tree.

## Local development

Root backend and tests:

~~~bash
npm install
npm test
npm run demo
~~~

Cresco:

~~~bash
cd apps/web
npm install
npm run check
npm run dev
~~~

The web check runs typecheck, lint, human-copy lint, tests, and a production build.

## Build gates

The public repo enforces:

- Node/API tests;
- Solana/Anchor proof workflows;
- web typecheck, lint, tests, and build;
- WebKit mobile checks;
- human-copy lint;
- build-quality evidence validation;
- hosted smoke tests;
- fail-closed market and execution behavior.

Run the build-quality gate directly:

~~~bash
npm run quality:gate
~~~

The gate requires at least one real negative event with all five fields and proof.

## Public docs

- [Product requirements](product/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Build quality rules](docs/BUILD-QUALITY-RULES.md)
- [Demo](docs/DEMO.md)
- [Backend API](docs/BACKEND-API.md)
- [Frontend/backend contract v0.2](docs/FRONTEND-BACKEND-CONTRACT-V0.2.md)
- [Family learning layer](docs/FAMILY-LEARNING-LAYER.md)
- [Cresco design system](docs/CRESCO-FRONTEND-DESIGN-SYSTEM.md)
- [Truth boundary](docs/TRUTH-BOUNDARY.md)
- [Cloudflare deployment](docs/CLOUDFLARE-BACKEND-DEPLOYMENT.md)
- [Evidence](evidence)

## Canonical invariants

- Proposal is not authority.
- Evidence is not maturity.
- Profit is not decision quality.
- Silence is not consent.
- UNKNOWN is not eligible.
- Practice is not custody.
- Learning completion is not authority.
- Market evidence may restrict, expire, or refuse. It never widens human authority.
- Old authorization material cannot survive a new Mandate nonce.
- Allow once binds one exact request and one successful use.
- A token balance is not automatically conventional shareholder title.
- Private family reasoning is not public-chain data.
- The frontend is not the enforcement boundary.
- Real failure stays visible.
