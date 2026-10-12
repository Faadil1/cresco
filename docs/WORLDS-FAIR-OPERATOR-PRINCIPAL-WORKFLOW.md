# CRESCO World's Fair: operator / principal workflow (API v0.4)

Status: **live on Solana Devnet** since 2026-10-12, with a 5 of 5 repeatability campaign on the deployed API (receipts: [worlds-fair/CURRENT-STATE-2026-10-12.md](worlds-fair/CURRENT-STATE-2026-10-12.md)). Which guarantees the program enforces and which the CRESCO server enforces: [worlds-fair/WHO-ENFORCES-WHAT.md](worlds-fair/WHO-ENFORCES-WHAT.md).

## What it adds

The judge lab (`/worlds-fair`, API v0.3) proves seven scenarios in one fixed run with server-held actors. This workflow turns that mechanism into a product that real people use with separate roles:

```text
operator intent -> CRESCO program evaluates standing authority
  -> ALLOW: Orca swap executes, receipt recorded
  -> SOFT REFUSE: Policy Diff + durable exception request
       -> principal or risk owner: REFUSE, or APPROVE (exact one-use grant, executed once)
  -> HARD REFUSE: no exception path
principal: pause / resume / revoke / revise policy  (pending requests become stale)
risk owner: asset-rule limits, period consumption, decisions
everyone: durable history with Explorer receipts, notifications, reconciliation
```

| Capability | Where |
|---|---|
| CAP-02 strategy submits its own `SWAP_EXACT_IN` | `POST /workspaces/{id}/intents` |
| CAP-03 refusal + Policy Diff + durable request | 202 `PENDING_PRINCIPAL`, `GET /requests` |
| CAP-04 exact one-use exception from the principal | `POST /requests/{rid}/decision`, wallet-signed when a wallet is bound |
| CAP-07 pause / resume / revoke / revise | `POST /mandate/status`, `POST /mandate/policy` |
| CAP-08 history with receipts | `GET /history` |
| CAP-09 self-serve desk | `/worlds-fair/desk` (needs the Worker deployed, see below) |
| CAP-10 asset rules + period consumption | `POST /asset-rule`, `GET /mandate` |
| CAP-11 notifications | `GET /notifications?since=`, optional https webhook |
| CAP-12 strategy API | `GET /openapi`, `examples/worlds-fair-strategy-client.mjs` |

## Two presentations, one mechanism

A workspace is created as **Family** (parent, teen, second parent: an allowance, a request, a yes once) or **Delegated capital** (allocator, strategy or AI agent, risk owner). Only labels and wording change (`useCase` on the workspace); the CRESCO program, mandate, exception and stale semantics are identical. CRESCO's first build (Stocklana) was the family experience; World's Fair generalized its on-chain mechanism.

## Design decisions

- **One mandate per workspace.** Each workspace derives its own delegate (`deriveWorldFairWorkspaceDelegate`) and therefore its own charter, mandate, asset rule and trade vaults. Pausing, revoking or revising a workspace never touches the judge lab mandate, whose fixed policy the CANONICAL_LIVE run depends on.
- **Authority stays on-chain.** Every ALLOW and refusal comes from the CRESCO program (soft refusals are proven by preflight simulation, which changes no state). The workflow stores product state only.
- **Approve = grant + execute.** The program accepts an exception only at the exact notional granted (rounding gap of a few micro-USD), so the grant and the execution run back to back with the same Pyth message and Orca quote. A venue failure rolls back and consumes nothing.
- **Stale by construction.** Every lifecycle change advances the mandate nonce; pending requests are marked STALE immediately and the program would refuse them anyway.
- **UNKNOWN is never success.** Transport or confirmation failures return 503 `UNKNOWN` with `REQUIRES_STATE_RECONCILIATION`; `POST /reconcile` resolves them from transaction signatures.
- **Roles.** Three bearer tokens are issued once per workspace and stored only as SHA-256 hashes. A principal can bind a wallet; approvals then need an ed25519 signature of the exact approval message (`GET /requests/{rid}/approval-message`).
- **Concurrency.** The Worker serializes writes per workspace with a Durable Object lease (409 `BUSY` + `retry-after`); intents accept an `Idempotency-Key`.
- **Devnet safety envelope.** Policies are bounded (`WORKSPACE_POLICY_BOUNDS`) and the number of workspaces is capped (25) to protect the shared Devnet guardian's funds.
  Optional `WORLD_FAIR_CREATE_TOKEN` Worker secret: when set, `POST /workspaces` needs header `x-cresco-create-token` (use the strategy client or curl to create; the desk then opens from the role links). Vault top-up is rate-limited to once per 10 minutes per workspace.
