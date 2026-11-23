// Specs that exercise ONLY the isolated Family Worker build (Vite/Cloudflare
// artifact with NEXT_PUBLIC_CRESCO_FAMILY_ONLY=1, served by local Wrangler).
// The canonical Next app intentionally closes /try/*, so these specs must never
// run under playwright.config.mjs. Both configs import this single list;
// src/lib/playwright-config-split.test.ts fails if a Family spec is added to one
// config and forgotten in the other.
export const FAMILY_WORKER_MOBILE_SPECS = [
  "family-public-demo.spec.mjs",
  "family-story-journey.spec.mjs",
  "family-real-world.spec.mjs",
  "family-redesign.spec.mjs",
];
export const FAMILY_WORKER_DESKTOP_SPECS = [
  "family-story-journey.spec.mjs",
  "family-real-world.spec.mjs",
  "family-redesign.spec.mjs",
];
export const FAMILY_WORKER_SPECS = [...new Set([...FAMILY_WORKER_MOBILE_SPECS, ...FAMILY_WORKER_DESKTOP_SPECS])];
