"""Offline, dependency-free regression checks for project automatic routing hooks."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / ".claude/hooks/cresco_auto_context.py"
spec = importlib.util.spec_from_file_location("cresco_auto_context", SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class AutoActivation(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.TemporaryDirectory()
        self.addCleanup(self.t.cleanup)
        self.root = Path(self.t.name) / "cresco"
        (self.root / "state").mkdir(parents=True)
        (self.root / "product").mkdir(parents=True)
        (self.root / ".git").mkdir()
        (self.root / "product/PRD.md").write_text("World Fair historical baseline")
        (self.root / "state/CURRENT.yaml").write_text(
            "project_id: cresco\nstatus: ACTIVE\nsource_of_truth:\n"
            "  repository: Faadil1/cresco\nlifecycle_state: POST_SLICE_LIVE_PRODUCT\n"
        )

    def invoke(self, cwd, event, prompt="build product"):
        result = subprocess.run(
            [sys.executable, str(SCRIPT)],
            input=json.dumps({"cwd": str(cwd), "hook_event_name": event, "prompt": prompt}),
            text=True, capture_output=True, check=True, timeout=4,
        )
        return json.loads(result.stdout) if result.stdout.strip() else None

    def test_session_start_no_manual_prompt(self):
        got = self.invoke(self.root, "SessionStart", prompt="")
        self.assertEqual("SessionStart", got["hookSpecificOutput"]["hookEventName"])
        c = got["hookSpecificOutput"]["additionalContext"]
        self.assertIn("CRESCO AUTOMATIC", c)
        self.assertIn("Finisher", c)
        self.assertIn("NOT ESTABLISHED", c)
        self.assertIn("NOT build/financial/Finisher authorization", c)

    def test_auto_on_build_prompt(self):
        got = self.invoke(self.root, "UserPromptSubmit", "continue Cresco product build")
        self.assertIsNotNone(got)
        self.assertIn("Devnet", got["hookSpecificOutput"]["additionalContext"])

    def test_short_continuation(self):
        self.assertIsNotNone(self.invoke(self.root, "UserPromptSubmit", "ok allons-y"))

    def test_no_unrelated_prompt(self):
        self.assertIsNone(self.invoke(self.root, "UserPromptSubmit", "bonjour"))

    def test_scope_is_cresco_only(self):
        other = self.root.parent / "NOVA"
        (other / "state").mkdir(parents=True)
        (other / "product").mkdir(parents=True)
        (other / ".git").mkdir()
        (other / "product/PRD.md").write_text("x")
        (other / "state/CURRENT.yaml").write_text("project_id: nova\nsource_of_truth:\n  repository: Faadil1/NOVA\n")
        self.assertIsNone(self.invoke(other, "SessionStart"))

    def test_present_pbpd_state_not_treated_as_proven(self):
        (self.root / ".pbpd/state").mkdir(parents=True)
        (self.root / ".pbpd/state/PROJECT-STATE.yaml").write_text("project_id: cresco\nhandoff_status: NOT_READY\n")
        c = self.invoke(self.root, "SessionStart")["hookSpecificOutput"]["additionalContext"]
        self.assertIn("claims still require actual validator proof", c)
        self.assertNotIn("Local PBPD state missing", c)

    def test_invalid_transport_and_event(self):
        self.assertIsNone(self.invoke(self.root, "PostToolUse"))
        p = subprocess.run([sys.executable, str(SCRIPT)], input="{invalid", capture_output=True, text=True, timeout=4)
        self.assertEqual(p.returncode, 0)
        self.assertFalse(p.stdout.strip())

    def test_settings_have_both_auto_events(self):
        cfg = json.loads((SCRIPT.parents[2] / ".claude/settings.json").read_text())
        self.assertEqual({"SessionStart", "UserPromptSubmit"}, set(cfg["hooks"]))
        for entries in cfg["hooks"].values():
            hook = entries[0]["hooks"][0]
            self.assertEqual("python3", hook["command"])
            self.assertIn("cresco_auto_context.py", hook["args"][0])


if __name__ == "__main__":
    unittest.main()
