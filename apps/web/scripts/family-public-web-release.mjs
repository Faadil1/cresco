/**
 * Prepare a public-only release of the separately built Cresco Family Web.
 *
 * This script does NOT access Cloudflare, deploy, write secrets or change any
 * historical Worker. It leaves the sealed source/built configs untouched and
 * prepares two sibling configs: public activation and emergency lockdown.
 *
 * Run ONLY from the reviewed Family branch after:
 *   cd apps/web && npm ci && npm run build:public-family
 *   node scripts/family-public-web-release.mjs --expected-sha <git-rev-parse-HEAD>
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, "..");
const ROOT = resolve(WEB, "../..");
const SOURCE = join(WEB, "wrangler.family.jsonc");
const BUILT = join(WEB, "dist/server/wrangler.json");
const PUBLIC = join(WEB, "dist/server/wrangler.family-public-release.json");
const CLOSE = join(WEB, "dist/server/wrangler.family-public-close.json");
const BRANCH = "family/public-one-click-practice-2026-10-30";
const TARGET = "cresco-family-web";
const HISTORICAL = ["cresco", "keys-api-stocklana", "cresco-api-stocklana", "cresco-family-api"];

function git(...args) {
  return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).trim();
}

export function validateFamilyPublicRelease(source, built) {
  assert.equal(source.name, TARGET, "WRONG_FAMILY_SOURCE_WORKER");
  assert.equal(built.name, TARGET, "WRONG_BUILT_WORKER");
  assert.equal(source.workers_dev, false, "FAMILY_SOURCE_MUST_REMAIN_SEALED");
  assert.equal(built.workers_dev, false, "FAMILY_BUILD_MUST_REMAIN_SEALED");
  assert.equal(source.preview_urls, false, "FAMILY_SOURCE_PREVIEW_MUST_BE_OFF");
  assert.equal(built.preview_urls, false, "FAMILY_BUILD_PREVIEW_MUST_BE_OFF");
  for (const cfg of [source, built]) {
    assert.ok(!cfg.route && !cfg.routes?.length, "CUSTOM_ROUTES_FORBIDDEN");
    assert.ok(!cfg.zone_id && !cfg.account_id && !cfg.custom_domain, "EMBEDDED_ACCOUNT_OR_ZONE_FORBIDDEN");
    assert.ok(!cfg.durable_objects?.bindings?.length, "STATEFUL_FAMILY_API_FORBIDDEN");
    for (const field of ["services", "kv_namespaces", "d1_databases", "r2_buckets", "queues", "dispatch_namespaces", "hyperdrive"]) {
      assert.ok(!cfg[field] || (Array.isArray(cfg[field]) && cfg[field].length === 0),
        "UNEXPECTED_BACKEND_BINDING: " + field);
    }
    assert.ok(!Object.keys(cfg.vars ?? {}).length, "PUBLIC_DEMO_MUST_NOT_INCLUDE_VARS");
    assert.ok(!HISTORICAL.includes(cfg.name), "HISTORIC_WORKER_TARGET_FORBIDDEN");
  }
  assert.ok(typeof built.main === "string" && built.main.length > 0, "BUNDLED_WORKER_ENTRY_MISSING");
  assert.ok(built.assets?.directory, "FAMILY_STATIC_ASSETS_MISSING");
  const publicConfig = { ...built, workers_dev: true, preview_urls: false };
  const closedConfig = { ...built, workers_dev: false, preview_urls: false };
  assert.equal(publicConfig.name, TARGET);
  assert.equal(closedConfig.name, TARGET);
  return { publicConfig, closedConfig };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--validate-artifact") {
    validateFamilyPublicRelease(
      JSON.parse(readFileSync(SOURCE, "utf8")),
      JSON.parse(readFileSync(BUILT, "utf8"))
    );
    console.log("FAMILY_PUBLIC_RELEASE_ARTIFACT_POLICY=PASS (no files written, no deploy)");
    return;
  }
  if (args.length !== 2 || args[0] !== "--expected-sha" || !/^[0-9a-f]{40}$/.test(args[1])) {
    throw new Error("USAGE: node scripts/family-public-web-release.mjs --expected-sha <40-char-commit-sha>");
  }
  const currentBranch = git("branch", "--show-current");
  assert.equal(currentBranch, BRANCH, "NOT_THE_REVIEWED_FAMILY_BRANCH");
  const sha = git("rev-parse", "HEAD");
  assert.equal(sha, args[1], "SOURCE_HEAD_CHANGED_REBUILD_AND_REVIEW");
  assert.equal(git("status", "--porcelain"), "", "UNCOMMITTED_FILES_REVIEW_FIRST");

  // Independent canonical boundary check, including frozen historic configs.
  execFileSync(process.execPath, [join(ROOT, "scripts/family-release-boundary.mjs"), "--built-web"], {
    cwd: ROOT, stdio: "inherit"
  });
  const source = JSON.parse(readFileSync(SOURCE, "utf8"));
  const built = JSON.parse(readFileSync(BUILT, "utf8"));
  const { publicConfig, closedConfig } = validateFamilyPublicRelease(source, built);

  // Written beside the generated Wrangler config: its relative bundle paths
  // remain identical. Neither generated sibling is a tracked source file.
  writeFileSync(PUBLIC, JSON.stringify(publicConfig, null, 2) + "\n", { flag: "w" });
  writeFileSync(CLOSE, JSON.stringify(closedConfig, null, 2) + "\n", { flag: "w" });
  console.log(JSON.stringify({
    verdict: "PUBLIC_RELEASE_CONFIG_PREPARED_NOT_DEPLOYED",
    source_sha: sha,
    target: TARGET,
    api_worker_deployed: false,
    historic_workers_changed: false,
    activation_config: "dist/server/wrangler.family-public-release.json",
    lockdown_config: "dist/server/wrangler.family-public-close.json",
    next_steps: [
      "Confirm the intended Cloudflare account and that cresco-family-web is not already installed.",
      "Authenticate privately with npx wrangler login (never paste a token in chat).",
      "From apps/web: npx wrangler deploy --config dist/server/wrangler.family-public-release.json",
      "Verify the URL Wrangler actually prints: GET / and /try = 200; historical routes = 404.",
      "To disable public access: npx wrangler deploy --config dist/server/wrangler.family-public-close.json"
    ]
  }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); }
  catch (error) {
    console.error("CRESCO_FAMILY_PUBLIC_ACTIVATION_BLOCKED: " + error.message);
    process.exitCode = 1;
  }
}
