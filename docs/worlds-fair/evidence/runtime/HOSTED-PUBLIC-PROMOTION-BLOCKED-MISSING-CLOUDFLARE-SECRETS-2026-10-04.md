# CRESCO World’s Fair — Public Promotion Blocked by Missing Cloudflare GitHub Secrets

Date: 2026-10-04
Status: **PUBLIC DEPLOY BLOCKED BEFORE DEPLOYMENT / NO LIVE CALL / NO RERUN**

## Authorized scope

The user authorized a temporary ops branch from exact main commit
`b81133c6e3c57c36f6baedcfcce3cf9b8d46d3e3`, with a one-shot GitHub workflow allowed to:

1. use existing GitHub Cloudflare secrets if available;
2. deploy only the existing public backend Worker `keys-api-stocklana`;
3. perform a read-only public runtime check after successful deployment;
4. trigger exactly one public World’s Fair 7/7 Solana Devnet run after successful read-only validation;
5. stop without alternative attempts if required Cloudflare secrets were absent or deployment failed.

No frontend deploy, mainnet, repeatability, product change, or mutation of PR #19/#20/#21/#22/#23/#24/#25/#26/#27/#28 was authorized.

## Ops branch

Branch:
`ops/worlds-fair-public-promotion-2026-10-04`

Base:
`b81133c6e3c57c36f6baedcfcce3cf9b8d46d3e3`

One-shot workflow commit:
`99e42d71bd060559b7454426ad0fd153825d12b5`

Workflow run:
`37233079206`

Job:
`111526689182`

## Guard result

The first workflow step checked only for the presence of GitHub Actions secrets required to identify/authenticate the Cloudflare account.

Observed environment:
- `CLOUDFLARE_API_TOKEN`: empty / unavailable
- `CLOUDFLARE_ACCOUNT_ID`: empty / unavailable

The guard emitted:

`CLOUDFLARE_API_TOKEN is not configured; stopping before deployment.`

Exit code: `20`

## Consequence

All protected steps were skipped:
- checkout exact promoted source: SKIPPED
- deployment: SKIPPED
- public runtime read: SKIPPED
- public 7/7 POST: SKIPPED
- receipt verification: SKIPPED
- post-run runtime read: SKIPPED

Therefore:
- public Worker deployment attempts: **0**
- public World’s Fair live attempts: **0**
- runtime mutation from this operation: **0**
- reruns: **0**
- alternative deployment attempt: **0**

No evidence artifact was uploaded because the workflow stopped before the evidence directory existed.

## Current truth boundary

Still proven:
- PR #29 exact head 7/7 live PASS on Solana Devnet;
- PR #29 merged to main as `b81133c6e3c57c36f6baedcfcce3cf9b8d46d3e3`;
- post-merge test PASS;
- post-merge Cloudflare Worker dry-run CI PASS.

Still not proven:
- public Worker `keys-api-stocklana` deployed from merge commit `b81133c6e3c57c36f6baedcfcce3cf9b8d46d3e3`;
- post-deploy public 7/7;
- post-deploy repeatability.

Canonical blocker:
`PUBLIC_DEPLOY_BLOCKED_MISSING_CLOUDFLARE_GITHUB_SECRETS`.

To remove the blocker, the repository/environment used by the deployment workflow must expose appropriate Cloudflare credentials under the expected GitHub Actions secret names, or a separately authorized deployment mechanism must be established.
