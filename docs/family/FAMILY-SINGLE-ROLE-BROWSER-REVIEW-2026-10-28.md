# Family single-role browser isolation — independent source review

Date: 2026-10-28
Status: draft candidate, no merge, no hosted deploy, no real Devnet execution.

## Finding

The previous workflow desk persisted **all three role bearer tokens** after Family workspace creation and merged any imported role-link token with an existing role in the same browser. The Family welcome bridge did block Teen access if a Parent token remained stored, but an alternate direct path to `/worlds-fair/desk` showed all available role tabs. That meant the separate-person role boundary was only a navigation convention, not consistently represented in browser capabilities.

This was identified in source while reviewing draft PR #88. It is **not** a verified external exploit and is not evidence of compromised accounts.

## Fix

1. A newly created **Family** workspace keeps all three links in a transient one-time handoff, but persists **only the principal/Parent** token for the creator's browser. The second-parent and Teen links are distributed to separate browser profiles.
2. Importing a role link now **replaces** the local role capability rather than merging it with an existing role, regardless of the context; any prior session needs a fresh share link to resume.
3. On opening an **older Family** workspace with multiple saved roles, the UI narrows its saved keychain to one role (principal > risk > operator) *before rendering controls*; it removes other role tokens from this browser's localStorage. The capital demonstration workspace intentionally retains its older same-browser multi-role behavior, which is not appropriate for Family production usage.
4. The handoff explicitly says a bearer role is **not real-world identity verification**. This implementation does not authenticate a child's age or a legal guardian's authority.
5. The share-link fragment is scrubbed immediately after parsing. The route query is preserved, and role tokens are not transferred into URL query parameters.
6. No API authority, wallet signer, policy, onchain program, transaction logic or live environment is changed.

## Negative and compatibility contract

- New Family creator: only Parent token remains persisted; transient one-time handoff still shows three links.
- Existing multi-role Family workspace: Parent-only on migration; cannot switch to Teen or second-parent tab in the same browser.
- Imported Teen link after Parent session: old Parent token is **replaced**; never combined.
- Capital lab retains its documented multi-role demo behavior when creating a fresh capital workspace.
- No role stored means no private workspace read; access can be resumed through a legitimate dedicated role link.
- The browser cannot distinguish family members merely by possessing a bearer link. Shared device exposure, browser extensions, XSS, accidental clipboard disclosure, screenshot/recording, stolen/replayed role links and lack of cryptographic guardian identity remain **unresolved** for production.
- The initial one-time handoff stores all role links in React memory until dismissal. Protect this screen from shoulder surfing and do not describe the handoff as independently secured parental access.

## Evidence gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Source role-combination review | OBSERVED | Direct desk and share import source |
| Family local role separation | CI CANDIDATE | Unit + mobile WebKit tests on exact commit |
| Legacy Family multi-role migration | CI CANDIDATE | Unit regression and dedicated service test |
| Server private read authorization | SOURCE + CI | PR #86 and #88, not deployed |
| Real person vs bearer proof | BLOCKED | Product requirements and identity/guardian verification |
| Shared device hardening and token leakage | BLOCKED | Security review and prototype/host controls |
| Live Devnet multi-device outcome/replay | BLOCKED | Owner-authorized run |
| Public release | BLOCKED | Exact SHA binding, independent review, consent and operational readiness |

Related draft PRs: #81 through #88, with #85 -> #86 -> #88 as the integrated security branch. Keep this change on a new draft PR stacked on #88. No merge, no public deploy, no onchain writes.
