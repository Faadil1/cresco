# CRESCO World’s Fair — ORCA_CONTEXT Read Retry Live Validation PASS

Date: 2026-10-03  
Status: **PROVEN LIVE PRE-MERGE**  
Production deployment: **UNCHANGED**

## Exact source

- repository: `Faadil1/cresco`
- PR: #16
- branch: `fix/worlds-fair-orca-context-read-retry-v1`
- exact head: `9eb857bb3c369a0ab412977a976c131afac6899f`
- base main: `0ef9dc9618d9cbdfac1e714b7349993f4292aff9`
- PR state after validation: **Draft / open**

## Protected authorization consumed

The user explicitly authorized:
- opening PR #16 for the exact head;
- triggering one World’s Fair 7/7 live validation on Solana Devnet;
- only to validate the ORCA_CONTEXT read-retry repair.

Not authorized:
- merge;
- public Cloudflare Worker redeployment;
- additional Devnet live runs;
- mainnet or broader execution scope.

## Live validation

Workflow:
- `worlds-fair-operator-lab-live`
- run: `37140787012`
- job: `111254615300`
- result: **SUCCESS**

Artifact:
- id: `11280785419`
- name: `worlds-fair-operator-lab-runtime-receipt`
- digest: `sha256:a9b7e7ec909c69c5d0e1b3332888dbdd2bd7bef7dc22ae8a26a1c91538e4626d`

Observed:
- runtime READY before execution;
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`;
- starting Mandate nonce: `9`;
- final Mandate nonce: `10`;
- receipt schema version: `2`;
- receipt status: **PASS**;
- product state: `WORLD_FAIR_OPERATOR_LAB_LIVE`;
- `ORCA_CONTEXT`: completed;
- progress current phase: `COMPLETE`;
- all canonical phases completed;
- six confirmed effects recorded.

## Canonical scenario ledger

1. standing autonomy — PASS
2. soft boundary — PASS / REFUSE / `PythNotionalExceeded`
3. exact exception — PASS
4. hard boundary — PASS / REFUSE / `InvalidOrcaProgram`
5. evidence failure — PASS / REFUSE / `PythMessageInvalid`
6. rollback — PASS / REFUSE / `AmountOutBelowMinimum`
7. stale authority — PASS / REFUSE / `StaleNonce`

Representative confirmed signatures:

- standing #1:
  `3Zd5kmEcyNatMaR8YQ78kCv7mjEgDfGLYWiSBQZFLvr1t21zvbrRdJ88CfK1YTMBRHQexKhuL5im1MDUarmxr2CA`
- standing #2:
  `2TVsEY9GZGLgYWg5zW3p7T7aAmxbmHUz8tNu7bzaYFS28b37Pi3VJdZFPViw9SvpcmsRLpqHtbwhzQFcKeUj3tHs`
- exact exception grant:
  `28YFhgeSzCnZdVaFQVjGLwDFZy6KBRqcS4RsL7XBESBqgNgtvEfjie1dhN2rMkQBbanuDHYjERZ1v4GmnnKw8hJJ`
- exact exception execution:
  `4sM5s2APg7Dufcoey1LbC4ys3yBRsCn4MJMFMJDNSZF5Ux6nFwSgdbFx8rGeDnZNcHHNXN1BNmJmJaJfdBVFERpa`
- rollback grant:
  `2YE4F9sbVbr4cYGbiH7ynEvj2fkuPZUmnJsxndcNa8qXrCrGp9TJaiJNvRdWf7yJk579QcwyUk8tMRL9WXrz3CzK`
- stale-authority transition:
  `ToBzPZnVwSrHyrVirtVZWKUy7xvBvbgzqE6ty6P65QkfFmo8gUjWjKpbUWWf9ty1SkHw7HxeEQSPbanZ7FwFW5w`

## PR check matrix

All PR checks for the exact head passed:
- `cloudflare-worker-ci` run `37140786963`: PASS
- `test` run `37140787001`: PASS
- `worlds-fair-operator-lab-live` run `37140787012`: PASS

## Truth boundary

This proves that the exact ORCA_CONTEXT retry patch:
- preserves all non-live regressions;
- passes a real Devnet 7/7 sequence;
- successfully crosses the formerly intermittent `ORCA_CONTEXT` phase;
- reaches `COMPLETE` with schema-v2 progress tracking.

It does **not** yet prove:
- the patch is deployed to the public Cloudflare runtime;
- repeated hosted-browser stability post-deployment;
- elimination of all future transient Devnet/RPC failures;
- independent external-human use;
- adoption, demand, WTP, mainnet readiness, custody or audited security.

Therefore the patch is **live-validated pre-merge**, while hosted self-serve remains **PARTIAL / INTERMITTENT** until separately authorized merge/redeploy and post-deploy repeatability proof.
