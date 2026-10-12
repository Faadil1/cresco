# CRESCO — one product, two settings (integration handoff)

Date: 2026-10-12  
Status: **SOURCE CHANGE / PR ONLY** until merged, deployed, and checked in the browser.

## Product boundary

CRESCO is the product. Family and Delegated capital are contexts within CRESCO, not separate brands, applications, or competing authoritative engines. The World's Fair desk is a **workspace surface** within the same product, not another product. The technical seven-scenario lab is evidence, not the primary experience.

The on-chain mandate/asset-rule/exact one-use exception and fail-closed semantics stay identical across workspace use cases. User-facing labels and the roles differ. No proof receipt should be mistaken for product adoption.

## Source navigation contract in this PR

- `/` — common CRESCO product entry, with Family and Delegated capital choices.
- `/start` — existing consumer Family onboarding (kept reachable, not silently migrated).
- `/parent/sign-in` — existing guardian sign-in.
- `/worlds-fair/desk` — shared workspace surface, supports Family and Delegated capital presentations under API v0.4.
- `/worlds-fair` — technical proof lab, explicitly secondary.
- Desk has a visible link back to `/`, without clearing workspace role tokens. The existing separate `Leave workspace` action is unchanged.

All paths are in `Faadil1/cresco/apps/web`, not separate deployments or repositories. The canonical public-host/deploy binding must be confirmed after merging; a source route alone is **not** a live-public proof.

## Important non-equivalences / limits

- **Shared Solana program != unified identity.** The older Family consumer sessions and the workspace role-token system are still separate application pathways. This PR does not merge credentials, sessions, users, legacy Family persistence or wallets.
- Do not cross-authorize a Family user into a delegated-capital workspace, or reuse bearer tokens between roles. Role links contain a fragment token; do not copy or publish them in research forms or screenshots.
- Shared navigation != demonstrated cross-context state migration. No migration is implemented or claimed.
- The principal-wallet / Phantom work remains in Claude's separate PR; no wallet mode or Solana transactions are changed in this branch.
- No new mainnet, custody, KYC, client assets or WTP claims.
- UI design improvements, shared design-shell refactoring and deeper operator onboarding are follow-up work for Claude. Preserve the product identity and this routing contract.

## Quality gate and external testing

1. Source browser check: mobile-sized home shows both use cases; Family and Parent links remain; Delegated capital opens `/worlds-fair/desk`; desk returns to common home; no horizontal overflow.
2. Source tests are **not** live deployed evidence. Verify CI (typecheck, lint, unit and browser) and then inspect the deployed URLs before declaring PASS.
3. For external testers, use **CRESCO** as the name and the canonical deployed unified home only after verifying it. Test comprehension and availability without wallet operations. Log `COMPLETED_INDEPENDENTLY`, `WITH_HELP`, `BLOCKED`, or `UNAVAILABLE` separately.
4. Phantom opt-in live signing belongs to the owner-led validation, not the anonymous-test campaign.
5. Never copy the internal example workspace role links into a public survey.

## Required next owner / acceptance

Claude (UI/UX and product-depth follow-up): verify the common landing, revisit navigation and clarity, reconcile existing consumer Family onboarding vs v0.4 Family workspace, then decide whether a true single-session identity/shell migration is justified. Preserve the deployed v0.4 workflow and security invariants.

Promotion requires explicit merge/deploy authorization and a fresh live browser check. No automatic merge or deploy from this document.
