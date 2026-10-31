# PR #117 — Cresco Family V2 release record (DEPLOYED 2026-10-31)

Scope: only the existing Worker `cresco-family-open-test-web`. Never `cresco`, `keys-api-stocklana`, `cresco-api-stocklana`, `cresco-family-web` or `cresco-family-api`. The #115 generator stays pinned to `878fad8` and is not reused. Tested product SHA: `e3e616f51ba059816bc5c6250089a412c4e9cc90`.

## Before V2 deployment (read-only baseline, 2026-10-31)

- Target has one deployment, version `42900c64-0593-4b8f-8c7b-28152239f427` at 100%, created 2026-10-31T10:56:57Z, only binding `ASSETS`.
- Historic Workers at that time (latest deployment, 100%): `cresco` `8b2fcbb9-1288-4017-bd46-6b39b8933df8`, `keys-api-stocklana` `cb798053-e091-421f-8c8a-5b94d7cc1d1f`, `cresco-family-web` `57db966c-c039-4a40-a48f-a2a74cbdf0ff`. `cresco-api-stocklana` and `cresco-family-api` returned an API error on read; that does not prove absence. Re-read these after any release and compare.

## Prepublication checks (historical procedure; no Cloudflare write)

```powershell
cd apps\web
npm ci
npm run build:public-family
node --test scripts\prepare-family-open-test-117.test.mjs
node scripts\prepare-family-open-test-117.mjs --validate-only
node scripts\prepare-family-open-test-117.mjs --prepare-local-config
node scripts\prepare-family-open-test-117.mjs --verify-local-config
node scripts\prepare-family-open-test-117.mjs --live-readonly
npx --no-install wrangler deploy --config dist\server\wrangler.family-open-test-117.json --dry-run
```

`--live-readonly` fails unless the live version is exactly `42900c64` at 100% with only `ASSETS`, so the release can never overwrite an unknown state. `--verify-local-config` re-hashes `dist/client` and `dist/server` against the manifest written at prepare time and fails if the build changed.

**After deployment:** `--live-readonly` is intentionally pinned to the *old* version and should now fail because V2 is active. This is expected, not a regression. **Do not rerun the old deploy command** to check the current deployment. Use read-only `wrangler deployments list --name cresco-family-open-test-web` and `wrangler versions view cb3a6ad5-d579-43fa-a8e4-f8e2d5f38aee --name cresco-family-open-test-web` instead. Do not redeploy unless a separately reviewed new release is authorized.

## V2 release command (executed once with owner approval; do not repeat)

From a clean checkout of the exact tested commit, after the checks above:

```powershell
npx --no-install wrangler deploy --config dist\server\wrangler.family-open-test-117.json --message "PR #117 e3e616f"
```

Record the returned version ID, then smoke test the public URL on desktop and iPhone: `/` and `/try` 200; `/family`, `/invite`, `/wallet`, `/finance`, `/admin`, `/api/health` 404; no request to any API, RPC or wallet; blocked, Parent approve or decline, Child retry, receipt. Re-read the historic Workers and compare with the table above.

## Rollback available (not executed)

```powershell
node scripts\prepare-family-open-test-117.mjs --print-rollback
npx --no-install wrangler rollback 42900c64-0593-4b8f-8c7b-28152239f427 --name cresco-family-open-test-web --message "Restore pre-#117 version"
npx --no-install wrangler deployments list --name cresco-family-open-test-web
```

Rollback restores the stored version; it was checked to be retrievable (`versions view`) but not executed. If it fails, take the Worker offline with `wrangler deploy --config dist\server\wrangler.family-open-test-117-closed.json` (`workers_dev` off) and verify the URL no longer answers. Roll back on any safety or behavior regression.

## Released (2026-10-31, owner-approved, confirmed by operator report)

- New version `cb3a6ad5-d579-43fa-a8e4-f8e2d5f38aee` at 100% on `cresco-family-open-test-web` (product commit `e3e616f`, release tooling `153d3a2`, build digest `945fe39d...1ed7`, no rebuild between verify and deploy). Previous version `42900c64` kept as rollback target; rollback was not needed or run.
- Live checks: `/` and `/try` 200; 11 historic, API and finance paths 404; full WebKit suite 12/12 against the public URL (no outbound API, no replay); status visible after blocked, approve and retry on desktop and iPhone; no console error on desktop; only `/manifest.webmanifest` 404 on WebKit.
- `cresco`, `keys-api-stocklana` and `cresco-family-web` still on `8b2fcbb9`, `cb798053`, `57db966c`.

## Next: first external learning sessions, not another infrastructure launch

The publicly accessible test link can now be shared with **5–10 adults**, ideally including parents or guardians; no invitations or logins. Keep children adult-supervised; this is one-browser fictional practice, not real guardian verification. Ask each participant, without coaching: (1) explain My Key in one sentence; (2) try the blocked 25-credit MKT choice, then approve/decline as simulated Parent; (3) return to Child to find the outcome and receipt. Request only three optional reactions: what was unclear in the first 15 seconds, where they hesitated, and whether they'd want to use it with a family and why. Do not collect minors' identities, financial accounts or wallet addresses.

**Known mobile UX debts:** the sticky outcome panel occupies roughly one-fifth of a narrow viewport; navigation labels such as “Portf…” truncate and require scrolling. Track whether adults can discover Portfolio without prompting; fix on a subsequent scoped product PR if testing demonstrates friction. ` /manifest.webmanifest` (without the space) returns 404 in WebKit; minor unless confirmed to impact installation or browser use.

**Evidence limit:** operator reports full live WebKit 12/12 and a 100% V2 deployment, but these facts are not equivalent to measuring actual parent comprehension, repeat usage or value. Prior two API Workers that were unreadable through Cloudflare remain unverified, not presumed absent or changed. PR #117 remains unmerged.