- **Exact on-chain arithmetic.** The unit price is computed from the raw Pyth mantissa with the program's truncation (`price_to_micro_usd`), so the granted exact notional always matches what `execute_swap_once_with_pyth` recomputes, including at the 5 USDC policy ceiling.
- **Soft can hide hard.** The program checks the per-action notional before the period budgets. Before opening a request, and again before paying for a grant, the workflow replays the remaining checks (rule enabled, action amount, period amount, period notional, with the on-chain period rollover). A request that could only fail after its grant is refused HARD instead.
- **Refusal vs transport.** Only exact Anchor error names (`Error Code: X`) count as program decisions. An RPC `401 Unauthorized`, a timeout or an expired blockhash is UNKNOWN. A confirmation timeout keeps the transaction signature so `/reconcile` can resolve it; an unconfirmed approval is never recorded as refused and can never be approved a second time.
- **Readers never write.** `GET /requests` and `/notifications` compute expiry as a view; only lease-holding writes persist, so a read cannot overwrite an in-flight `EXECUTING` approval. Workspace creation is serialized too (capacity race).
- **Bound wallet is binding.** Once the principal binds a wallet, only a wallet-signed principal approval grants an exception; the risk owner can still refuse. Editing asset-rule limits keeps the on-chain `enabled` flag unless it is set explicitly. Note: the program resets the period counters on every asset-rule update, so an edit refills the period budget; the desk says so and the change is in history.

## Truth boundary

- Solana Devnet only, dev assets, no mainnet, no custody, no customer or WTP claim.
- On-chain guardian and workspace delegates are **server-held Devnet keys**. A bound principal wallet authorizes approvals cryptographically, but the on-chain grant is still signed by the server guardian. Making the principal's own wallet the on-chain guardian is the next step (program unchanged: `grant_allowance_once` already requires the guardian signature).
- Vercel and the local dev API use an in-memory store (not durable). The Cloudflare Worker stores workflow state in the existing `FamilyState` Durable Object.

## Deploy (Faadil, from a PC)

The public frontend calls `https://keys-api-stocklana.faadil-casecraft.workers.dev`. `wrangler.jsonc` names the Worker `cresco-api-stocklana`, so always pass `--name keys-api-stocklana` or the deploy creates a second, unused Worker.

```powershell
git clone https://github.com/Faadil1/cresco; cd cresco
git checkout claude/worlds-fair-operator-principal-workflow-2026-10-12
npm install --no-audit --no-fund
npm test
npx --yes wrangler@4 login
npx --yes wrangler@4 secret list --name keys-api-stocklana
# add any missing: DEVNET_KEYPAIR_JSON, PYTH_PRO_API_KEY, SOLANA_DEVNET_RPC_URL (authenticated RPC)
npx --yes wrangler@4 deploy --dry-run --outdir dist/cloudflare --name keys-api-stocklana
npx --yes wrangler@4 deploy --name keys-api-stocklana
```

Then deploy the frontend the way it is deployed today (Vercel project `cresco-lac` or the vinext Worker), so `/worlds-fair/desk` is public.

## LIVE verification (Devnet writes, run deliberately)

1. Open `/worlds-fair/desk`, create a workspace, **Bootstrap mandate** (several transactions; retry is safe).
2. Operator: submit `0.20` (expect ALLOW + Explorer link), then `0.75` (expect PENDING with Policy Diff).
3. Principal: approve (expect EXECUTED, allowance consumed true, standing authority changed false).
4. Principal: pause, operator submits `0.10` (expect REFUSE `MandateNotActive`), resume.
5. Repeatability and economics:

```powershell
$env:CRESCO_API="https://keys-api-stocklana.faadil-casecraft.workers.dev"
$env:WORKSPACE_ID="ws-..."; $env:OPERATOR_TOKEN="wf_operator_..."; $env:PRINCIPAL_TOKEN="wf_principal_..."
$env:SOLANA_DEVNET_RPC_URL="https://..."   # optional, adds fees
npm run campaign:worlds-fair -- --cycles 5 --threshold 0.8
```

The report (`evidence/runtime/worlds-fair-workflow-campaign-*.json`) gives the pass rate against the predeclared threshold, p50/p95 latency per step and Devnet fees. Only after this passes may the capability map move these capabilities to `reality: LIVE`.

## Clean-room local run (no Devnet secrets)

```bash
npm install && npm test                 # 195 root tests, chain doubled
npm run campaign:worlds-fair -- --self-test
cd apps/web && npm ci && npm test       # 72 web tests
CRESCO_API_PORT=8787 npm run api        # local API (in-memory store; chain calls need secrets)
```
