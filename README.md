# CRESCO

**Financial independence should not happen all at once.**

CRESCO gives young people real room to make financial decisions inside family-set boundaries. A guardian defines a standing **Key**, represented technically by a versioned Mandate. Inside that Key, the young person can act without asking for permission every time. At the boundary, CRESCO refuses, explains why, and lets the family decide what should happen next.

> **Learn in context. Act freely inside bounds. Ask for more freedom only at the boundary.**

## Live product and proof

- Product: https://cresco-lac.vercel.app
- Current CRESCO API: https://keys-api-stocklana.faadil-casecraft.workers.dev
- Repository: https://github.com/Faadil1/cresco
- Network: Solana Devnet
- Program: `ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk`
- Canonical exact-action proof: https://github.com/Faadil1/cresco/actions/runs/36150024852
- Current Node/API quality proof: https://github.com/Faadil1/cresco/actions/runs/36178796069
- Current web CI: https://github.com/Faadil1/cresco/actions/runs/36178751111
- Current WebKit mobile CI: https://github.com/Faadil1/cresco/actions/runs/36178751051
- Hosted market-discovery smoke: https://github.com/Faadil1/cresco/actions/runs/36178796222

The current API URL keeps its original Cloudflare worker hostname so the already-deployed runtime stays reachable. It serves CRESCO and is treated only as a legacy infrastructure identifier.

The current capital path moves a **demo SPL token**, not real securities. AAPL is the current proven Money lane with live Pyth market evidence. CRESCO does not claim brokerage, custody, mainnet execution, or real minor securities execution.

## The product model

The Key is standing authority, not a per-action approval queue.

| Situation | CRESCO behavior |
| --- | --- |
| Action is inside the active Key | ALLOW. No guardian approval is required. |
| Action reaches a standing boundary | REFUSE. Adjust, Practice, or Ask for more room. |
| Guardian chooses Not this time | Standing Key stays unchanged. |
| Guardian chooses Allow once | One exact request can cross once. Standing Key stays unchanged. |
| Guardian chooses Widen the Key | A new standing Key version is created. |
| Market evidence is stale or insufficient | REFUSE or UNKNOWN. Never fabricate success. |
| Execution cannot be confirmed | PENDING or UNKNOWN. Never render confirmed success. |

Learning, XP, P&L, badges, and AI scores never grant or widen authority.

Pyth can restrict or stop an action. Pyth can never grant more human authority.

## Canonical demo

The canonical CRESCO flow is intentionally small:

1. **$5 AAPL** inside the Key: ALLOW.
2. **$12 AAPL** outside the current $10 action limit: REFUSE.
3. Ask for more room.
4. Guardian chooses **Allow once** for exactly $12.
5. Change the action to **$11**: REFUSE with `AllowanceActionMismatch`.
6. Restore the approved **$12**: ALLOW.
7. One-time permission becomes USED.
8. Standing Key remains **v7 to v7**.
9. Replay the same $12 permission: REFUSE with `AllowanceAlreadyUsed`.

The product point:

> **The exception moved. The boundary did not.**

The technical point:

> **The UI is not the guard. The capital path is.**

## Why Solana

A conventional backend can reproduce much of the interface. CRESCO uses Solana because the authority boundary is enforced in the same execution path that moves the demo capital.

The current program proves:

- program-controlled demo-token capital;
- in-bounds execution without guardian approval;
- out-of-bounds refusal;
- versioned Mandate and nonce lineage;
- stale authorization refusal;
- explicit guardian widening;
- pause and downward authority;
- exact single-use Allow once;
- changed-action refusal;
- replay refusal;
- signed Pyth verification in the capital path;
- Pyth-derived USD/notional enforcement;
- precommitted market-condition refusal.

## Real failure over fake success

**Real failure > fake success.**

Every build must retain at least one concrete, observable, verifiable negative event rooted in reality. A theoretical risk is not enough.

Each build record must contain five elements:

1. **Positive signal / opportunity**: why the problem or opportunity deserves a build.
2. **Concrete negative event**: what actually failed, degraded, was rejected, lost value, or underperformed.
3. **Observable impact**: blocked execution, delay, error, friction, manual work, money, churn, or another visible consequence.
4. **Design lesson**: what the failure proves the product must do or avoid.
5. **Response / mitigation**: how the build detects, reduces, contains, or refuses that situation.

Current failures are preserved in [evidence/BUILD-QUALITY-RECORD.json](evidence/BUILD-QUALITY-RECORD.json) and [evidence/runtime/REAL-FAILURE-RECORD.md](evidence/runtime/REAL-FAILURE-RECORD.md).

