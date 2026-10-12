# CRESCO World’s Fair — Hosted Confirmation/RPC Reliability Repair Pre-Merge Proof

Date: 2026-10-02 local / 2026-10-03 UTC  
Status: **PROVEN PRE-MERGE — PUBLIC REDEPLOY NOT YET AUTHORIZED**  
Repair PR: `Faadil1/cresco#12`

## Repair source

- Branch: `fix/worlds-fair-hosted-confirmation-v1`
- Proven head: `40abac5acfabe4b682b47a589e177fbe5340a273`
- Base main: `fa26ff06028b57042c850bef4b9467b39e786ea6`

## What was repaired

The first public hosted World’s Fair POST failed closed because the Orca replenishment transaction used SDK `confirmTransaction` and its blockhash validity window expired.

The repair:
- introduces CRESCO-owned Solana signature polling and explicit blockhash-expiry handling;
- avoids blind duplicate funding after uncertain confirmation by re-checking token-balance postconditions;
- replaces the replenishment vault transfer with the same CRESCO send/confirm path;
- forces fresh Orca account/quote reads when retrying;
- retries only recognized transient RPC read failures;
- batches five CRESCO state account reads into one `getMultipleAccountsInfo` request.

Semantic/pool/mint mismatches still fail immediately and are not treated as transient.

## Exact-head verification

### Node/API regression

- workflow: `test`
- source head: `40abac5acfabe4b682b47a589e177fbe5340a273`
- result: **PASS**

### Cloudflare Worker bundle

- workflow: `cloudflare-worker-ci`
- run: `37085360049`
- result: **PASS**
- backend tests: PASS
- Wrangler dry-run bundle: PASS

### Shared World’s Fair live provider

- workflow: `worlds-fair-operator-lab-live`
- run: `37085360077`
- job: `111094409043`
- result: **SUCCESS**
- program: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`
- nonce before: `4`
- nonce after: `5`
- validator: `WORLD_FAIR_OPERATOR_LAB_RECEIPT_VALID=PASS`
- artifact: `11260647857`
- artifact digest: `sha256:5f5400848c9ca37edbe433d08de6031e225f358a1ba725d87b330d48d19d01dd`

The live run encountered numerous real `429 Too Many Requests` responses from the public Solana Devnet RPC and still completed the seven canonical consequence scenarios successfully. This is evidence that the retry/batching repair materially improved runtime resilience rather than merely silencing the failure.

## Promotion boundary

This proves the repair **before merge**.

It does not prove:
- the public Cloudflare Worker is running this repair head;
- hosted API→Solana POST now passes;
- the Vercel `/worlds-fair` route exists;
- full judge self-serve.

Merging PR #12 republishes the public Worker and therefore remains a fresh protected deployment checkpoint.
