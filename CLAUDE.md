# Cresco — automatic Canon → PBPD → Finisher routing

Scope: **`Faadil1/cresco`** (active Cresco source repo / World's Fair workstream). Claude Code loads this file when the repository is opened. `Faadil1/cresco-key` is a **distinct** mobile product and is not automatically redefined here. Do not touch NOVA or PERTAIN for this integration.

## On each build or continuation

1. **Canon automatically selected for project context** — read `state/CURRENT.yaml`, then `state/HANDOVER.yaml`, the actual workstream reconciliation and `docs/worlds-fair/product/PRD.md`. `product/PRD.md` is the historical family baseline, **not** a replacement for the World's Fair living PRD. Resolve the current git HEAD and drift with state pointers; don't silently rewrite state or pins.
2. **PBPD automatically selected for material product development** — retain the whole product, progress through `QUALIFY → DECIDE → DESIGN → DELIVER → AUDIT → EXPAND`, and honor every *applicable* canonical conditional gate (`ACTIVE / N/A / BLOCKED / PROVEN`). Product Depth & Live Reality and negative-path/recovery are material. First slice and CI-green are not finished product. Prefer remaining real operator/principal workflow and exploitation gaps over demo, deck, replay or receipt polish; don't invent capability completion.
3. **Finisher automatically becomes eligible only after a real PBPD Builder verdict and received handoff.** `BUILD_CANDIDATE_READY` is not `PROJECT_COMPLETE`; the receiver must independently recheck the exact candidate, approved contract and material product evidence. If its operator trust root or signature is unavailable, classify `FINISHER_INTAKE_BLOCKED` but continue authorized normal development. Never self-issue, forge or disable independent authority; do not automatically run terminal promotion.

## Built-in automatic activation

`.claude/settings.json` wires **read-only** `SessionStart` and `UserPromptSubmit` hooks at `.claude/hooks/cresco_auto_context.py`. These emit a current, project-scoped snapshot without external services, code edits or permission grants. They complement (do not replace) the installed PBPD plugin's existing `UserPromptSubmit` and `PreToolUse` hooks. Never bypass protected-mutation guards.

## Cresco product truth / financial boundaries

- Source of truth: `state/CURRENT.yaml`, `state/HANDOVER.yaml`, `docs/worlds-fair/product/PRD.md`, committed implementation and real evidence. Unmerged PRs remain distinct.
- Solana **Devnet** is not Mainnet or real securities; hosted URL ≠ latest code until exact runtime SHA and full path are verified. Financial or provider effects, deploys and protected workflows remain explicitly owner-authorized, with UNKNOWN outcomes quarantined.
- Keep standing authority, one-use exception, actual transaction confirmation and settlement separate. Test refusal, staleness, idempotency/replay, post-write reconciliation and recovery.
- Do not auto-launch live work, Cloudflare/Vercel deployments, Devnet state-changing workflows, GitHub merges, financial transfers, publication or submissions. Routing context is *not* human authority or a signature.
- If `.pbpd/state/PROJECT-STATE.yaml` is absent, begin with **truthful capability mapping and existing PRD reconciliation**; never invent a READY handoff just to get Finisher green. Preserve all gates, PRDs and source files additively.

**Expected visible behavior:** each new Cresco Claude Code session receives automatic project context, and relevant build prompts/continuations receive refreshed routing. Report actual capability/evidence progress, not hypothetical `COMPLETE`. To inspect instructions use `/context`; to inspect hooks use `/hooks`.
