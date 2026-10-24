# CRESCO — Workspace read isolation + zero-budget lab control (2026-10-21)

**Status:** PATCH PROPOSED / NOT MERGED / NOT DEPLOYED. Branch `fix/cresco-workspace-read-access-devnet-budget-20261021`.
**Reference:** `Faadil1/cresco@e5ea2ad407e530704d3c82cba18db3cb63644499` before patch.
**Owners:** human owner for merge, Cloudflare production settings, release and any live Devnet exercise.
**Boundary:** Solana Devnet only; demo tokens; not customer identity or mainnet security assurance.

## Observed code-level P0: workspace id is not permission

The v0.4 HTTP router previously served GET workspace, requests, history, mandate and
principal-signature messages without role authentication. Role tokens were required
for most mutations, but the read endpoints exposed per-workspace labels, request
metadata, policy and receipts to anyone possessing an identifier.

Remediation proposed:
- All workspace-scoped GETs validate the provided bearer against that exact
  workspace via `workflow.whoami` before returning any data.
- The principal approval-message and wallet-binding message paths also require
  the **principal** role; operator and risk-owner tokens get `403 ROLE_FORBIDDEN`.
- The OpenAPI endpoint remains public. This does not authorize new writes.
- Next.js desk sends an authorized token for workspace, requests, history and
  mandate reads, including when a role-specific fragment is imported.
- The API declaration now matches the actual read restrictions.
- Negative non-live tests cover: missing credential, foreign-workspace credential,
  distinct role access, principal-only signing messages and no chain side effects.

**Threat boundary:** this changes HTTP disclosure, not the already public
Solana blockchain. Program/actor authority remains unchanged. The demo browser's
creator still sees all three role links and must be treated as a **demo**, not
a secure role distribution channel for paying customers.

## Observed P0 for production onboarding: Family v0.2 is a shared demo

The historical Family flow uses `src/cloudflare-family-state.mjs` with a fixed
`familyId` and shared demo state; `/api/v0.2/auth/demo-session` issues guardian
or child **demo** sessions without verifying real-world identity.
Its UI explicitly says that this is not a production account.

This patch **does not pretend to fix customer authentication**. A real commercial
Family service needs isolated family-owned state, authenticated guardians,
child protections, secure invitation/revocation, privacy controls, data retention
and separate migrations/canonical Solana mapping. Until proven, use fictional
profiles only; no real minor, personal finance record or real funds.

**Gateway:** `PRODUCTION_FAMILY_IDENTITY = BLOCKED`; usability tests can use
demo content, labelled accordingly. Do not equate frontend test success with
multi-tenant privacy or compliance.

## Cost and external tester safeguards

Existing safeguards in source:
- `maxWorkspaces=25` by default, bounded configurable variable 1..200.
- `WORLD_FAIR_CREATE_TOKEN` optional gate on workspace creation.
- Per-workspace vault refill cooldown and bounded policies.

Added, **inactive unless configured**:
- Worker variable `WORLD_FAIR_WORKSPACE_CREATION_DISABLED=true` makes
  `POST /api/v0.4/worlds-fair/workspaces` return HTTP 503
  `WORKSPACE_CREATION_DISABLED`. It creates no workspace or index entry.
- Existing workspaces and read/OpenAPI paths remain functional. This **does
  not stop actions inside existing workspaces** and does not guarantee zero
  external charges. A full emergency spend stop additionally requires
  provider-level suspension/quotas and an owner-reviewed operational plan.

Prior to any public tester invitation:
1. Cloudflare dashboard: inspect active deployments/versions of `cresco`
   and `keys-api-stocklana`, CPU requests, Durable Objects, costs, billing,
   alerts and remaining free usage. **Never copy credentials into notes.**
2. Review Solana Devnet guardian/test vault balance, Pyth entitlement and
   RPC usage/billing; do **not** initiate a paid or live run during this review.
3. Choose a strict workspace limit and whether public creation is allowed.
   `WORLD_FAIR_CREATE_TOKEN` restricts creation but must not be placed in
   public client JS. To pause creation, configure the new switch **only after
   this patch is merged/deployed with explicit authorization**.
4. Confirm no public tester is asked to provide private keys, personal data,
   real funds, or a family name. Send the home URL, never workspace role links.
5. Run a **read-only** hosted authorization smoke first, then evaluate if
   separately authorized bounded Devnet writes are justified.
6. Record the exact source commit, active Worker version and screenshots in
   the release ledger before calling anything production-proven.

## Gate ledger (this PR)

| Existing check / domain | State | Evidence / unresolved |
|---|---|---|
| Solana program behavior | PROVEN (historical Devnet) | Unchanged; onchain receipts from 2026-10-12 |
| Private Workspace GET in source | ACTIVE / pending CI | API read guard and negative tests, branch only |
| Cross-workspace HTTP isolation | ACTIVE / pending CI | Anonymous/foreign role token cases in tests |
| Principal signing message isolation | ACTIVE / pending CI | Principal-only HTTP gate and tests |
| Zero-budget creation freeze mechanism | ACTIVE / pending CI | Optional opt-in env switch; not enabled |
| Current Worker contains fix | BLOCKED | No authorized merge/deploy/version binding |
| Current Cloudflare/RPC/Pyth charges = $0 | UNKNOWN | No billing or usage access in audit |
| Real Family authentication/privacy | BLOCKED | Demo sessions and shared Family state |
| External human usability evidence | ACTIVE, NOT PROVEN | Test kit exists; independent outcomes not inspected |
| Production custody/mainnet/regulatory readiness | N/A | Not authorized or claimed |

## Acceptance before merge or release

- Root Node non-live suite, web typecheck/lint/unit/browser tests GREEN
  on **exact PR head**, not an ancestor; if CI unavailable say UNKNOWN.
- Verify test covers foreign role credentials and no accidental reads.
- Verify no protected/live workflow gained a push or PR trigger.
- No changes to on-chain program, wallet signing, policy values, demo funding,
  Pyth/Orca computation or historical transaction evidence.
- Human reviews the remaining P0 Family production isolation gap.
- Explicit human approval separately required for merge, cloud deployment,
  real Devnet executions and later production customer onboarding.
