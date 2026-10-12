# CRESCO World’s Fair — Live Reliability + Observability Repair Pre-Merge

Date: 2026-10-03  
Status: **PROVEN PRE-MERGE / NON-LIVE VALIDATION COMPLETE**  
Public deployment: **NOT CHANGED**  
Fresh Devnet live sequence during this proof: **NOT EXECUTED**

## Triggering negative event

A manual hosted browser run reached Runtime Ready at Mandate nonce 7 and then ended:

`WORLD_FAIR_LIVE_RUN_UNCONFIRMED`

Evidence:
`evidence/runtime/HOSTED-MANUAL-INTERMITTENT-UNKNOWN-2026-10-03.md`

This downgraded stable self-serve reliability to PARTIAL / INTERMITTENT.

## Repair source

- repository: `Faadil1/cresco`
- branch: `fix/worlds-fair-live-reliability-observability-v1`
- exact proven head: `e868b1522c9fa28486777e3805f52a4c5d27093e`
- base main: `f6c71177155ccd3ebeaebb1aff9897aaf1758aac`

## Reliability repair

### Solana confirmation reconciliation

The confirmation layer now:
- tolerates transient RPC polling failures such as HTTP 429 / transport resets;
- checks exact signature history repeatedly after the normal confirmation window;
- performs a final historical reconciliation after blockhash expiry before declaring UNKNOWN;
- never blindly resubmits an uncertain write.

This preserves fail-closed semantics while reducing false UNKNOWN results caused by public-RPC indexing lag or transient throttling.

### Safe retry semantics

Failures are classified into:
- `TRANSIENT_RPC`;
- `UNKNOWN_CONFIRMATION`;
- `DEPENDENCY_FAILURE`;
- `INVARIANT_FAILURE`;
- `SEMANTIC_REFUSAL`;
- `UNKNOWN_RUNTIME`.

Retry policy is explicit:
- read-side transient failure → `SAFE_RETRY_READ`;
- write-side transient/confirmation uncertainty → `REQUIRES_STATE_RECONCILIATION`;
- semantic/invariant failure → `NOT_AUTOMATICALLY_RETRYABLE`.

## Observability repair

The canonical live sequence now tracks explicit phases such as:
- bootstrap / state / Orca context;
- standing swap evidence / quote / execution #1 and #2;
- soft boundary;
- exact exception grant / mutation / execution / replay;
- hard boundary;
- missing evidence;
- rollback grant / refusal / invariant verification;
- stale-authority transition / refusal.

On failure, CRESCO returns a sanitized diagnostic containing:
- phase;
- phase kind: READ / WRITE / ASSERT;
- failure class;
- reason code;
- retry policy;
- public-safe message.

No raw provider stack/error details are required by the public browser.

## Partial fail-closed receipt

If the run stops after some confirmed effects, the provider now preserves:
- completed phases;
- confirmed on-chain effects and their signatures;
- current failed phase;
- sanitized failure diagnostic.

The receipt status remains `UNKNOWN`; it is never promoted to PASS.

## Browser recovery surface

The World’s Fair UI now shows:
- exact failed phase;
- sanitized reason and failure class;
- safe recovery instruction;
- number of verified phases;
- number of confirmed effects;
- Explorer link to the last confirmed effect when available.

A browser timeout on the live POST is explicitly treated as **state reconciliation required**, not a safe blind retry.

## Exact-head non-live verification

### Root regression

Workflow:
- `test`
- run: `37126812481`
- result: **PASS**

Coverage includes:
- transient Solana RPC classification;
- late historical signature reconciliation;
- blockhash expiry safety;
- sanitized HTTP diagnostics envelope;
- partial receipt propagation;
- no raw provider detail leak.

### Reliability pre-merge gate

Workflow:
- `worlds-fair-reliability-premerge`
- run: `37126812495`
- result: **PASS**

Backend/Worker job:
- backend regression: PASS
- Cloudflare backend Worker bundle dry-run: PASS
- no deployment performed

Web job:
- full web check: PASS
- vinext full CRESCO frontend build: PASS
- frontend Worker packaging dry-run: PASS
- no deployment performed

### Historical web gate

Workflow:
- `web`
- run: `37126812491`
- result: **PASS**

Observed:
- typecheck: PASS
- lint: PASS
- copy lint: PASS
- Vitest including World’s Fair structured-failure adapter tests: PASS
- Next.js production build: PASS
- WebKit suite: PASS

## Promotion boundary

The repair is proven **without executing a new Devnet live sequence** and without changing production.

The next protected action is a real Devnet validation of this exact source head.

Because opening a pull request touching the live provider automatically triggers `worlds-fair-operator-lab-live`, PR creation itself will cause real Devnet writes.

Therefore explicit exact-head authorization is required before opening the PR / triggering that live validation.

A successful live validation still does not authorize merge or public Worker redeployment; those remain a separate protected checkpoint.
