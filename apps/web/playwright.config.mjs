import { defineConfig } from "@playwright/test";
import { FAMILY_WORKER_SPECS } from "./e2e/family-worker-specs.mjs";

export default defineConfig({
  testDir: "./e2e",
  // The no-login Family Worker is an independent build target. Its dedicated
  // config tests the real Vite/Cloudflare artifact, not the canonical Next app.
  // Both Family-only suites require NEXT_PUBLIC_CRESCO_FAMILY_ONLY=1 and
  // the separate sealed Cloudflare build. They are fully exercised by
  // playwright.family-public.config.mjs (iPhone WebKit + desktop Chromium).
  // The canonical Next app must not expose /try/*; don't accidentally test
  // Family-only pages against its intentionally closed routes.
  // Single shared list (e2e/family-worker-specs.mjs), so a new Family spec
  // cannot silently run here against the canonical app again (PR #127 CI).
  testIgnore: [...FAMILY_WORKER_SPECS, "family-ready.mjs", "family-worker-specs.mjs"],
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "webkit", use: { browserName: "webkit" } }],
  webServer: {
    command: "npm run start -- -H 127.0.0.1 -p 3000",
    url: "http://127.0.0.1:3000/start",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
