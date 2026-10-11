# CRESCO World Fair — Reality Audit

Date: 2026-10-11  
Implementation repository: `Faadil1/cresco`  
Audited main: `4c7b82ff22ae7d4fb2756e68c640548bf1f7965d`  
Governance repository: `Faadil1/cresco-worlds-fair`  
Governance main observed: `ffcc8ea64604990a4014cfb1c8a7a01809fdbe67`  
Central canon: `0.1.59-adaptive-best-of-system-execution-v1-promoted` @ `cdb55dbfe41fdfcb2f5e9232517fbb058c8b4c9b`

## Audit rule

Vertical Slice ≠ Definition of Done.

Historical evidence remains valid at its observed class. This audit does not upgrade the current public runtime, adoption, WTP, reliability, or submission readiness without new evidence.

## Reality matrix

| Capability | State | Evidence class | Audit result |
| --- | --- | --- | --- |
| Solana authority program on Devnet | OBSERVED | LIVE | Proven historically and bound to expected program SHA in prior receipts. |
| Orca Whirlpools execution | OBSERVED | LIVE | Load-bearing in the World Fair 7/7 path. |
| Pyth Lazer evidence | OBSERVED | LIVE | Load-bearing where claimed; may restrict/refuse and never grants authority. |
| Standing autonomous swaps | OBSERVED | LIVE | Two standing swaps passed in authorized run 37214175230. |
| Soft-boundary refusal / Policy Diff | OBSERVED | LIVE | Per-action notional boundary passed in the 7/7 receipt. |
| Exact one-use exception | OBSERVED | LIVE | Grant, mutation refusal, execution, consumption and replay refusal passed. |
| Hard boundary | OBSERVED | LIVE | Unsupported program refusal passed. |
| Evidence failure | OBSERVED | LIVE | Missing/invalid Pyth evidence refusal passed. |
| Rollback | OBSERVED | LIVE | Failed Orca execution left allowance/counters unchanged. |
| Stale authority | OBSERVED | LIVE | Nonce transition invalidated old authority. |
| Public World Fair surface | OBSERVED historically | LIVE | Browser-triggered self-serve 7/7 was proven on the historical hosted build. |
| Latest main bound to current public Worker | UNKNOWN | UNKNOWN | PR #29 repair is merged, but public promotion was blocked before deployment by missing Cloudflare GitHub secrets. |
| Current-main post-deploy repeatability | UNKNOWN | NOT_IMPLEMENTED | No post-deploy reliability campaign exists for the merged repair. |
| Fixed CANONICAL_LIVE regression/judge sequence | OBSERVED | LIVE + LOCAL | Real live path exists; local/API tests cover contract behavior. |
| Real operator submits a specific trade/action | NOT_IMPLEMENTED | NOT_IMPLEMENTED | API exposes runtime + one fixed canonical run, not a user-created operator action flow. |
| Operator receives Policy Diff and creates exception request | NOT_IMPLEMENTED | NOT_IMPLEMENTED | Demonstrated inside scripted canonical sequence, not productized as a discrete user workflow. |
| Principal/risk owner reviews and approves/refuses request | NOT_IMPLEMENTED | NOT_IMPLEMENTED | No World Fair role/auth/approval surface exists. |
| Persistent request / approval / execution history | NOT_IMPLEMENTED | NOT_IMPLEMENTED | Receipts exist as run outputs; durable operator history is not a product surface. |
| Real World Fair role authentication/permissions | NOT_IMPLEMENTED | NOT_IMPLEMENTED | Public lab uses server-held Devnet actors; concurrency lock is not user identity/authorization. |
| External target-operator value/WTP | UNKNOWN | UNKNOWN | Sanction interview is expert/competitor evidence, not target-customer validation; additional outreach is pending. |
| Time to first value | UNKNOWN | UNKNOWN | No current representative-operator TTFV measurement. |
| Operational economics | UNKNOWN | UNKNOWN | No maintained per-run latency/fee/retry-cost/failure-rate product metric. |

## P0 blockers

### P0-1 — Canonical baseline drift

Implementation state was pinned to central 0.1.56 and governance state to older central 0.1.48 while current central canon is 0.1.59.

Impact: terminal/readiness statements can be made against stale obligations.

