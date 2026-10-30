import { defineConfig, devices } from "@playwright/test";

// Public Family demo: no API, no invitation, no login, no deployments.
// This only checks a locally built Family-only website.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "family-public-demo.spec.mjs",
  timeout: 45_000,
  retries: 0,
  use: {
    ...devices["iPhone 13"],
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "public-family-webkit", use: { browserName: "webkit" } }],
  webServer: {
    command: "npm run start -- -H 127.0.0.1 -p 3100",
    url: "http://127.0.0.1:3100/try",
    reuseExistingServer: false,
    timeout: 90_000,
  },
});
