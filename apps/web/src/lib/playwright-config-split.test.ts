import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import canonical from "../../playwright.config.mjs";
import family from "../../playwright.family-public.config.mjs";
import { FAMILY_WORKER_SPECS } from "../../e2e/family-worker-specs.mjs";

// Regression guard for PR #127: family-redesign.spec.mjs ran against the
// canonical Next app (which closes /try/*) because it was missing from a
// hand-maintained ignore list.
describe("Playwright config split between the canonical app and the Family Worker", () => {
  const ignored = new Set((canonical.testIgnore as string[]) ?? []);
  const familySpecs = new Set((family.projects ?? []).flatMap(project => project.testMatch as string[]));

  it("every spec run against the Family Worker is excluded from the canonical config", () => {
    for (const spec of familySpecs) expect(ignored.has(spec), spec).toBe(true);
    expect([...familySpecs].sort()).toEqual([...FAMILY_WORKER_SPECS].sort());
  });

  it("every spec that waits for the Family app's hydration marker is a Family Worker spec", async () => {
    const dir = resolve(__dirname, "../../e2e");
    const { readFileSync } = await import("node:fs");
    for (const file of readdirSync(dir).filter(name => name.endsWith(".spec.mjs"))) {
      if (readFileSync(resolve(dir, file), "utf8").includes("waitForFamilyReady")) expect(familySpecs.has(file), file).toBe(true);
    }
  });
});
