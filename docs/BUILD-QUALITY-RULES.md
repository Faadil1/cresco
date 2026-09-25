# Build Quality Rules

Status: canonical

## Core rule

**Every build must include at least one concrete, real, verifiable negative event rooted in reality. A theoretical risk is not enough.**

The negative event may come from the product path, runtime, integration, deployment, market evidence, concurrency, or another real system boundary.

The failure must stay in the evidence record even after the issue is fixed.

> **Real failure > fake success.**

## Required five-part pattern

Every build record must contain all five elements.

### 1. Positive signal / opportunity

Why is this problem, user need, or opportunity worth building for?

The signal can be user behavior, a successful in-bounds path, market evidence, workflow demand, technical capability, or another concrete reason to continue.

### 2. Concrete negative event

Record a real case where something:

- failed;
- degraded;
- was rejected;
- became stale;
- became unavailable;
- lost value;
- produced a weaker-than-expected result;
- blocked deployment;
- could not be proven.

Do not replace the event with a hypothetical risk statement.

### 3. Observable impact

State what actually happened.

Examples:

- no execution;
- deployment blocked;
- user friction;
- delay;
- manual recovery;
- stale data;
- duplicate-risk containment;
- lost time;
- lost money;
- refusal;
- UNKNOWN result.

### 4. Design lesson

State what the event proves the product or system must do, detect, refuse, or avoid.

The lesson must change or validate a design decision.

### 5. Response / mitigation

State the implemented response.

Examples:

- exact binding;
- fail-closed state;
- idempotency;
- reservation;
- version/nonce invalidation;
- explicit UNKNOWN;
- freshness threshold;
- user-visible refusal;
- retry using the same idempotency key.

## Negative path requirement

Every build must have at least one counter-case where it can:

- REFUSE;
- abstain;
- remain PENDING;
- return UNKNOWN;

when evidence or authority is insufficient.

A build that only demonstrates success is incomplete.

## Evidence retention

Do not delete a failure from the evidence record because a later build passes.

The record should make the evolution legible:

failure -> impact -> lesson -> mitigation -> retest.

## Current KEYS examples

### Exact-action mismatch

Signal:
A guardian can approve one exception without expanding the standing Key.

Negative event:
A guardian approved $12 once. A materially changed $11 action was attempted.

Impact:
The Solana path refused with AllowanceActionMismatch. No unauthorized execution occurred and the allowance was not consumed.

Lesson:
Allow once cannot behave like an upper-bound allowance. It must bind the exact approved action.

Mitigation:
KEYS binds the permission to the request, asset, Mandate nonce, and exact notional. The exact $12 action executes once. Replay refuses with AllowanceAlreadyUsed.

Proof:
https://github.com/Faadil1/keys/actions/runs/36150024852

### Devnet funding block

Signal:
The program build and deployment path was ready for Devnet proof.

Negative event:
The payer had no Devnet SOL and faucet attempts were rate-limited.

Impact:
Deployment could not truthfully be claimed.

Lesson:
A build artifact is not a deployment, and lack of funding must not be converted into a fake success state.

Mitigation:
The workflow retained BLOCKED_FUNDING, then reran using a funded Devnet-only signer and produced a verifiable deployment.

Initial run:
https://github.com/Faadil1/keys/actions/runs/35890663439

## Machine-readable gate

The current record is in:

evidence/BUILD-QUALITY-RECORD.json

The root test command runs:

npm run quality:gate

The validator requires at least one negative event with:

- signal;
- negativeEvent;
- impact;
- lesson;
- mitigation;
- proof URL.

It also requires the repository to declare REFUSE and UNKNOWN negative outcomes.
