# CRESCO — Crypto World's Fair

CRESCO World’s Fair is the post-Stocklana product-discovery and build repository for the 2026 Crypto World’s Fair.

> **Core working hypothesis:** CRESCO governs delegated authority when an autonomous action reaches a standing boundary.

This repository is intentionally **pre-Concept-Lock**. It must not silently collapse into “family finance,” “AI agent wallet,” “treasury,” or “trading” until evidence clears the Reality Gate.

## Current status

**Lifecycle:** ACTIVE  
**Product state:** PRE-CONCEPT-LOCK  
**Current gate:** PRE-BUILD REALITY GATE — direct operator evidence

**No product build is authorized yet.**

The current candidate lanes are:
- Treasury / crypto operations
- Agent builders / agentic commerce
- Delegated trading / capital mandates
- Family progressive agency (kept as an active research lane and UX laboratory)
- Organizational spend/procurement (commercial analogue; native-advantage question unresolved)

## Canonical core

CRESCO separates four states:

1. **Standing Authority** — what the delegate may normally do.
2. **Exceptional Authority** — what may be permitted outside the standing boundary.
3. **Authority Evidence** — information that may inform future policy.
4. **Policy Evolution** — an explicit authorized change to standing authority.

Core invariants:
- An exception never implicitly widens standing authority.
- Evidence may inform authority; evidence never becomes authority by itself.
- Boundary failures fail closed.
- Material action mutation invalidates a bound authorization.
- Consumed one-time authorization cannot be replayed.
- Policy evolution is a separate, explicit, versioned transition.
- The UI is not the enforcement boundary.

## Why this repository exists

The original CRESCO/Stocklana repository remains the baseline proof of the primitive:

- Original repository: https://github.com/Faadil1/cresco
- Original live demo: https://cresco-lac.vercel.app/
- Baseline: family narrative + Solana Devnet capital-path enforcement + Pyth + exact one-time exception + mutation/replay refusal.

This repository contains the **World’s Fair delta only**: market discovery, concept selection, product requirements, architecture decisions, implementation, evidence and submission work created after the Stocklana baseline.

## Collaboration rule

The canonical coordination document is:

**[product/PRD.md](product/PRD.md)**

All meaningful product or architecture changes must remain consistent with the PRD or explicitly amend it. Do not let implementation convenience, deadline pressure, or collaborator latency silently change the problem, wedge, truth boundary, or core invariants.

## Promotion sequence

```
Winning Intelligence
→ Six-LLM Review
→ Divergent Ideation
→ Semantic Teardown
→ User / Market Evidence
→ PRE-BUILD REALITY GATE
→ Concept Lock
→ PRD v1 LOCKED
→ Technical Reality Check
→ Backend Engineering Intelligence
→ Demo-First Architecture
→ Build
→ Runtime / Evidence
→ Promotion
→ Submission
```

## Current rule

**REAL FAILURE > FAKE SUCCESS.**

No mainnet, custody, brokerage, tokenized-equity ownership, user traction, customer demand, security guarantee, or competitor gap may be claimed unless directly proven.

See:
- [product/PRD.md](product/PRD.md)
- [state/CURRENT.yaml](state/CURRENT.yaml)
- [state/HANDOVER.yaml](state/HANDOVER.yaml)
- [governance/LIFECYCLE-COVERAGE.yaml](governance/LIFECYCLE-COVERAGE.yaml)
- [governance/EVIDENCE-GRAPH.yaml](governance/EVIDENCE-GRAPH.yaml)
- [docs/BASELINE-DELTA.md](docs/BASELINE-DELTA.md)
- [docs/SEMANTIC-TEARDOWN.md](docs/SEMANTIC-TEARDOWN.md)
- [docs/REALITY-GATE.md](docs/REALITY-GATE.md)


## Conditional Gateway Registry

Every CRESCO World’s Fair stage is governed by the canonical Conditional Gateway Registry:

- `governance/GATEWAY-REGISTRY.yaml`
- `governance/PRODUCT-DEPTH-LIVE-REALITY-v1.2.1.md`
- `governance/REALITY-LEDGER.md`

Every registered gate must always be explicitly marked:

`ACTIVE` / `N/A` / `BLOCKED` / `PROVEN`

`N/A` means not currently applicable — never forgotten.

The registry must be re-evaluated whenever scope, architecture, runtime, sponsor dependency, evidence state or submission state changes.
