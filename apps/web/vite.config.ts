import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

// Build stamp: the exact commit this bundle was built from, so the public
// runtime can be bound to a commit by looking at the page. Workers Builds
// sets WORKERS_CI_COMMIT_SHA; GitHub Actions sets GITHUB_SHA.
function buildSha() {
  const fromEnv = process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA;
  if (fromEnv) return fromEnv;
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
}
process.env.NEXT_PUBLIC_CRESCO_BUILD_SHA ||= buildSha();

// The Colosseum Worker "cresco" is NEVER the target of a Family build.
// Missing or historic API origin must fail at build time, not fall back to the
// submitted stocklana API. This branch does not deploy anything.
const familyBuild = process.env.CRESCO_FAMILY_BUILD === "1";
if (familyBuild) {
  const origin = process.env.NEXT_PUBLIC_CRESCO_API_URL ?? "";
  if (!/^https:\/\/cresco-family-api\.[-a-z0-9.]+$/i.test(origin)) {
    throw new Error("FAMILY_BUILD_REQUIRES_DEDICATED_API_ORIGIN");
  }
  process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY = "1";
  process.env.NEXT_PUBLIC_CRESCO_FAMILY_SETUP_ONLY = "1";
}

export default defineConfig({
  define: {
    "process.env.NEXT_PUBLIC_CRESCO_BUILD_SHA": JSON.stringify(process.env.NEXT_PUBLIC_CRESCO_BUILD_SHA),
    "process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY": JSON.stringify(familyBuild ? "1" : "0"),
    "process.env.NEXT_PUBLIC_CRESCO_FAMILY_SETUP_ONLY": JSON.stringify(familyBuild ? "1" : "0"),
    "process.env.NEXT_PUBLIC_CRESCO_API_URL": JSON.stringify(familyBuild ? process.env.NEXT_PUBLIC_CRESCO_API_URL : process.env.NEXT_PUBLIC_CRESCO_API_URL ?? ""),
  },
  resolve: {
    alias: {
      // @solana/web3.js (loaded on demand in the browser to sign guardian
      // transactions) depends on rpc-websockets, which only exports "browser"
      // and "node" conditions. Worker builds have neither: use the browser build.
      "rpc-websockets": fileURLToPath(new URL("./node_modules/rpc-websockets/dist/index.browser.mjs", import.meta.url)),
    },
  },
  plugins: [
    vinext(),
    cloudflare({
      configPath: familyBuild ? "./wrangler.family.jsonc" : "./wrangler.jsonc",
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
