# Cresco Family — open tester launch runbook (PREPARATION ONLY)

**Status 2026-10-30:** Prepared, not deployed. The reviewed product SHA is `878fad8517c29b2ea778f8f82e18093a057cf1bc` (PR #114, independent Windows `LOCAL_PROOF=PASS`, 142/142 unit tests, 8/8 WebKit tests, 6 distinct screenshots reviewed). This release-preparation branch is separate; its *product source* must remain identical to that SHA.

**Goal:** One public, no-invitation, no-sign-in link for nontechnical adults and parent-led family education feedback. Entirely fictional credits, one shared-browser simulation. No live market feed, child account, legal guardian verification, real permission, payment or blockchain interaction.

## Exact boundaries

- Preserve the original Colosseum/Stocklana Workers `cresco`, `keys-api-stocklana` and `cresco-api-stocklana` with their historical source/config SHAs. Never overwrite them.
- Preserve existing `cresco-family-web` and `cresco-family-api` as installed. No redeploy and no repointing their existing URLs.
- Proposed **new, distinct** worker: `cresco-family-open-test-web`, direct workers.dev access once explicitly approved and published. The real public URL must come from the actual deployment output, never guessed.
- No Cloudflare Access, invitation code, account, wallet, CAPTCHA gate, paid signup, parent/teen role codes or backend endpoint. The landing page has a `Try Cresco - no sign-in` link to `/try`.
- Only `/` and `/try` are accessible. Historical money/parent/auth/API routes remain forbidden.
- No sensitive tester data collection. All practice state exists in the active browser tab and resets when refreshed.
- **This branch is NOT a deployment authorization**. No merge, deploy, account authentication or public URL claim follows from green local tests.

## What is already evidenced

| Gate | Status / evidence |
| --- | --- |
| Parent/Child fictional action loop + blocked boundaries + exact single-use exception | PASS, WebKit 8/8 at frozen product SHA |
| Unit tests, typing, lint, production Family build, Worker freeze | PASS, owner-independent local proof at frozen SHA |
| iPhone initial Child tabs, Explore search, Parent exact Approve Once and Decline visible | PASS, screenshots and `toBeInViewport` regression checks |
| Desktop Child Home and Parent Learning | PASS, actual Safari/WebKit screenshot review |
| Real external testers understand Key and simulation | **NOT YET TESTED** |
| Open-test Worker exists / public URL verified | **NOT YET DEPLOYED** |
| PR #114 GitHub `mergeable=false` | **UNRESOLVED; not proof of a file conflict** |
| GitHub Actions check on exact SHA | **NOT ESTABLISHED**; connector only reports pull_request runs, not all push runs |


### Verified GitHub Actions failure scope (2026-10-30)

Read the actual **push-triggered** Actions run [41117354680](https://github.com/Faadil1/cresco/actions/runs/41117354680) on exact reviewed PR #114 SHA `878fad85...`. The `node` job **succeeded**. The distinct **Hosted Family contract observation (GET/OPTIONS only; NOT release proof)** job **failed**, because the *existing hosted historic Family API contract* does not yet advertise these three expected `/api/v0.4/worlds-fair/` routes:

- `workspaces/{id}/roles/{role}/rotate`
- `workspaces/{id}/principal/recovery/challenge`
- `workspaces/{id}/principal/recovery/complete`

The remote observation reported OpenAPI public GET 200, `no-store`, approved-origin CORS and blocked untrusted-origin CORS as PASS; it explicitly said **hosted commit not verified** and historic Web `/` and `/worlds-fair/desk` reachable. That is an operational gap in the **historical hosted environment**, not a failed 142-unit/8-WebKit browser-only candidate. **Do not redeploy or modify the frozen Colosseum/API Workers to make the checker green.** Keep the reported hosted contract failure visible and separate from the Family public no-backend test Worker release.

A dedicated `.github/workflows/family-open-test-prep.yml` now independently checks only the frozen source diff and offline Node configuration safety tests on the separate preparation branch. It contains **no deployment job**. Its result must be read from its actual SHA and Actions run; do not claim green before it completes.

## Non-deploying release preparation (separate checkout)

Do not run commands inside the original Colosseum checkout. The following commands build and check a local artifact **without any Cloudflare API calls**. Run only when the preparation PR has been reviewed:

```powershell
cd C:\Users\fboussari\Documents
git clone --single-branch --branch family/open-one-click-tester-launch-prep-2026-10-30 https://github.com/Faadil1/cresco.git cresco-family-open-test-prep
cd .\cresco-family-open-test-prep\apps\web
npm ci
npm run build:public-family
node --test .\scripts\prepare-family-open-test.test.mjs
node .\scripts\prepare-family-open-test.mjs --validate-only
node .\scripts\prepare-family-open-test.mjs --prepare-local-config
```

`--validate-only` creates **no files**. `--prepare-local-config` creates only two ignored local sibling config JSON files under `apps/web/dist/server/`:

- `wrangler.family-open-test.json`: new dedicated Worker name, workers.dev on, preview URLs off
- `wrangler.family-open-test-closed.json`: same dedicated Worker name, workers.dev off, preview URLs off

The generator refuses uncommitted changes, a wrong branch, changed product source relative to frozen SHA, an unsealed backend configuration, service/DO/DB bindings, historic Worker names, routes/zones and suspicious runtime bindings. It runs the existing independent Colosseum Worker freeze check. **It contains no deploy command, credentials, remote API call or Cloudflare authentication.**

A real release requires **separate explicit owner authorization** after checking that the dedicated new Worker name does not already exist in the intended Cloudflare account. Obtain its actual public URL from the deployment receipt, then validate it. Do not infer the URL from a Worker name or assume the current public Family installation is reachable.


## Windows guarded publishing handoff (owner approved direction; no remote access in this chat)

GitHub CI validates the **source and release artifact** but the owner must complete the account-specific Cloudflare operation from their authenticated Windows session. There is no Cloudflare connector attached to this chat; **do not paste Cloudflare tokens, OAuth responses or account IDs**. `wrangler whoami` is a read-only check, and `wrangler deployments list --name` / `versions list --name` are read-only checks (Cloudflare [Wrangler docs](https://developers.cloudflare.com/workers/wrangler/commands/workers/)). An unsuccessful list call is **not proof** the Worker does not exist.

From a **new checkout of the preparation branch** (not the old PR #114 or Colosseum worktree):

```powershell
cd C:\Users\fboussari\Documents
git clone --single-branch --branch family/open-one-click-tester-launch-prep-2026-10-30 https://github.com/Faadil1/cresco.git cresco-family-open-test-launch
cd .\cresco-family-open-test-launch\apps\web
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\family-open-test-windows-launch.ps1
```

The **default run never deploys**: it verifies unchanged frozen source, runs local negative tests/build, prepares ignored open/close Wrangler configs, checks Wrangler login, and reads possible Worker deployment/version details. If Wrangler is not logged in, authenticate privately with `npx wrangler login` in this isolated checkout and retry. Check **Cloudflare Dashboard → Workers & Pages** in the *intended account*: verify the **exact** `cresco-family-open-test-web` name is **absent**. Stop if it exists or if the Cloudflare account is unexpected; never overwrite it.

Once account, target uniqueness, local proof and explicit authorization are all confirmed, the owner runs:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\family-open-test-windows-launch.ps1 -Publish -SkipInstall
```

The script requires typing `PUBLISH cresco-family-open-test-web` and invokes a single `npx --no-install wrangler deploy --config dist/server/wrangler.family-open-test.json` **only after rerunning the checks**. No other Worker name is accepted. Record the **actual** URL Wrangler returns and run the public smoke gate above before telling testers about it. Check the Cloudflare dashboard and the public URL again after the deployment.

Emergency lockdown (only for the *new* Worker and only after verifying its identity):

```powershell
npx --no-install wrangler deploy --config dist/server/wrangler.family-open-test-closed.json
```

Never run that close config against any historical or existing Family worker. Verify the new URL is no longer publicly reachable. `workers_dev=false` and `preview_urls=false` are both explicitly set in the close config; Cloudflare documents these controls: [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).

**Safety properties:** No hidden automatic Cloudflare write, no deployment during CI, no temporary anonymous Cloudflare account, no account-token exchange inside ChatGPT. The only Cloudflare write is a direct, locally confirmed and user-triggered deployment of the newly named Worker.


### Windows preflight incident and repair (2026-10-30)

The owner independently ran the no-deploy PowerShell helper. Evidence from the terminal: npm install **PASS**, new standalone Family build **PASS**, seven isolated config safety tests **7/7 PASS**, `OPEN_TEST_CONFIG_PREPARED_NOT_DEPLOYED` with the correct distinct Worker name, then `FAMILY_OPEN_TEST_LAUNCH_NO_GO: UNSAFE_OPEN_TEST_CONFIG_NO_GO` **before Wrangler was called**. This is **not** a live Cloudflare failure and did not publish anything.

**Cause isolated from source:** Windows PowerShell 5.1 `ConvertFrom-Json` produces PSCustomObjects for JSON object values; even empty `{}` structures can evaluate true in the old final `if ($cfg.vars -or $cfg.durable_objects ...)` test. The build's strict JavaScript validator had already allowed harmless empty structures. The additional PowerShell condition was therefore not equivalent to that validator. Rather than deleting the guard, the release tool now provides `--verify-local-config`, which loads both generated JSON files and performs a **deep structural exact comparison** against the validated sealed build's expected open/close configs. Extra backend bindings, aliases, target name changes, exposure/preview flag drift and any injected config values still cause NO_GO. Regression tests assert harmless empty `{}` / `[]` are accepted and actual malicious additions rejected.

The Windows operator now reruns this exact structural check and, in publish mode, requires **two deliberate confirmations**: first that the target name is unused in the expected account, then the exact new Worker name for publication. Wrangler lookups remain read-only and inability to read a target does not prove absence. The separate GitHub preflight CI also runs `--verify-local-config`. **No change was made to the frozen product SHA or any historic Worker configuration.**

**Next proof required:** run the updated PowerShell helper on latest PR #115 HEAD with `-SkipInstall` and inspect the result through Wrangler read-only checks; do not publish until the current no-deploy CI run passes, and verify uniqueness of the new Worker name in the dashboard before entering `-Publish`.

## Release approval gate — not yet cleared

Before ever sharing a link with test users, independently verify on the **actual public URL**:

1. HTTP 200 for landing `/` and `/try`; first tap starts the entire fictional experience with no login, code, invitation or wallet.
2. In an unmodified mobile browser, complete Child learning, Save credits, Explore, blocked practice MKT request, simulated Parent exact decision, and Child retry / no-replay. Refresh resets state.
3. Historical routes such as `/parent/sign-in`, `/worlds-fair`, `/api/v0` and `/invest/ORC` return not-found; inspect the browser network log to prove **no Cloudflare Family API, Solana RPC or historical Worker call**.
4. Confirm existing deployed `cresco-family-web` and Colosseum Workers remain unchanged (identities, routes and expected behavior), and the new Worker has no service or storage bindings.
5. Confirm the intended **new** Worker can be closed without affecting historical/public installations; verify public reachability after any closure rather than assuming config change was sufficient.
6. Record Worker name, actual URL, exact product SHA and commit/build evidence, activation receipt, smoke-test browser/device, tester-channel method, and person authorizing release. Never paste secrets or private Cloudflare tokens in GitHub.

If any item fails, **do not advertise the link**. Fix only the new isolated test Worker / reviewed release process.

## Tester rollout with no gatekeeping

- Share the same single public URL (once real and verified) with **5–10 adults initially**, including parents/guardians when possible. No invitations or account provisioning are required, and no approval is needed to try the fictional Child/Parent roles.
- Use the lightweight tester guide at `docs/family/OPEN-TEST-TESTER-GUIDE.md`. Let testers explore before offering hints. The Parent role is simulated and any real child participation should be adult-led.
- Invite **optional, anonymous qualitative feedback**, sent through an owner-approved public contact channel. Never collect children's names, ages, screenshots of personal accounts, exact locations, emails or financial data by default.
- After the first small round, categorize confusion about `Key`, ability to navigate Parent/Child, correct understanding of pretend credits, and desire to try again. Record observations and actions with the lightweight feedback ledger below. Avoid invented adoption/retention statistics.

## Small feedback ledger

Use one row per non-identifiable response. The owner fills in only actual evidence:

| Session | Adult/parent? (optional) | Found Child lesson? | Found Explore? | Found Parent exact decision? | Understood pretend credits? | Biggest friction (verbatim gist) | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Example only — REMOVE before reporting | unknown | not measured | not measured | not measured | not measured | no observation yet | none |

No backend instrumentation is required for the first qualitative round; do not claim success, signups or retention from page views or developer-driven Playwright clicks.

## PR sequence and mergeability

- `#111` `family/public-one-click-practice-2026-10-30` is a **draft**, based on `family/sealed-first-install-2026-10-30`.
- `#114` `family/dual-learning-paths-full-practice-2026-10-30` is a **draft**, based on the exact head of `#111` at `dbe9678c...`; GitHub comparison shows the head is a descendant (`ahead_by=82`, `behind_by=0`). The GitHub REST PR endpoint subsequently returned **`mergeable=true`, `mergeable_state=unstable`**. The simplified connector had reported `mergeable=false` while REST temporarily reported `mergeable=null`, `mergeable_state=unknown`; that was not proof of a merge conflict.
- A draft state, a branch protection rule, an unknown API mergeability state, CI without an accessible PR-triggered run, and a true conflict are different cases. **Do not assume the reported Boolean explains which condition applies.** Check the PR's GitHub web UI / exact merge conflict text and repository rules, without changing base, marking ready or invoking a merge.
- This new preparation PR should target the frozen #114 branch; it adds only documentation and no-deploy test Worker configuration tooling. Keep #114 source frozen until a distinct product defect is found.

**Release decision today:** Open-test **PREPARED BUT NOT LIVE**. Explicit public release authorization and public smoke tests are still required.
