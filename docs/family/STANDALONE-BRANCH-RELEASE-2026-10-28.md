# Cresco Family — independent release branch (2026-10-28)

## Owner directive

The Colosseum-submitted Cloudflare Workers MUST NOT be modified or redeployed.
Historical Web Worker: cresco, https://cresco.faadil-casecraft.workers.dev
Historical API Worker Wrangler name: cresco-api-stocklana; observed API hostname https://keys-api-stocklana.faadil-casecraft.workers.dev

Do not merge Family into main. Cloudflare Workers Builds can auto-deploy the historic Worker from main. Do not reuse existing Durable Objects, secrets, wallets, accounts, identifiers, routes or data.

## Independent source lane

- Long-lived branch: **family/standalone**, created from PR #94 head 22f5c914162e27b8408a96182ab4b86c377f3aab.
- [PR #94](https://github.com/Faadil1/cresco/pull/94) remains DRAFT and unmerged.
- Release blocker: [issue #95](https://github.com/Faadil1/cresco/issues/95).
- This isolates source development, but does NOT yet prove isolated Cloudflare accounts, Workers, or deployments.

## Dedicated target identities (not live)

| Resource | Target |
| --- | --- |
| Family API Worker | cresco-family-api (wrangler.family-api.jsonc) |
| Family Web Worker | cresco-family-web (apps/web/wrangler.family.jsonc) |
| Family API implementation | src/cloudflare-family-only-worker.mjs |
| Family Durable Object | CrescoFamilyIsolatedState, with fresh namespace |
| Web/API origins | Dedicated matching cresco-family-* Workers on the verified Cloudflare account |
| Family invitation secret | CRESCO_FAMILY_CREATE_TOKEN, new Worker API secret only |
| Devnet writes | OFF by default; NO financial/chain writes authorized |
| Historical Workers | Never targets of a Family build/deployment |

Do not mistake example workers.dev hostnames for verified deployment URLs.

## Offline security/release gates

1. The script **scripts/family-release-boundary.mjs** checks the preserved Git blob SHA of both historical Wrangler configurations and refuses changes to old targets, new Worker names/entrypoints, DO reuse, zone aliases, plaintext secrets, historical API fallbacks, and committed Devnet-write enablement.
2. Pinned historical Wrangler blobs: API 4596cf7d12af18fb3d5d17e87ebc3357b5bc766a; Web ae4492f08ba1aac45ff3b37f8289cdbbe5bbe3fd.
3. The same script with --built-web verifies the compiled artifact is named cresco-family-web, never cresco.
4. GitHub Actions **family-isolation.yml** runs the release boundary, negative tests, Web Family build verification and API Wrangler dry run, using read-only GitHub permissions and NO deployment command or Cloudflare secret.
5. **scripts/family-standalone-readonly-probe.mjs** accepts only matching isolated Family API and Web workers.dev origins on one account, performs only unauthenticated GET/OPTIONS requests and verifies Family routes, CORS, expected refusals, the absence of Capital page and Devnet writes disabled. It does not sign or spend.
6. **test/family-release-boundary.test.mjs** and **test/family-standalone-readonly-probe.test.mjs** cover mistakes and forbidden targets.

These are source/CI safeguards, not equivalent to provider-side IAM, GitHub rulesets or a Cloudflare deployment freeze. Dashboard and account settings require separate verification.

## Required steps before any deployment

- Identify the correct Cloudflare account and prove the exact historical Worker/service identities, version IDs and build branch without exposing secrets.
- Validate Cloudflare only builds new Workers from family/standalone, not main and not historical Worker names.
- Obtain independent security review of Parent, Teen and second-parent role links, signed-wallet recovery, replay/rate-limit/abuse and missing guardian/age assurances.
- Configure a unique fresh Durable Object namespace and an isolated invitation secret on a new Family API Worker. Never copy keys from Colosseum.
- Seek explicit approval for a NEW **private/staging-only** Family Cloudflare release. Do not deploy automatically in CI. Keep Devnet transactions disabled.
- After a staged release, execute the anonymous read-only probe against the ACTUAL verified Family origins, bind live Web/API to exact versions and test a consenting multi-device, no-funds journey.
- Mainnet, real families, Devnet execution/funding and any legal/financial promises remain NO-GO until separately authorized and reviewed.

Sample read-only post-deploy invocation (after real origins are confirmed):

    node scripts/family-standalone-readonly-probe.mjs --api https://cresco-family-api.ACCOUNT.workers.dev --web https://cresco-family-web.ACCOUNT.workers.dev

## Truth boundary

- SOURCE: Separate branch, configs, scripts, tests and CI rules written.
- CI: Must check exact commit status after the new PR runs.
- Hosted Cresco Family: NOT DEPLOYED / NOT VERIFIED.
- Cloudflare account identification and independent security approval: UNKNOWN / BLOCKED.
- Real-user or financial readiness: NO-GO.

No main merge, original Worker change, Cloudflare deployment, Solana transaction or credential action is authorized in this phase.
