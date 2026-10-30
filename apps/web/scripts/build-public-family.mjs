/**
 * Cross-platform build of the public, browser-only Cresco Family Web Worker.
 * Works from Windows PowerShell/cmd as well as macOS/Linux. No deployment.
 */
import { execFileSync } from "node:child_process";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = {
  ...process.env,
  CRESCO_FAMILY_BUILD: "1",
  CRESCO_FAMILY_PUBLIC_DEMO: "1",
  NEXT_PUBLIC_CRESCO_API_URL: "",
};

if (process.env.NEXT_PUBLIC_CRESCO_API_URL) {
  console.error("PUBLIC_FAMILY_BUILD_BLOCKED: unset NEXT_PUBLIC_CRESCO_API_URL before building");
  process.exit(1);
}

for (const script of [
  [join(webRoot, "node_modules/vite/bin/vite.js"), "build"],
  [join(webRoot, "scripts/assert-family-public-build.mjs")],
]) {
  execFileSync(process.execPath, script, { cwd: webRoot, env, stdio: "inherit" });
}
