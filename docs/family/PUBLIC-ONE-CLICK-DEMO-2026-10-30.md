# Cresco Family — Public one-click learning demo (product-first)
**2026-10-30 | DRAFT / NOT DEPLOYED / NO REAL MINORS / NO REAL ASSETS**

## Founder product decision

Stop requiring Cloudflare Access, invitation codes, Parent/Teen credentials, WalletConnect, registration or a second device to try the **first public experience**. All of these steps distort first-impression product feedback. The visitor only needs one link and a browser.

The public demo is a **browser-only simulation** with no backend requests, no Cloudflare Access, no database, no cookie-based account, no blockchain write and no child profile. It is intentionally NOT the old durable, multi-device Family practice API. The two-role experience is a **single-browser role-play**, not persistent synchronization between family members. Do not imply otherwise.

## What a visitor does

1. Open the Family landing URL (when a future owner-approved public deployment exists) and click **Try Cresco — no sign-in** or navigate directly to `/try`.
2. See clear 3-step instructions and start with 100 imaginary credits.
3. In the Teen view, put aside 20 credits, reducing the available amount to 80. The Teen can also ask to learn about diversified funds.
4. In the Parent view **in the same browser**, approve or decline the *discussion*, not a trade. Both possible outcomes are presented.
5. Press **Reset practice**, or reload to begin again. Nothing is stored in Cloudflare Durable Objects, localStorage or a third-party form. No identifying details are collected by the experience itself (ordinary hosting request logs may still exist; disclose if needed).

## Implementation evidence

- `apps/web/src/app/try/page.tsx`: open Family demo route; rejected in Colosseum build with `notFound()`.
- `apps/web/src/components/family-agency-preview.tsx`: existing tested, local React state only. No fetch, crypto, server role tokens, financial permissions or persistent storage.
- `apps/web/src/components/family-only-home.tsx`: prominent no-login CTA; invitation/two-device onboarding and developer Devnet detours removed.
- `apps/web/src/lib/family-web-route-guard.ts`: only Family landing and `/try` plus required framework/static paths exposed. Deliberately block `/family-practice`, `/worlds-fair/desk`, Capital/Devnet and unrelated app routes.
- `CRESCO_FAMILY_PUBLIC_DEMO=1` only when building Family web in `build:public-family`; Vite forbids **any** `NEXT_PUBLIC_CRESCO_API_URL`. `scripts/assert-family-public-build.mjs` checks exact new Worker identity, route-disabled source and no API dependency.
- `.github/workflows/family-public-browser.yml` and `apps/web/e2e/family-public-demo.spec.mjs`: local mobile WebKit E2E, checks role steps, both outcomes, reset/reload, no calls to Family/Stocklana/Solana APIs, and deny on old restricted routes.
- `wrangler.family-api.jsonc` is **not** required or deployed for the public demo. All historical Colosseum files and Worker configs remain frozen.

## Product interpretation

- This build gives fast feedback on product clarity and perceived benefit, **not** validation of live shared Parent/Teen accounts, security of minor identity, actual funds, persistent history or guardian authority.
- Serious two-device persistence can return later, guided by what testers say. It is intentionally not a public launch prerequisite for this first no-login concept.
- Ask adults for qualitative feedback separately; do not silently harvest names, ages, identity, wallet, events or financial data from the demo.

## Deployment boundary

This PR is **source code only**. The owner-provided Cloudflare inventory previously confirmed `cresco-family-web` and `cresco-family-api` were not installed; it did not authorize creation. Both Family Wrangler configs still have `workers_dev:false`, `preview_urls:false` and no routes. A future public **web-only** rollout would require separate authorization, review of Worker identity/bundle, and deliberate opt-in to `workers_dev:true` **only on `cresco-family-web`**. Do not deploy `cresco-family-api` just to show this simulation. That preserves zero user account, zero DO exposure and low operating cost.

Never deploy or rename historic `cresco` or `keys-api-stocklana`; never merge these experiments to Colosseum `main` without separately approved procedures.

**Verdict: public demo source candidate; deployment NOT executed; production URL does NOT exist yet.**
