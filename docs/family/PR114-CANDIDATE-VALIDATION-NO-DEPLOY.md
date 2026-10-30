# Family PR #114 — unblock candidate verification (NO DEPLOY)

**Status:** Independent candidate only; no merge and no Cloudflare deployment authorized. Applies to branch `family/dual-learning-paths-full-practice-2026-10-30`. Original Colosseum/Stocklana Workers must remain immutable.

## Investigation: why GitHub results disappeared

At HEAD `96160f01` the GitHub connector's `fetch_commit_workflow_runs` returned no rows. Its documented limitation: it **filters to pull-request-triggered runs**; it cannot establish whether a `push` run exists. The repo's `.github/workflows/web.yml` and `test.yml` already include `push` events, so "no PR records" does not prove Actions were never executed.

PR #114 is currently reported `mergeable=false`, while the GitHub comparison `family/public-one-click-practice-2026-10-30...family/dual-learning-paths-full-practice-2026-10-30` shows `behind_by=0`, `ahead_by=55`, and merge-base identical to the Family base HEAD at the time of investigation. **The exact cause of the contradictory mergeability status is not established.** GitHub documentation confirms pull_request workflows may be suppressed when the PR has merge conflicts, but this is not proof that this PR has a conventional file conflict.

To add a recoverable, isolated test entry, `family-public-browser.yml` now includes a `push` event restricted to **this exact candidate branch** and to web or workflow paths. This is a testing-only workflow; it has no Cloudflare deploy step, account token or writes to production. The regular pull_request trigger remains intact. The GitHub connector may still fail to show this `push` run; check the **GitHub Actions UI** filtered by branch, and collect the exact workflow run URL, event, SHA and conclusion if possible.

### Official Actions sources
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows

## Self-contained Windows proof

Use an **independent checkout**; never switch or overwrite the original Colosseum checkout or the previously installed public Family release. In Windows PowerShell:

```powershell
cd C:\Users\fboussari\Documents
git clone --single-branch --branch family/dual-learning-paths-full-practice-2026-10-30 https://github.com/Faadil1/cresco.git cresco-family-pr114-review
cd .\cresco-family-pr114-review\apps\web
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\family-pr114-local-proof.ps1
```

The script refuses wrong branch, uncommitted source modifications and Node below 22. It uses the exact checked-out full SHA as evidence. It clears `NEXT_PUBLIC_CRESCO_API_URL` only inside the script and restores the previous environment afterward.

The script runs:
1. npm dependency install, TypeScript typecheck, ESLint and copy-lint, Vitest unit suite.
2. `npm run build:public-family` — **local artifact only**, no `wrangler deploy`.
3. Family public binding/isolation validation and independent historical Worker freeze check.
4. Local Wrangler Cloudflare Worker WebKit tests, including iPhone and desktop Safari scenarios, distinct Parent/Child paths, Key policies, Research, comparison, receipts and forbidden routes.
5. Local Playwright screenshot attachments and an HTML report.

**Proof output:** `%TEMP%\cresco-family-pr114-proof-<first 12 SHA characters>\PROOF.md` plus logs and PNG screenshots. On a failure, it stops with `FAMILY_PR114_LOCAL_PROOF=NO_GO` and the exact log path. Use `-SkipInstall` only if compatible dependencies are already installed.

This script may install local packages and Playwright WebKit in the private test checkout, but does not contact or modify Cloudflare account resources, invite users, create wallets or execute finance rails.

## Release gate

Do **not** treat a prior green commit, `git status` success, screenshot generation or a single browser test as proof of release readiness. Record fresh full-SHA checks, inspect the actual iPhone/desktop screenshots, and verify that a nontechnical Child and Parent can find Learn, Explore, My Key, the exact-amount request, Parent Learning and Learn Together without a walkthrough.

The public Family URL may currently be **closed** via a no-target configuration from the prior rollout; do not infer reachability from the presence of a Worker installation. No one may reopen, deploy or merge as part of this verification task.
