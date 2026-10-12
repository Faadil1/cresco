# CRESCO World’s Fair — Parallel Workstream Plan

Date: 2026-10-04
Status: ACTIVE

## Purpose

The runtime/reliability lane is moving quickly in parallel through ChatGPT Work. This plan freezes ownership boundaries so the rest of the submission can continue without colliding with the active runtime repair.

## Runtime lane — reserved to Work / protected execution owner

Current product repository state:
- repository: `Faadil1/cresco`
- active PR: #21
- branch: `fix/worlds-fair-post-swap-orca-refresh-v1`
- exact head: `d64e483c5cc662aca15b7293eca054073e38230c`
- base main: `1266756fb6a00318618daefe9db3d875387411b5`
- root test run `37185513937`: PASS
- Cloudflare Worker CI run `37185513963`: PASS
- single authorized live run `37185513936`: FAIL
- exact failure phase: `ORCA_CONTEXT_AFTER_STANDING_1`
- confirmed effect before failure: `standingAutonomy.1`
- signature: `2SWLbjfDTiaDh2QdfqPTMgCVHTM6BDdJGZM7pixxKxvUA4wfMQ77hVz4Pzc86BfC1n39RedAuitau3pNmYd3XhnX`
- failure artifact: `11296822574`
- artifact digest: `sha256:3f277f72160318c5300174fed17571d86a7b683cb969e9c7dcdbe35682b6e15f`

Runtime lane restrictions:
- no merge without fresh explicit human authorization;
- no redeploy without fresh explicit human authorization;
- no new live validation without fresh explicit human authorization;
- no PR #19/#20 mutation unless separately authorized;
- no mainnet;
- no blind replay of partially executed runs.

## Parallel lanes safe to continue now

These lanes do not require mutation of the active runtime branch and may proceed concurrently:

### 1. Submission narrative / judge story
Prepare the compact product story around:
- problem;
- negative event;
- execution-bound delegated capital authority;
- why Solana-native;
- why CRESCO differs from an approval ledger;
- real positive/negative/recovery evidence;
- truth boundaries.

### 2. Demo structure
Prepare the final demo script and shot order independently from the live runtime repair:
- opening value proposition;
- standing autonomous action;
- soft boundary/refusal;
- exact exception;
- mutation/replay refusal;
- rollback/recovery;
- receipts and Explorer evidence;
- explicit fallback path if a live public RPC read is temporarily unavailable.

No prerecorded/replay evidence may be presented as live.

### 3. Q&A / hostile judge preparation
Prepare concise answers for:
- why not a multisig;
- why not a policy engine;
- why Orca;
- why Pyth;
- what is actually on-chain;
- what happens when RPC/Pyth/Orca fail;
- custody/security/mainnet boundary;
- operator validation/WTP gap;
- why atomic exception execution matters;
- what remains unproven.

### 4. Business plan / impact
Prepare submission-ready material for:
- target operator;
- adoption wedge;
- plausible pricing/business model hypotheses;
- 5-year durability;
- expansion path;
- operational economics assumptions;
- explicit separation of hypotheses from evidence.

### 5. UX / judge self-serve refinement
Continue visual and interaction work only if it does not alter protected runtime semantics:
- clearer state and consequence hierarchy;
- negative-path explanation;
- receipt readability;
- mobile/responsive behavior;
- judge-first time-to-value;
- accessibility/reduced motion.

### 6. Evidence / submission audit
Map every submission claim to:
- commit;
- deployment/runtime;
- live execution;
- receipt/artifact;
- truth state;
- limitation.

Any missing causal edge stays PARTIAL / UNKNOWN.

### 7. External validation
Continue direct operator/user outreach and testing.
Do not upgrade one trial, founder feedback or technical interest into adoption/WTP evidence.

## Coordination rule

Before any merge, deploy, live Devnet write, or runtime mutation, re-read:
- `state/CURRENT.yaml`
- `state/HANDOVER.yaml`
- the active PR head
- all currently running GitHub Actions

Non-runtime lanes should consume the latest proven runtime evidence but must not edit or supersede the active runtime branch.

## Immediate parallel priority

1. Keep runtime repair isolated in Work.
2. Build the submission narrative + Q&A package now.
3. Audit the demo against current evidence.
4. Prepare business/impact material.
5. Reconcile again when PR #21 changes or a new exact head appears.
