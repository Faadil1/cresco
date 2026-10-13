import type { NextConfig } from "next";
import { execSync } from "node:child_process";


function buildSha() {
  const fromEnv = process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA;
  if (fromEnv) return fromEnv;
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_CRESCO_BUILD_SHA: process.env.NEXT_PUBLIC_CRESCO_BUILD_SHA || buildSha() },
  typescript: {
    // App code only. Tests (including the parity test that imports the root
    // backend module) are typechecked by `npm run typecheck`, which runs with
    // the full repository present. Standalone deploys upload only apps/web.
    tsconfigPath: "tsconfig.build.json",
  },
};

export default nextConfig;
