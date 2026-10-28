import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Must be run immediately after an isolated Family Vite build, BEFORE any
// manual Cloudflare authentication or deployment attempt.
const output = resolve("dist/server/wrangler.json");
let configuration;
try {
  configuration = JSON.parse(readFileSync(output, "utf8"));
} catch {
  throw new Error("FAMILY_BUILD_CONFIG_MISSING: no generated Wrangler output");
}
if (configuration.name !== "cresco-family-web") {
  throw new Error(`FAMILY_BUILD_WRONG_WORKER: generated ${String(configuration.name)} instead of cresco-family-web`);
}
const origin = process.env.NEXT_PUBLIC_CRESCO_API_URL ?? "";
if (!/^https:\/\/cresco-family-api\.[-a-z0-9.]+$/i.test(origin)) {
  throw new Error("FAMILY_BUILD_UNSAFE_API: dedicated Family API origin required");
}
console.log(JSON.stringify({
  worker: configuration.name, apiOrigin: origin,
  separateFromColosseum: true, uploaded: false, deployed: false,
  verified: "build-artifact-config-only"
}, null, 2));
