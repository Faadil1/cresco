#!/usr/bin/env python3
"""Read-only Claude Code auto-context for the existing Cresco source workstream.

SessionStart and UserPromptSubmit deliver context, never authority or build approval.
No network, subprocess mutation, dependency installs, or filesystem writes.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

EXPECTED_REPO = "Faadil1/cresco"
EXPECTED_PROJECT = "cresco"
MAX_CWD_DEPTH = 8
MAX_STATE_BYTES = 140_000


def field(text: str, name: str) -> str:
    """Read one plain scalar from current canonical state without needing PyYAML."""
    match = re.search(r"(?m)^" + re.escape(name) + r"\s*:\s*([^\n]+)", text)
    if not match:
        return "UNKNOWN"
    value = match.group(1).split(" #", 1)[0].strip().strip("'\"")
    return value if value and value.lower() not in {"null", "~"} else "UNKNOWN"


def find_root(cwd: str) -> Path | None:
    if not isinstance(cwd, str) or not cwd.strip():
        return None
    try:
        p = Path(cwd).resolve(strict=True)
    except (OSError, ValueError, RuntimeError):
        return None
    for candidate in [p, *p.parents][:MAX_CWD_DEPTH]:
        if not (candidate / "state/CURRENT.yaml").is_file():
            continue
        if not (candidate / "product/PRD.md").is_file():
            continue
        if not (candidate / ".git").exists():
            continue
        try:
            state = (candidate / "state/CURRENT.yaml")
            if state.stat().st_size > MAX_STATE_BYTES:
                continue
            raw = state.read_text(encoding="utf-8")
        except (OSError, UnicodeError):
            continue
        if field(raw, "project_id") != EXPECTED_PROJECT or EXPECTED_REPO not in raw:
            continue
        return candidate
    return None


def head(root: Path) -> str:
    try:
        r = subprocess.run(
            ["git", "-C", str(root), "rev-parse", "--verify", "HEAD"],
            capture_output=True, text=True, check=False, timeout=2,
            env={"PATH": os.environ.get("PATH", "/usr/bin:/bin"),
                 "GIT_OPTIONAL_LOCKS": "0", "GIT_CONFIG_NOSYSTEM": "1"},
        )
    except (OSError, subprocess.SubprocessError):
        return "NOT_VERIFIED"
    sha = r.stdout.strip()
    return sha if r.returncode == 0 and re.fullmatch(r"[a-f0-9]{40}", sha) else "NOT_VERIFIED"


def create_context(root: Path) -> str:
    raw = (root / "state/CURRENT.yaml").read_text(encoding="utf-8")
    state_stage = field(raw, "lifecycle_state")
    status = field(raw, "status")
    sha = head(root)
    pbpd_state_present = (root / ".pbpd/state/PROJECT-STATE.yaml").is_file()
    pbpd_note = ("Local PBPD project state exists: its claims still require actual validator proof, no readiness inferred."
                 if pbpd_state_present else
                 "Local PBPD state missing: Builder readiness is NOT ESTABLISHED; reconcile the real PRD/capability map before CORE-18/19.")
    return "\n".join([
        "CRESCO AUTOMATIC PROJECT CONTEXT — read-only project routing, NOT build/financial/Finisher authorization.",
        f"Repository: {EXPECTED_REPO}; checked-out HEAD: {sha}; project state: {status} / {state_stage}.",
        "Source of truth: state/CURRENT.yaml → state/HANDOVER.yaml → docs/worlds-fair/product/PRD.md → product/PRD.md (historical baseline).",
        "Current state files may refer to an earlier SHA; reconcile material differences without overwriting retained work or proofs.",
        "Existing Canon → PBPD → Finisher workflow is selected AUTOMATICALLY for this repository:"
        " CANON (QUALIFY→DECIDE→DESIGN→DELIVER→AUDIT→EXPAND; conditional gateway register),"
        " then PBPD (essential product capability, user action→persisted state→consequence; negative/recovery),"
        " then Finisher (independent audit only AFTER real Builder readiness and a receiver-verified handoff).",
        "Priority from Cresco's existing handover: product exploitation and real operator/principal workflow;"
        " do not substitute demo packaging, seeded replays, CI checks, or receipts for functional user journeys.",
        "Maintain the Solana boundary: Devnet ≠ Mainnet; standing authority ≠ one-time exception;"
        " a submitted transaction ≠ settlement; stale/unknown ≠ approved. Preserve explicit refusal and replay controls.",
        "Financial writes, live workflows, provider sends, deployments, public releases and human approvals"
        " remain protected: no automatic trigger, no credential invention, no self-approval.",
        pbpd_note,
        "Finisher's current independent trust root is default-deny until externally configured."
        " Use it for review/preflight when applicable; never represent CI-green as signed intake or COMPLETE.",
        "This hook reads only. Installed PBPD plugin hooks still control material tool actions; never bypass them.",
    ])


def main() -> int:
    try:
        event = json.load(sys.stdin)
    except (ValueError, UnicodeError):
        return 0
    if not isinstance(event, dict):
        return 0
    which = event.get("hook_event_name")
    if which not in {"SessionStart", "UserPromptSubmit"}:
        return 0
    root = find_root(event.get("cwd", ""))
    if root is None:
        return 0
    if which == "UserPromptSubmit":
        prompt = str(event.get("prompt") or "").strip().lower()
        # Avoid injecting product routing into an unrelated chat turn.
        if not (prompt in {"ok", "oui", "next", "continue", "on continue", "ok allons y", "ok allons-y", "allons y", "allons-y"}
                or re.search(r"\b(cresco|build|produit|product|repo|develop|développ|implément|implement|code|tests?|feature|fonctionnalit|continue|reprise|workstream|priorit|workflow|intégr|integrat|gate|finisher|pbpd)\w*\b", prompt)):
            return 0
    try:
        context = create_context(root)
    except (OSError, UnicodeError, ValueError):
        return 0
    print(json.dumps({"continue": True, "suppressOutput": True, "hookSpecificOutput": {
        "hookEventName": which, "additionalContext": context}}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
