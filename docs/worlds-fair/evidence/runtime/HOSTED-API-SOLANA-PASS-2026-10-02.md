# CRESCO World’s Fair — Hosted API→Solana PASS

Date: 2026-10-02 local / 2026-10-03 UTC  
Status: **PROVEN LIVE HOSTED API→SOLANA**  
Truth state: **OBSERVED**

## Deployment

- Product repository: `Faadil1/cresco`
- Repair PR: #12
- Authorized repair head: `40abac5acfabe4b682b47a589e177fbe5340a273`
- Merge commit: `5645e199c93d6c158969e17727f8a87c85c95484`
- Cloudflare production check: `Workers Builds: keys-api-stocklana` = **SUCCESS**
- Cloudflare build ID: `6a6199db-e2b2-4ab9-9e63-d03c88a734ec`

Public API:
`https://keys-api-stocklana.faadil-casecraft.workers.dev`

## Hosted proof

Workflow:
- repository: `Faadil1/cresco-worlds-fair`
- workflow run: `37084475468`
- run attempt: `3`
- job: `111097900800`
- result: **SUCCESS**
- artifact: `11259669023`
- artifact digest: `sha256:b8aaf603ab494fa3b7face4135fd4e1d5d568966c4044073f3f4c615142fd499`

Observed:
- `GET /api/v0.3/worlds-fair/runtime` → HTTP 200
- exact Program ID matched:
  `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- exact program SHA-256 matched:
  `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`
- `POST /api/v0.3/worlds-fair/run` → HTTP 200
- `HOSTED_API_TO_SOLANA_CAUSAL_PATH=PASS`

## Receipt

Receipt status: **PASS**  
Product state: `WORLD_FAIR_OPERATOR_LAB_LIVE`  
Starting nonce: `5`  
Observed completion: `2026-10-03T01:33:47.842Z`

Canonical scenarios:
- standingAutonomy: PASS
- softBoundary: PASS
- exactException: PASS
- hardBoundary: PASS
- evidenceFailure: PASS
- rollback: PASS
- staleAuthority: PASS

Representative real signatures:
- input-vault funding:
  `NVJXvKhrdouXVmjZfLsdR2ixc71DEeQpeyEh9DxKhawUdKzq8hZ7hn2ra2weY5s5nQZUNTHZKYgguXYaa2W1ve4`
- standing autonomy:
  `cie3WWaxmyTSpmgULQE5oEdiL2ukk5Nfy3iuSgZvc2LfUH24hdvbEq1w6XLfBkTD4nBfmR4pz4GT8tyEzP964NE`
  `2B35PvpqzH5RRAZ4u2Pw8TzTm5qnMhioUXndve3efPf25Qyoth6PPcBQmHhpXU6fUEaRSzqjhEtKrCGZyUn2cN3w`
- exact exception grant:
  `1gX1KCzfiBdJabLSRsNB72pf1gfVRKQ3db47TXQ6WwdszUoMGXbtX7pNMe1V4DXHYmH1YbJaeoGizwiTaTMNGyt`
- exact exception execution:
  `4NscuzZS1R1Y9ayBaqQ3tVynZpyVC1ijsQdcZju9q7ABkNEi3pLJDeR1Yqhg5UYBsAcRLSHqZb21H8nSPciYbg53`
- policy transition:
  `KTGwzfEZx4iDsDLhPnQzrSFpF7NJtAEkFDfvZzYD6SEgBD6WU5rrzp3VEmtR2T9Y82FLHoAAw9Z8ezeqArDyw1B`

## What this proves

The public hosted CRESCO Worker can execute the real World’s Fair canonical CRESCO→Orca authority sequence on Solana Devnet and return a bound PASS receipt through the v0.3 HTTP API.

The prior hosted blockhash-expiry defect is repaired in production for this observed run.

## Remaining boundary

This does **not** prove judge self-serve yet.

Still missing:
- public `/worlds-fair` browser surface at the expected Vercel URL;
- browser UI→public API→Solana execution observed from the hosted page;
- clean-room judge execution.

The expected Vercel route previously returned HTTP 404 for 24 consecutive checks. That frontend deployment edge remains separate from the now-proven hosted API→Solana path.

No mainnet, production custody, audited-security, demand, WTP or adoption claim follows from this proof.
