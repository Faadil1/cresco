# Cresco v0.4: complete workspace GET surface authorization audit

**Status:** Source candidate for review, stacked on PR #86; not merged/deployed/Devnet reverified.

## Finding and product impact

Source in `src/worlds-fair-workflow-http.mjs` exposed role-dependent information via `GET /workspaces/{id}` (workspace name, role labels, policy and chain state), `GET /mandate` (amount limits, consumption, chain accounts), and `GET /principal/wallet-message` (principal signing challenge) without authentication. PR #86 already introduced bearer checks on requests, history and approval messages. This change closes the three remaining workspace reads identified in issue #87.

A **workspace ID is a locator, not authorization**. Solana account addresses may be discoverable publicly onchain, but the private association between accounts, family labels, allowances and operational history should not be exposed by this app's server API.

## Enumerated v0.4 GET routes

| Route | Required role after this patch | Response scope |
| --- | --- | --- |
| /openapi | Public | Interface schema only, no workspace data |
| /workspaces/{id} | operator / principal / risk for **that workspace** | Workspace metadata and role labels |
| /workspaces/{id}/whoami | matching workspace role | Role identification only |
| /workspaces/{id}/intents/safety | matching workspace role | Held intent/reconciliation state |
| /workspaces/{id}/requests | matching workspace role | Requests in this workspace |
| /workspaces/{id}/requests/{rid}/approval-message | principal only | Exact message for one request |
| /workspaces/{id}/principal/wallet-message | principal only | Wallet binding signing message |
| /workspaces/{id}/mandate | matching workspace role | Mandate, limits, consumption and chain accounts |
| /workspaces/{id}/history | matching workspace role | Workspace events and transaction signatures |
| /workspaces/{id}/notifications | matching workspace role | Role-filtered event stream |

New checks use the existing server `authorize(ws, token, allowed)` or `whoami` mechanism and match a token against a **single workspace's hashed credentials**. No new JWT, URL tokens, identity migration or new financial authority.

## Integration consequences

- `getWorkspace`, `mandate` and `walletMessage` browser client calls now require explicit bearer parameters.
- Parent/Teen bridge verifies `whoami` before reading private workspace metadata. A shared browser holding parental tokens does not make a Teen read.
- Desk initial loads and reconciliation attach the current workspace role token. Principal wallet-message requests use principal bearer.
- Root HTTP, OpenAPI, workflow and Web Vitest cases exercise unauthenticated, cross-workspace and role-specific denial; browser tests remain mocked API, not real deployment.
- **Compatibility change:** clients using anonymous GET workspace/mandate must update. Do not deploy the backend ahead of compatible clients without a migration/rollout check.

## Conditional gate register

| Gate | State | Evidence |
| --- | --- | --- |
| GET route inventory | SOURCE VERIFIED | v0.4 router enumeration |
| Anonymous and foreign workspace read denial | TEST CANDIDATE | HTTP tests / CI |
| Parent wallet challenge isolation | TEST CANDIDATE | principal-only tests |
| Role-verified Family bridge | TEST CANDIDATE | source and Web tests |
| Devnet trade UNKNOWN safety | DEPENDS | PR #85, exact chain proof still pending |
| Host cache headers and CORS | SOURCE REVIEW REQUIRED | review Cloudflare worker, CDN and edge |
| Credential leakage and session lifecycle | SECURITY REVIEW REQUIRED | browser storage, private fragment, logs |
| Independent security approval | BLOCKED | separate reviewer |
| Full multi-device live Devnet proof | BLOCKED | owner-authorized run and receipts |
| Current hosted runtime/commit binding | BLOCKED | owner-authorized deployment and SHA |
| External Family feedback / WTP | BLOCKED | consented research |

This patch **does not imply production identity verification** (parental status, age, legal guardianship), custody, real-money brokerage or Solana mainnet support. Keep all dependent PRs in draft and do not publish without independent review and explicit deployment authorization.
