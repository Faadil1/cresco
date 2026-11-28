import { defineConfig, devices } from "@playwright/test";
import { FAMILY_WORKER_DESKTOP_SPECS, FAMILY_WORKER_MOBILE_SPECS } from "./e2e/family-worker-specs.mjs";

// Exercise the exact Cloudflare/Vite Family artifact via local Wrangler.
// No remote Cloudflare deployment, external API or invitation is needed.
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [
    {
      name: "public-family-webkit",
      testMatch: FAMILY_WORKER_MOBILE_SPECS,
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
    {
      name: "public-family-desktop",
      testMatch: FAMILY_WORKER_DESKTOP_SPECS,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 }, browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run start:vinext -- --ip 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/try",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
