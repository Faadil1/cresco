# Cresco Family — safe continuity from practice to Devnet mandate

**Status:** SOURCE CANDIDATE / PR-ONLY / NO PUBLIC DEPLOY. This file is a review contract, not a new authority plane or user-validation report.

## Observed source problem

- `/start` and `/parent/sign-in` asked for email addresses but used `auth.signInDemo()` without actually sending, verifying, authenticating or persisting those addresses. Making email mandatory created false expectations of identity.
- The Family learning app (`/start`, `/home`, `/parent`) uses v0.2 demo sessions; the live Family mandate workflow (`/worlds-fair/desk?case=family`) uses **separate** v0.4 workspace-specific bearer roles and Devnet state. The two systems never shared authentication.
- The existing desk keychain stores **only one workspace** per browser. An earlier delegated-capital workspace remains active even if the URL query says `case=family`. A blind "Open Family" link could lead to the wrong context.
- On the same device, workspace creation stores all role tokens; a child arriving from a demo session can otherwise find parent approval controls if the browser holds their bearer token. No v0.2 role is proof of v0.4 authority.

## Scope implemented

1. Remove unused email collection and email-based gating from the two demo sign-in pages while retaining real temporary demo-session creation, role gating and navigation.
2. Introduce the **read-only Family Workspace Entry** on the teen onboarding/home and parent demo sign-in/dashboard.
3. Read the existing keychain and verify the workspace **from the server** (`GET /workspaces/:id`). Refuse Family continuity if the server reports a capital context or omits `useCase`.
4. Before enabling a resume link, verify the role with `GET /whoami` and check matching workspaceId; a saved bearer string alone is not a verified connection.
5. In Teen mode, withhold the resume link if the same browser stores principal/risk roles. Tell the family to use a private Teen-only role link in another profile/device. Missing role and API failure both fail closed.
6. Parents with no existing workspace may open the existing Family Devnet desk. Teens without an operator-only role are directed to ask for a private role link, not to create a parent-authorized mandate.
7. No role tokens, wallet secrets, parent/child identities, balances or approval data are passed in navigation links, displayed or written to logs.

## Evidence and gates

| Gate | State at creation | Requirement |
| --- | --- | --- |
| Existing Family and v0.4 workspace sessions remain separated | SOURCE PROVEN | No session, wallet or token migration |
| Client/server context and role checks | LOCAL CANDIDATE | Typecheck, Vitest and browser CI for exact commit |
| Parent/Teen handoff UX | LOCAL CANDIDATE | Mobile and desktop user task tests, not only mocks |
| Honest onboarding with no fake email | SOURCE CANDIDATE | Confirm v0.2 demo sign-in still works without a real email |
| Real public Cloudflare runtime bound to this change | BLOCKED | Owner-authorized merge/deploy and exact version verification |
| Real family user first-value/repeat need | BLOCKED | Consented external observations under Early Access PR #80 |
| Safe multiple simultaneous workspaces / unified sessions | NOT IMPLEMENTED | New design with explicit owner review and token migration strategy |

## Safety and limitations

- User messages call the second surface **Devnet-only with demo assets**, not an actual brokerage account, custody, real parent identity verification or real securities.
- The single-workspace-per-browser limitation remains until a separately reviewed multi-workspace selector is developed. Do **not** overwrite or clear the existing keychain to create the Family context.
- "Verified role" means the stored bearer token was accepted for its role **in that workspace at read time**, not a verified real-world parent or adolescent identity.
- The Family practice learning state and the onchain mandate state remain disconnected, explicitly and visibly. The bridge is read-only and cannot approve, spend, widen the Key, transfer tokens or create a workspace by itself.
- Public test/proof claims require current hosted build version and actual task evidence; passing CI does not prove a production environment.
- No changes to V1 draft security PRs #77–79, incident-handling PR #81, Early Access PR #80, protected release workflows, Colosseum submission, Solana program IDs or onchain code.

## Next functional-depth workstream

A secure **multi-workspace picker and role separation model**, with explicit preservation of existing bearer capabilities, device-handoff consent and the ability to resume Family and Delegated Capital independently. This is not a naive merger of the old v0.2 demo login with the v0.4 authority model. It needs recovery/rotation for lost role tokens and security review. Follow with user-observed journey fixes, same-task retests and safe Devnet evidence.