Response in this changeset:
- re-pin implementation state to 0.1.59 / `cdb55dbfe41fdfcb2f5e9232517fbb058c8b4c9b`;
- preserve Product Reality v1.5;
- classify Eval-Driven Reliability as N/A for the deterministic non-agent core unless stochastic/model behavior becomes load-bearing;
- activate bounded Adaptive Best-of-System execution governance for future material work.

### P0-2 — Protected live/write workflows had automatic triggers

Observed automatic external-write paths:
- `worlds-fair-operator-lab-live.yml` on pull requests;
- `devnet-execution-bridge.yml` on main pushes;
- `solana-devnet-authority-proof.yml` on main pushes;
- `cloudflare-hosted-execution-smoke.yml` on workflow-file pushes;
- `devnet-funding-topup.yml` on workflow-file pushes.

Impact: code review or merge could cause Devnet/public state mutation without a fresh protected-action decision.

Response in this changeset:
- make all five workflows `workflow_dispatch` only;
- add a regression test that fails if push/pull_request triggers return.

### P0-3 — World Fair living PRD pointer conflicted with implementation reality

`Faadil1/cresco/state/CURRENT.yaml` pointed to the historical family/guardian `product/PRD.md` as the living PRD even though World Fair has a separately locked delegated-capital product PRD.

Response:
- keep the family PRD as historical/baseline product truth;
- point World Fair authority explicitly to `Faadil1/cresco-worlds-fair@ffcc8ea64604990a4014cfb1c8a7a01809fdbe67:product/PRD.md`.

### P0-4 — Latest public runtime binding is not proven

Observed:
- exact PR #29 head: 7/7 LIVE PASS;
- repair merged to main;
- post-merge CI passed;
- authorized public deployment attempt stopped before deployment because Cloudflare GitHub credentials were unavailable.

Truth:
- current public Worker containing the merged repair: UNKNOWN;
- current-main public 7/7: UNKNOWN;
- repeatability: UNKNOWN.

### P0-5 — Judge lab is not yet the real multi-role product workflow

The public UI is valuable and genuinely live, but its primary action is one button that executes a fixed canonical seven-scenario sequence.

Missing product path:
`operator action -> standing evaluation -> Policy Diff -> exception request -> principal/risk decision -> exact one-use execution/refusal -> durable receipt/history -> recovery`.

This is a product-depth blocker, not a demo-quality issue.

## P1 depth gaps

- World Fair-specific role/auth model for operator vs principal/risk owner.
- Durable exception-request lifecycle and history.
- Recovery UX for BUSY, SAFE_RETRY_READ, UNKNOWN confirmation, stale request, and failed external dependency.
- Predeclared post-deploy repeatability threshold; one green run is not reliability.
- Clean-room setup/reproducibility for a representative external evaluator.
- Current World Fair e2e/browser regression coverage for success + negative + recovery, not only service/API unit coverage.
- Time-to-first-value measurement.
- Per-run operational economics: latency, transaction fees, retries, external provider failure rate.
- External target-operator validation and CRESCO-specific pull/WTP.

## P2 / conditional expansion

Do not add these merely for feature count:
- multi-venue routing;
- generalized arbitrary CPI;
- mainnet;
- leverage/borrow/lend;
- generalized agent wallet;
- broad portfolio management.

They activate only if operator evidence or coherent product depth makes them causal.

## Next product build

After this P0 safety/reconciliation PR passes non-live CI, the next primary workstream is:

**REAL_OPERATOR_PRINCIPAL_WORKFLOW_V1**

Acceptance criteria:
1. operator can submit one constrained `SWAP_EXACT_IN` intent against the same shared core;
2. standing in-bounds intent can execute without principal approval;
3. soft-boundary intent returns a machine-readable Policy Diff and creates a durable exception request without authority;
4. principal/risk owner can explicitly REFUSE or grant one exact exception;
5. grant is bound to the current mandate lineage and exact action;
6. mutated action refuses;
7. exact action executes once;
8. replay refuses;
9. standing mandate remains unchanged by the exception;
10. stale mandate invalidates the pending exception;
11. BUSY/UNKNOWN/read-retry conditions have explicit non-fake-success recovery;
12. receipts/history expose causal state and Explorer links;
13. fixed CANONICAL_LIVE remains a regression/judge view, not a parallel policy engine.

No live Devnet validation or public deployment is authorized by this audit document.
