# CRESCO World’s Fair — Operator Lab Shared-Core Live Receipt

Date: 2026-10-02 / 2026-10-03 UTC  
Status: **PROVEN — LIVE SHARED PRODUCT CORE**  
Evidence class: **LIVE / Solana Devnet**  
Product state: **WORLD_FAIR_OPERATOR_LAB_LIVE**

## What this receipt proves

The judge/operator product core now invokes the same bounded CRESCO→Orca mechanism through a reusable server-side provider rather than relying on the original CI proof harness as the product path.

### Runtime

- Network: Solana Devnet
- CRESCO program: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- Program binary SHA-256: `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`
- Guardian / principal: `FuKsZH234Zcy11rXPHWwiPwyuhLjth7brBVsd5BD5Nzk`
- Stable server-derived delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`
- Stable Mandate: `CPdat8L1kNUZXAHd6smzeK14nRXD9p1kXU4pF6SSMBXG`
- Orca Whirlpools program: `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc`
- Orca devUSDC/devUSDT pool: `63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg`
- Pyth: `Crypto.USDC/USD`, feed `7`, authority effect `NONE`

## Canonical provider proof

- Repository: `Faadil1/cresco`
- Branch: `feature/worlds-fair-orca-v1`
- Head: `cedfbb400f00f28fbe4268fde46ab68933d42e3c`
- Workflow: `worlds-fair-operator-lab-live`
- Run: `37083019145`
- Job: `111087447682`
- Result: **SUCCESS**
- Receipt validator: `WORLD_FAIR_OPERATOR_LAB_RECEIPT_VALID=PASS`
- Artifact: `worlds-fair-operator-lab-runtime-receipt`
- Artifact ID: `11258404544`
- Artifact digest: `sha256:81f00eb244dd6afee201ecaf55c3972f734cf0843d3ce183ed91517b8f6815bf`

## Live scenarios

| Scenario | Result | Live consequence |
|---|---|---|
| Standing autonomy | PASS | Two real Orca swaps execute under standing authority |
| Soft boundary / Policy Diff | PASS / REFUSE | `MAX_ACTION_NOTIONAL` is the only violated dimension |
| Exact one-use exception | PASS | Exact action executes once; standing Mandate version remains unchanged |
| Semantic mutation | PASS / REFUSE | `AllowanceActionMismatch` |
| Replay | PASS / REFUSE | `AllowanceAlreadyUsed` |
| Hard unsupported program | PASS / REFUSE | `InvalidOrcaProgram`; no exception path |
| Missing Pyth evidence | PASS / REFUSE | `PythMessageInvalid` |
| Orca failure / rollback | PASS / REFUSE | `AmountOutBelowMinimum`; allowance remains unused; counters unchanged |
| Stale authority | PASS / REFUSE | Mandate nonce transition 3→4 makes prior exception stale |

## Selected transaction evidence

- Standing execution 1: `4Grfz53REzkEvsPiJP2aWSD3nYbCovGgoeCrpi9FGwgwfEUbhrtLCmr7GsoGKpmpDhUjahCSgHqu5iHkXrTSnjgm`
- Standing execution 2: `2XUGwsQYg4YjSwazvDRFqp4xWzS9sUD4Gy234CRRNyWQbqWSCBwbiJ6jBwvw6GhiNC2C8VgrVMK1rUFUHRRnqEyz`
- Exact exception grant: `2DvHqK2oQ6PqFirt6vWAPFPrwhm4JECkb4YdJqbEXBrSL2D9DsneXu9on4GpRj8oq6RZhZxt5h2mXLKdnJU2eLJ9`
- Exact exception execution: `414SRyiVuYEvVWnrkKbJhMPb9pss9Qtu7TEnPoWLRK1TbxujwfWjLSrLCwzmRux3prdqDpPZxZk92T9SoZz9opmV`
- Policy evolution / stale-authority transition: `3AJ7WrG1um1yMSLy2kyaKudiFFRWpwKVd5o96QqKHdKezKnvm5wH9P8uUjSuj3o2tgjjAM15qdwCPEyEE9uDn9Pf`

## Shared-core / hosting readiness evidence

At the same source head:

- root Node regression: PASS;
- World’s Fair HTTP contract tests: PASS;
- durable live-run lease semantics: PASS;
- public Worker overlap behavior: second concurrent run returns `409 BUSY`;
- Cloudflare Worker dry-run bundle: PASS;
- World’s Fair runtime remains hard-bound to one Program ID, one Orca program, one pool and one token pair;
- browser never receives the guardian keypair or Pyth API key.

Cloudflare CI run:
- run `37083019089`
- job `111087438413`
- backend tests PASS;
- Wrangler bundle PASS;
- `CLOUDFLARE_WORKER_DRY_RUN=PASS`.

## Truth boundary

This proves the **shared server-side live product core** and deployment bundle.

It does not yet prove:
- the public hosted Worker has been updated to this source head;
- the public Vercel `/worlds-fair` route is deployed;
- a clean-room judge has completed the flow through the hosted UI;
- mainnet readiness, production custody, audited security, operator demand, WTP or adoption.

Those remain separate gates.
