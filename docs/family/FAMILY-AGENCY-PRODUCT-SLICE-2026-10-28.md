# Cresco Family — agency-first learning preview

**Status:** source-only Family feature candidate, no Cloudflare deployment, no user testing, no financial release.
**Date:** 2026-10-28

## Product hypothesis

The young person should be able to see their own practice decisions and outcomes; the caregiver should set explicit boundaries, understand risks and help the young person learn. Neither a Parent's authorization nor a child's curiosity substitutes for identity, suitability, legal eligibility or real financial permissions.

**Not a market-validated claim:** Whether households prefer this over current methods, whether they will use it again, and whether they will pay are all UNKNOWN pending real interviews and observed tasks.

## Current independent Family product reality

- The isolated Family site `apps/web/src/components/family-only-home.tsx` offers entry into the Family v0.4 desk but not a usable full learning app.
- `apps/web/src/lib/family-web-route-guard.ts` currently refuses `/start`, `/home`, `/parent`, so the existing v0.2 demo learning experience is not available from the independent Family-only Worker.
- The v0.2 demo session and v0.4 Family workspace are separate. Merely allowlisting routes can reintroduce auth/role or backend-origin confusion and is **not** approved.
- Existing Parent/Teen/second-parent request, role-rotation and recovery code is source/CI level on stacked drafts. New Family hosted deployment, real adult testing and independent security sign-off are still blocked.

## First small feature: simulated Teen/Parent decision story

On Family-only home, `FamilyAgencyPreview` shows two **same-tab simulated** viewpoints:
1. Teen starts with 100 imaginary credits and independently sets aside 20.
2. Teen requests permission to *discuss and explore* a diversified fund.
3. Parent can approve or decline the practice discussion; the Teen sees the result.
4. Reset restarts the scenario.

There is no network request, API, user account, localStorage, guardian identity, wallet signature, asset holding, interest, trade, grant, Devnet transaction or real-money activity. The credit number is not an account balance. Parent approval is an illustration, not onchain authority.

The component and tests live at:
- `apps/web/src/components/family-agency-preview.tsx`
- `apps/web/src/components/family-agency-preview.test.tsx`

Acceptance tests: saving does not ask Parent, denial remains visible, imaginary credits are bounded, reset works, no `fetch` calls are made. The source must not make legal, income, yield, portfolio or custody promises.

## Next genuine product value (separate reviewed work)

- **P0:** safe Family learning/parent route and isolated session designs; reject legacy backend fallback. Separate role proofs and responsive mobile task tests.
- **P0:** five to eight consenting adult caregiver discovery sessions, no identifiable minor data, no money. Document actual alternatives, willingness to use and failure/uncertainty.
- **P1:** practice ledger with meaningful history, visible outcomes and reasoned refusals; two-device user tasks only when role security and staged runtime are independently verified.
- **P1:** financial concepts ladder (saving, interest as concept, diversification, individual stocks) with parent-friendly risk explanations. Educational illustrations are not earned yield or available stock transactions.
- **P2:** geo/asset/custody eligibility work only after separate legal/security and technical assessment, including any minor-specific rules. No assumption that geo-IP blocking alone is compliance.

## Public evidence rules

Public updates may describe: implementation, passing tests, labeled simulation, interview work only after participants consent, and exact source SHAs. They must NOT claim active customers, guardians verified, live Family API/website, deployed finance, interest earnings, permitted stock trading for minors, legal clearance, real custody, funding or external endorsements.

## Non-negotiable deployment boundaries

Family work remains on independent `family/standalone` line. Public Colosseum Workers `cresco` and `keys-api-stocklana` are frozen. No merge to `main`, no Cloudflare deploy, no Devnet finance activation, and no mainnet release. Release blocker: #95. Next user-journey issue: #98.

**Truth:** SOURCE + LOCAL SIMULATION only until exact-head CI is verified. LIVE NOT DEPLOYED. REAL FAMILY READINESS NO-GO.
