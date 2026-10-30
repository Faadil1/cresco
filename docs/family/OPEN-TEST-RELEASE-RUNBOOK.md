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
- `#114` `family/dual-learning-paths-full-practice-2026-10-30` is a **draft**, based on the exact head of `#111` at `dbe9678c...`; GitHub comparison showed the head is a descendant (`ahead_by=82`, `behind_by=0`) while the connector nevertheless reports `mergeable=false`.
- A draft state, a branch protection rule, an unknown API mergeability state, CI without an accessible PR-triggered run, and a true conflict are different cases. **Do not assume the reported Boolean explains which condition applies.** Check the PR's GitHub web UI / exact merge conflict text and repository rules, without changing base, marking ready or invoking a merge.
- This new preparation PR should target the frozen #114 branch; it adds only documentation and no-deploy test Worker configuration tooling. Keep #114 source frozen until a distinct product defect is found.

**Release decision today:** Open-test **PREPARED BUT NOT LIVE**. Explicit public release authorization and public smoke tests are still required.
