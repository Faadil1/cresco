import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // The no-login Family Worker is an independent build target. Its dedicated
  // config tests the real Vite/Cloudflare artifact, not the canonical Next app.
  testIgnore: "family-public-demo.spec.mjs",
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
