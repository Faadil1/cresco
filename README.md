# CRESCO

**Act alone inside the rules. Ask once for the exception.**

CRESCO is one Solana program for money that is not fully yours: a teenager's allowance, or capital handed to a strategy or an AI agent. The principal sets a standing limit (the **Key**, a versioned Mandate). Inside it, the teen, strategy or agent acts alone, with no approval queue. At the limit, the program refuses and creates one exact request. The principal approves that single action once, and the limit never moves.

> **The exception moved. The boundary did not.**

Built for the Colosseum Crypto World's Fair (October 2026). Solana Devnet, demo tokens only.

**Watch:** [Pitch, 2:47](https://youtu.be/uBMRdPh6ggw) · [Live demo, 2:21](https://youtu.be/QeIzBfRx-bA)

## Try it in two minutes

| Step | What to do | What you should see |
| --- | --- | --- |
| 1 | Open the [live desk](https://cresco.faadil-casecraft.workers.dev/worlds-fair/desk), pick **Family** or **Delegated capital** | A live mandate with its limit |
| 2 | Act inside the limit | ALLOW, executed on Devnet, no approval asked |
| 3 | Act above the limit | REFUSE, with the program's reason code, and one exact request created |
| 4 | Approve that request once as the principal | The single action executes; the standing limit is unchanged |
| 5 | Replay or change the approved action | REFUSE (`AllowanceAlreadyUsed`, `AllowanceActionMismatch`) |

Product entry: https://cresco.faadil-casecraft.workers.dev. Principal-wallet mode lets the parent's or allocator's own Phantom wallet sign the mandate, every exact exception, pause and resume.

## What is real, with receipts

| Claim | Evidence |
| --- | --- |
| Exact exception executed on Devnet by the program | [Explorer transaction `5QH3cn...otFE3`](https://explorer.solana.com/tx/5QH3cn1ReQTaK4bvSc2wiwmXhzi8jFKJkKzoLWNndJTbgNS1cSDTKMf8sU8B7FXazu5nHhc1ubAP7ZpYBe9otFE3?cluster=devnet): instruction `ExecuteSwapOnceWithPyth`, log `CRESCO_ORCA_EXCEPTION_SWAP` with `input_amount=750000`, `min_output=742497`, `nonce=3`, `consumed=true` |
| Repeatable on the deployed API | 5 of 5 full cycles, median 2.7 s inside the mandate ([CURRENT-STATE](docs/worlds-fair/CURRENT-STATE-2026-10-12.md)) |
| Parent wallet as on-chain guardian | Phantom on Devnet: mandate, two exact approvals, pause, resume ([record](docs/worlds-fair/PRINCIPAL-WALLET-GUARDIAN.md#live-test-record-owner-phantom-solana-devnet-2026-10-12)) |
| Pause stops the agent | Live refusal with `MandateNotActive` after pause |
| Program vs server responsibilities | [WHO-ENFORCES-WHAT](docs/worlds-fair/WHO-ENFORCES-WHAT.md) |
| Reality ledger (what is live, what is not) | [REALITY-LEDGER](docs/worlds-fair/governance/REALITY-LEDGER.md) |

**Programs on Solana Devnet**

- World's Fair desk (live product): [`7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`](https://explorer.solana.com/address/7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z?cluster=devnet)
- September Family build (still behind the Family proof lane): [`ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk`](https://explorer.solana.com/address/ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk?cluster=devnet)

**Not claimed:** mainnet, custody, brokerage, real securities, customers, revenue. Revoke in wallet mode is not shown live yet.

> "What I find exciting about CRESCO is the ability to approve one exact exception without widening the agent's standing mandate. Through my work on Sanction, I recognize how much that boundary matters, and I'm excited about CRESCO's opportunity to carry that control all the way through to execution."
> Eric Lovold, founder of Sanction (expert testimony, quoted with permission)

## One program, two settings

- **Family:** a guardian sets a standing Key. The teenager acts freely inside it and asks for more room only at the boundary.
- **Delegated capital:** an allocator sets a mandate for a strategy or AI agent. Agents reach CRESCO through MCP and have no tool to approve or widen their own limit ([`integrations/mcp`](integrations/mcp/README.md)).
- Strategy API: `GET /api/v0.4/worlds-fair/openapi`, example client `examples/worlds-fair-strategy-client.mjs`.
- Design, truth boundary, deploy and verification: [`docs/WORLDS-FAIR-OPERATOR-PRINCIPAL-WORKFLOW.md`](docs/WORLDS-FAIR-OPERATOR-PRINCIPAL-WORKFLOW.md). Everything about the World's Fair work: [docs/worlds-fair/](docs/worlds-fair/README.md).

## Links

- Product: https://cresco.faadil-casecraft.workers.dev
- API: https://keys-api-stocklana.faadil-casecraft.workers.dev (the hostname is a legacy Cloudflare identifier kept so the deployed runtime stays reachable)
- Earlier September Family build and videos: https://cresco-lac.vercel.app · [demo](https://www.youtube.com/watch?v=e8qMwzTrU4M) · [technical](https://youtu.be/hMjQcjsd-Ws)
- CI proofs: [exact-action proof](https://github.com/Faadil1/cresco/actions/runs/36150024852) · [Node/API](https://github.com/Faadil1/cresco/actions/runs/36178796069) · [web](https://github.com/Faadil1/cresco/actions/runs/36178751111) · [WebKit mobile](https://github.com/Faadil1/cresco/actions/runs/36178751051) · [hosted smoke](https://github.com/Faadil1/cresco/actions/runs/36178796222)

The capital path moves a **demo SPL token**, not real securities. AAPL is the proven Money lane with live Pyth market evidence.

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
