# Collaboration Guide

## Source of truth

New collaborator? Start with `docs/COLLABORATOR-ONBOARDING.md`.

Read these before changing product direction:

1. `state/CURRENT.yaml`
2. `state/HANDOVER.yaml`
3. `product/PRD.md`
4. `governance/LIFECYCLE-COVERAGE.yaml`
5. `governance/GATEWAY-REGISTRY.yaml`
6. `governance/EVIDENCE-GRAPH.yaml`
7. `governance/REALITY-LEDGER.md`
8. `governance/PRODUCT-DEPTH-LIVE-REALITY-v1.2.1.md`
9. `docs/BASELINE-DELTA.md`
10. `docs/SEMANTIC-TEARDOWN.md`
11. `docs/REALITY-GATE.md`

## Current phase

Pre-Concept-Lock.

Do not build new product features yet.

Allowed work:
- user research;
- competitor teardown;
- evidence collection;
- prototype/mockup solely when needed to test a hypothesis;
- technical feasibility spikes that do not silently establish product scope;
- PRD updates supported by evidence.

## Decision hygiene

For every material decision, record:
- decision;
- evidence;
- alternatives considered;
- why rejected;
- what would falsify the decision;
- date.

## Git / chronology

The Stocklana repository remains historical baseline:
https://github.com/Faadil1/cresco

This repository contains World’s Fair delta work.

Do not squash/rewrite chronology merely to make the story look cleaner.

## Public/private hygiene

Public submission materials should include:
- product truth;
- runtime evidence;
- relevant architecture;
- verified negative events;
- useful research;
- clear limitations.

Do not expose:
- private collaborator handoffs;
- unnecessary internal strategy;
- speculative claims presented as facts;
- credentials/secrets;
- exploratory material that creates judge confusion without adding evidence.

## Canonical rule

**Real failure > fake success.**


## Registry discipline

Every material change must re-evaluate `governance/GATEWAY-REGISTRY.yaml`.

No gate may disappear because it is inconvenient or not yet applicable.

Use only:
- `ACTIVE`
- `N/A`
- `BLOCKED`
- `PROVEN`

A dependent-but-unproven gate is `BLOCKED`, not implied PASS.
