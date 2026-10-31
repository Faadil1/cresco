# Release path for PR #117 on `cresco-family-open-test-web` (PREPARED, NOT DEPLOYED)

Scope: only the existing Worker `cresco-family-open-test-web`. Never `cresco`, `keys-api-stocklana`, `cresco-api-stocklana`, `cresco-family-web` or `cresco-family-api`. The #115 generator stays pinned to `878fad8` and is not reused. Tested product SHA: `e3e616f51ba059816bc5c6250089a412c4e9cc90`.

## Before (read-only, 2026-10-31)

- Target has one deployment, version `42900c64-0593-4b8f-8c7b-28152239f427` at 100%, created 2026-10-31T10:56:57Z, only binding `ASSETS`.
- Historic Workers at that time (latest deployment, 100%): `cresco` `8b2fcbb9-1288-4017-bd46-6b39b8933df8`, `keys-api-stocklana` `cb798053-e091-421f-8c8a-5b94d7cc1d1f`, `cresco-family-web` `57db966c-c039-4a40-a48f-a2a74cbdf0ff`. `cresco-api-stocklana` and `cresco-family-api` returned an API error on read; that does not prove absence. Re-read these after any release and compare.

## Prepare and verify (no Cloudflare write)

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

## Release (ONLY after explicit owner approval; not run)

From a clean checkout of the exact tested commit, after the checks above:

```powershell
npx --no-install wrangler deploy --config dist\server\wrangler.family-open-test-117.json --message "PR #117 e3e616f"
```

Record the returned version ID, then smoke test the public URL on desktop and iPhone: `/` and `/try` 200; `/family`, `/invite`, `/wallet`, `/finance`, `/admin`, `/api/health` 404; no request to any API, RPC or wallet; blocked, Parent approve or decline, Child retry, receipt. Re-read the historic Workers and compare with the table above.

## Rollback (not run)

```powershell
node scripts\prepare-family-open-test-117.mjs --print-rollback
npx --no-install wrangler rollback 42900c64-0593-4b8f-8c7b-28152239f427 --name cresco-family-open-test-web --message "Restore pre-#117 version"
npx --no-install wrangler deployments list --name cresco-family-open-test-web
```

Rollback restores the stored version; it was checked to be retrievable (`versions view`) but not executed. If it fails, take the Worker offline with `wrangler deploy --config dist\server\wrangler.family-open-test-117-closed.json` (`workers_dev` off) and verify the URL no longer answers. Roll back on any safety or behavior regression.
