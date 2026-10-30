import { defineConfig, devices } from "@playwright/test";

// Exercise the exact Cloudflare/Vite Family artifact via local Wrangler.
// No remote Cloudflare deployment, external API or invitation is needed.
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
    command: "npm run start:vinext -- --ip 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/try",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
