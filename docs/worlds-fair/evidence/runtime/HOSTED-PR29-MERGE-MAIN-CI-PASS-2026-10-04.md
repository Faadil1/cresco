# CRESCO World’s Fair — PR #29 Merge to Main + Automatic CI

Date: 2026-10-04
Status: **MERGED TO MAIN / POST-MERGE CI PASS / PUBLIC REDEPLOY NOT PERFORMED IN THIS SCOPE**

## Authorized scope

The user authorized:
- merge PR #29 only;
- exact authorized PR head: `b77b5378c6088c50c2912a4b4254c43b28f549fd`;
- promotion to `main`;
- observation and reconciliation of workflows automatically triggered by GitHub.

Not authorized:
- manual public redeploy;
- manual World’s Fair live run;
- repeatability campaign;
- mainnet;
- mutation or closure of PR #19/#20/#21/#22/#23/#24/#25/#26/#27/#28.

## Merge result

Repository: `Faadil1/cresco`
PR: **#29**
Authorized head: `b77b5378c6088c50c2912a4b4254c43b28f549fd`
Previous main: `1266756fb6a00318618daefe9db3d875387411b5`
Merge commit / current main head:
`b81133c6e3c57c36f6baedcfcce3cf9b8d46d3e3`

GitHub result:
- merged: true
- PR state: closed by merge
- merged_at: `2026-10-04T19:51:31Z`

## Automatically triggered GitHub workflows

Only the following workflows were observed for merge commit
`b81133c6e3c57c36f6baedcfcce3cf9b8d46d3e3`:

1. `test`
   - run: `37229869661`
   - event: `push`
   - result: **PASS**

2. `cloudflare-worker-ci`
   - run: `37229869664`
   - event: `push`
   - result: **PASS**
   - backend tests: PASS
   - Cloudflare Worker packaging: PASS
   - packaging mode: dry-run

No GitHub Actions World’s Fair live workflow was observed for this merge commit.

No manual action was triggered after the merge.

## Relationship to the 7/7 proof

The exact PR head merged into main had already passed:
- root test `37214175228`: PASS
- Cloudflare Worker CI `37214175272`: PASS
- World’s Fair live operator-lab `37214175230`: PASS
- receipt validation: PASS
- artifact: `11307628144`
- digest: `sha256:e2f93357e79d89a40ae864df76b7f7dce81ea837de1b12fab06a689cfb5a65ce`

Therefore:
- the reliability repair proven at the exact PR head is now present in `main`;
- post-merge source/CI integrity is proven;
- the merge commit itself has not been given a new live 7/7 run in this scope;
- the public hosted runtime has not been manually redeployed or post-deploy validated in this scope;
- repeatability remains unproven for the newly merged public promotion state.

Canonical classification:
`MAIN_PROMOTED_FROM_7_OF_7_PROVEN_HEAD__POSTMERGE_CI_PROVEN__PUBLIC_RUNTIME_VALIDATION_PENDING`.

## Truth boundary

Proven:
- exact PR head 7/7 live on Solana Devnet;
- PR #29 merged to main;
- main now contains the repair;
- post-merge test workflow PASS;
- post-merge Cloudflare Worker dry-run CI PASS.

Not proven by this checkpoint:
- that a public hosted deployment has consumed merge commit `b81133c6e3c57c36f6baedcfcce3cf9b8d46d3e3`;
- post-deploy live 7/7;
- post-deploy repeatability;
- independent external-human use, WTP or adoption;
- mainnet readiness.
