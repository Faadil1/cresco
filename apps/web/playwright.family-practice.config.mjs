import { defineConfig, devices } from "@playwright/test";

// Dedicated research rehearsal. This test launches a locally built Family app
// with a fully intercepted API: no deployed Worker, Devnet or financial action.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "family-practice.spec.mjs",
  timeout: 45_000,
  retries: 0,
  use: {
    ...devices["iPhone 13"],
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "family-webkit-mock", use: { browserName: "webkit" } }],
  webServer: {
    command: "npm run start -- -H 127.0.0.1 -p 3100",
    url: "http://127.0.0.1:3100/family-practice",
    reuseExistingServer: false,
    timeout: 90_000,
  },
});