Examples already retained:

- Devnet deployment was blocked by an unfunded payer and faucet rate limiting. The workflow stayed `BLOCKED_FUNDING` instead of claiming deployment.
- A guardian-approved $12 one-time request was changed to $11. The Solana path refused with `AllowanceActionMismatch`.
- A deterministic v0.2 demo used the wrong engine input shape. CI returned `INVALID_AMOUNT`, failed the workflow, and the failure stayed in the record until the script was corrected.

Failures remain evidence even after a later build passes.

## Fail-closed contract

CRESCO treats refusal and uncertainty as first-class outcomes.

- **REFUSE**: authority or evidence says the action must not execute.
- **PENDING**: execution was submitted but is not confirmed.
- **UNKNOWN**: the system cannot prove the final result.
- **ALLOW**: shown only when the required authority and proof are sufficient.

The repository tests stale authorization, unavailable market evidence, unknown eligibility, unavailable runtime, out-of-bounds notional, changed one-time actions, replay, timeouts, malformed responses, and other negative paths.

A build that only demonstrates success is incomplete.

## Architecture

```text
CRESCO web
  |
  v
CRESCO API
  |
  +-- Family state and durable reservations
  |     Cloudflare Durable Object / SQLite
  |
  +-- Market truth
  |     Pyth Pro / Pyth Lazer
  |
  v
CRESCO Solana program
  |
  +-- Mandate
  +-- AssetRule
  +-- exact Allow once
  +-- version / nonce
  +-- refusal paths
  |
  v
Demo SPL-token capital movement
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Market and representation truth

AAPL is the current proven Money execution lane.

Explore can expose additional entitlement-checked Pyth markets for Learn and Practice across equities, crypto, FX, metals, and commodities. Feed availability does not create Money eligibility.

Tessera and PreStocks are representation-learning integrations. They do not automatically create execution eligibility or CRESCO authority.

CRESCO separates four questions:

1. What company or asset is this?
2. What does this token or representation actually represent?
3. Is this user eligible to use it?
4. Does the current Key authorize this action?

A positive answer to one question does not imply the others.

## Truth boundary

Proven now:

- Solana Devnet program;
- program-controlled demo-token execution;
- AAPL live Pyth evidence in the execution path;
- role-scoped child and guardian demo sessions;
- persistent Family state;
- boundary requests and guardian decisions;
- durable reservations and idempotency;
- exact one-time permission;
- confirmed Devnet receipts;
- source-backed Learn and Practice;
- mobile and WebKit coverage.

Not claimed:

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
| `apps/web` | CRESCO consumer frontend |
| `programs/keys` | Deployed Solana program source. The folder/crate name is a legacy technical identifier retained for proof reproducibility. |
| `src` | CRESCO backend, runtime, market adapters, and Cloudflare state |
| `test` | Node/API policy and fail-closed tests |
| `tests` | Anchor/Solana proof tests |
| `evidence` | Verifiable proof and retained failure records |
| `docs` | Public architecture, API, product rules, demo, and truth boundary |
| `product/PRD.md` | Current CRESCO product requirements |

Exploratory design work, collaborator handoffs, temporary state files, and submission strategy are intentionally absent from the public main tree.

## Local development

Backend and policy tests:

```bash
npm install
npm test
npm run demo
```

CRESCO web:

```bash
cd apps/web
npm install
npm run check
npm run dev
```

The web check runs typecheck, lint, human-copy lint, tests, and a production build.

## Build gates

The public repository enforces:

- Node/API tests;
- Solana/Anchor proof workflows;
- web typecheck, lint, tests, and build;
- WebKit mobile checks;
- human-copy lint;
- build-quality evidence validation;
- hosted smoke tests;
- fail-closed market and execution behavior.

Run the build-quality gate directly:

```bash
npm run quality:gate
```

The gate requires a real negative event with all five canonical fields and verifiable proof.

## Public documentation

- [Product requirements](product/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Build quality rules](docs/BUILD-QUALITY-RULES.md)
- [Demo](docs/DEMO.md)
- [Backend API](docs/BACKEND-API.md)
- [Frontend/backend contract v0.2](docs/FRONTEND-BACKEND-CONTRACT-V0.2.md)
- [Family learning layer](docs/FAMILY-LEARNING-LAYER.md)
- [CRESCO design system](docs/CRESCO-FRONTEND-DESIGN-SYSTEM.md)
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
