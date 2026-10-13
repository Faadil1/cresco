# Release lock: main 2689c23 (2026-10-12 evening)

Purpose: bind the public CRESCO runtime to one exact commit before anyone external tests it.

## What is proven (read from GitHub check-runs on the commit)

| Item | Value |
| --- | --- |
| `main` HEAD | `2689c23a910ebd7ef8f56b9ea6b418dbd346af46` (PR #55, merged 23:35 UTC) |
| Workers Builds `cresco` (frontend) | success 23:36:41 UTC, version `04b59fda-2e6c-444f-9df1-7b99417dcb82`, build `a79d4331` |
| Workers Builds `keys-api-stocklana` (API) | success 23:36:51 UTC, version `ced3ef0d-3f84-4abb-9310-54422304b904`, build `52437d07` |
| GitHub CI | node, cresco-web, webkit-iphone: success |
| Later commits on `main` | none at read time |

Reality: **PARTIAL**. A successful Workers Build on the production branch normally deploys that version, but nobody has yet observed the public URL serving it. The sandbox that wrote this record cannot reach `*.workers.dev`.

## Owner confirmation (5 minutes)

1. Cloudflare dashboard → Workers & Pages → `cresco` → Deployments. The active version must be `04b59fda…`. Same for `keys-api-stocklana` with `ced3ef0d…`. Note anything else.
2. Open https://cresco.faadil-casecraft.workers.dev in a private window, desktop and phone. Check:
   - Home: hero, both cards (Family, Delegated capital), illustrations from PR #55, footer.
   - `/how-it-works`: 3 steps, Back/Next, the Family/Delegated capital toggle.
   - `/start` → "Try the demo as …" → Home, Learn, Explore, Portfolio, Profile, bottom navigation on phone.
   - Explore: Pyth prices carry a "Live · Pyth" or "Delayed" tag; untagged rows are sample prices (see the footnote). Note which tickers are tagged.
   - `/parent/sign-in` → "Continue as … (demo)" → parent dashboard.
   - `/worlds-fair/desk?case=family`: the setup form loads. Do not create a workspace for this check.
3. Fill the table below and commit it (or paste it to Claude).

| Check | Result | Note |
| --- | --- | --- |
| Active version `cresco` = 04b59fda | | |
| Active version API = ced3ef0d | | |
| Home desktop | | |
| Home phone | | |
| How it works | | |
| Family app 5 tabs | | |
| Explore price labels | | |
| Parent dashboard | | |
| Desk setup loads | | |

Only when every row passes does `RUNTIME_COMMIT_BINDING` in `state/CURRENT.yaml` move to `BOUND_2689c23`.

## From the next deploy on

The home footer shows `build <sha7>`, taken from `WORKERS_CI_COMMIT_SHA` at build time. Binding then becomes: open the home page, read the footer, compare with `main`.

## Unchanged truth

- Phantom wallet guardian: LIVE on Devnet since 2026-10-12 (PR #46). Revoke and revise in wallet mode are not exercised live.
- Devnet only, demo tokens, no real funds or custody.
