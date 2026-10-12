# CRESCO reconciliation, 2026-10-12 afternoon

Written by Claude. It covers source and state only: no merge, deployment or Devnet transaction was performed. Re-resolve every commit before relying on it.

## Ground truth read from GitHub at 14:20 ET

| Item | Verified state |
| --- | --- |
| `main` HEAD | `43e62df` (merge of PR #37, v0.4 workflow) |
| PR #38 campaign evidence | open, docs/state only |
| PR #39 enforcement truth | open, docs only (`WHO-ENFORCES-WHAT.md`) |
| PR #40 principal-wallet guardian | open, code + tests, **LOCAL**; Phantom validation pending (owner) |
| PR #41 unified entry | open, GitHub CI green (Node, web incl. WebKit) on `77406cf` |
| Cloudflare Pages `cresco-visual-lab` | **fails on every main commit sampled since 2026-10-03**, including `43e62df`, so it was not caused by PR #41. It is a Pages project separate from the Workers the owner deploys (`cresco` frontend, API Worker). The exact cause is only visible in the owner's dashboard (UNKNOWN). Classification: **non-canonical legacy preview**. Recommendation: disconnect it from the repo, or fix it only if Pages is meant to come back. |

## Gaps between code, docs, CI and runtime

1. `state/CURRENT.yaml` on main named `cresco-lac.vercel.app` as the public product, pointed the World's Fair PRD at the old repo, and marked v0.4 as LOCAL after the owner's live 5/5 campaign. This branch corrects those fields. The public runtime is the owner-deployed Worker `cresco.faadil-casecraft.workers.dev`. **Which commit it runs is not bound**: the 5/5 campaign proves the code the owner deployed this morning, not later commits.
2. Green GitHub CI proves source, tests and build. It does not prove the deployed site; no hosted browser check of PR #41 or of this branch exists.
3. The Concept Lock (`docs/worlds-fair/product/CONCEPT-LOCK-2026-10-01.md`) names delegated capital as the initial vertical. On 2026-10-12 the owner decided to present **Family and Delegated capital with equal weight** as two settings of one product. The authority mechanism (standing mandate, soft vs hard boundary, exact one-use exception, no widening) is unchanged. The lock file itself is not edited here; the owner should record that amendment.

## One product: what is unified and what is not

| Layer | Family (v0.4 workspace) | Delegated capital (v0.4 workspace) | Earlier Family app (`/start`, `/parent`) |
| --- | --- | --- | --- |
| Solana program and mandate mechanism | same | same | separate AAPL demo-token lane |
| Identity / session | per-workspace role tokens (operator, principal, risk), kept in this browser | same | `/api/v0.2/auth/demo-session` sessions in localStorage (`child`, `guardian`) |
| State | API Worker Durable Object per workspace | same | separate backend routes |
| Roles | Teen, Parent, Second parent | Operator, Principal, Risk owner | Child, Guardian |

**Decision implemented in this branch (follow-up to PR #41).** Both primary entries on `/` open the same live v0.4 workspace (`/worlds-fair/desk?case=family` or `?case=capital`). The earlier Family app stays reachable and is labeled "separate sign-in, demo lane".

Why:
- Only the v0.4 workspace carries the full live flow: Policy Diff, exact exception, revocation, reconciliation and history.
- Sending Family to the demo lane would make the two settings unequal.

Not done, on purpose:
- No account merge, no token migration, no data migration.
- Converging the legacy sessions into workspace roles needs its own design, with the owner deciding whether the earlier app is retired.

**Owner correction (same evening).** The Family app (`/start`: Key, Learn, Explore, Portfolio, Profile, and `/parent`) is part of the product, not a legacy lane. The home page now sends "Enter Family" to `/start` with "Parent sign-in" beside it. The live family mandate on Solana (`/worlds-fair/desk?case=family`, with the parent's wallet as guardian) is linked from the Family card. Sessions stay separate, as described above.

## Safety properties preserved

- Role tokens stay workspace-scoped and are never placed in public links. Share links carry the token only in the URL fragment, which is scrubbed after import.
- Market evidence (Pyth) can only restrict or refuse. UNKNOWN is never rendered as success.
- MCP operator tools cannot approve, revise policy, pause or revoke.

## Open risks

- **Workspace capacity is 25 in total** (`maxWorkspaces`), and the index is never pruned. External testers each create one, and each bootstrap spends lab Devnet SOL and devUSDC. Check the guardian balance before a test wave.
- **Public runtime binding is unknown** for anything merged after the morning deploy.
- **PR #40 is not LIVE** until the owner's Phantom record is added.
