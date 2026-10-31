/**
 * Release preparation for PR #117 on the EXISTING dedicated test Worker
 * `cresco-family-open-test-web` only.
 *
 * It never deploys, never rolls back and never writes to Cloudflare. The #115
 * generator stays pinned to 878fad8 and is not reused or bypassed. Modes:
 *   --validate-only        provenance, boundary and config policy; writes nothing
 *   --prepare-local-config writes ignored dist/server/*.json (open, closed, manifest)
 *   --verify-local-config  deep-compares those files and re-hashes the build
 *   --live-readonly        wrangler GETs for the target only; requires the live
 *                          version to be the recorded rollback target
 *   --print-rollback       prints the rollback and lockdown commands (no execution)
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateFamilyPublicRelease } from "./family-public-web-release.mjs";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(WEB, "../..");
const SOURCE = join(WEB, "wrangler.family.jsonc");
const SERVER = join(WEB, "dist/server");
const BUILT = join(SERVER, "wrangler.json");
const OPEN = join(SERVER, "wrangler.family-open-test-117.json");
const CLOSED = join(SERVER, "wrangler.family-open-test-117-closed.json");
const MANIFEST = join(SERVER, "family-open-test-117-build-manifest.json");

export const TARGET_WORKER = "cresco-family-open-test-web";
export const ROLLBACK_VERSION = "42900c64-0593-4b8f-8c7b-28152239f427";
export const PRODUCT_BASE_SHA = "878fad8517c29b2ea778f8f82e18093a057cf1bc";
// Exact product source reviewed and tested in PR #117 (12/12 WebKit, 145 unit).
export const TESTED_PRODUCT_SHA = "e3e616f51ba059816bc5c6250089a412c4e9cc90";
export const RELEASE_BRANCH = "family/live-product-improvements-2026-10-31";
const PROTECTED = new Set(["cresco", "keys-api-stocklana", "cresco-api-stocklana", "cresco-family-api", "cresco-family-web"]);
const EXTRA_FORBIDDEN = [
  "unsafe", "ai", "browser", "vectorize", "analytics_engine_datasets", "send_email",
  "secret_store_secrets", "mtls_certificates", "ratelimits", "images", "containers",
  "workflows", "pipelines",
];
// After the tested SHA only release tooling and its docs may change.
const ALLOWED_AFTER_TESTED = [
  "docs/family/OPEN-TEST-117-",
  "apps/web/scripts/prepare-family-open-test-117.mjs",
  "apps/web/scripts/prepare-family-open-test-117.test.mjs",
];

const empty = value => value == null || (Array.isArray(value) ? value.length === 0
  : typeof value === "object" ? Object.values(value).every(empty) : false);

export function makeOpenTestConfigs(source, built) {
  validateFamilyPublicRelease(source, built);
  assert.equal(PROTECTED.has(TARGET_WORKER), false, "PROTECTED_WORKER_NAME");
  for (const config of [source, built]) {
    assert.ok(empty(config.durable_objects), "DURABLE_OBJECTS_FORBIDDEN");
    for (const field of EXTRA_FORBIDDEN) assert.ok(empty(config[field]), "FORBIDDEN_TEST_BINDING: " + field);
  }
  assert.ok(!Object.keys(built.env ?? {}).length, "NO_WORKER_ENVIRONMENTS_ALLOWED");
  assert.ok(!Object.keys(built.triggers ?? {}).length, "NO_TRIGGERS_ALLOWED");
  assert.ok(!built.routes?.length && !built.route && !built.custom_domain, "CUSTOM_ROUTING_FORBIDDEN");
  const opened = { ...built, name: TARGET_WORKER, workers_dev: true, preview_urls: false };
  const closed = { ...opened, workers_dev: false };
  return { opened, closed };
}

export function verifyPreparedConfigs(source, built, opened, closed) {
  const expected = makeOpenTestConfigs(source, built);
  assert.deepStrictEqual(opened, expected.opened, "OPEN_CONFIG_DRIFT");
  assert.deepStrictEqual(closed, expected.closed, "CLOSED_CONFIG_DRIFT");
}

export function hashTree(dir) {
  const files = [];
  const walk = current => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (!/wrangler\.family-open-test|family-open-test-117|wrangler\.family-public/.test(entry.name)) files.push(full);
    }
  };
  walk(dir);
  const out = {};
  for (const file of files) out[relative(dir, file).replace(/\\/g, "/")] = createHash("sha256").update(readFileSync(file)).digest("hex");
  return out;
}

export function buildManifest(webRoot, sha) {
  const client = hashTree(join(webRoot, "dist/client"));
  const server = hashTree(join(webRoot, "dist/server"));
  const digest = createHash("sha256").update(JSON.stringify({ client, server })).digest("hex");
  return { sourceSha: sha, target: TARGET_WORKER, clientFiles: Object.keys(client).length,
    serverFiles: Object.keys(server).length, buildDigest: digest, client, server };
}

function git(...args) { return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).trim(); }

function checkProvenance() {
  assert.equal(git("branch", "--show-current"), RELEASE_BRANCH, "WRONG_BRANCH");
  assert.equal(git("status", "--porcelain"), "", "DIRTY_CHECKOUT");
  assert.equal(git("merge-base", PRODUCT_BASE_SHA, "HEAD"), PRODUCT_BASE_SHA, "NOT_DESCENDED_FROM_REVIEWED_114");
  assert.equal(git("merge-base", TESTED_PRODUCT_SHA, "HEAD"), TESTED_PRODUCT_SHA, "TESTED_SHA_NOT_IN_HISTORY");
  const unexpected = git("diff", "--name-only", TESTED_PRODUCT_SHA, "HEAD").split(/\r?\n/).filter(Boolean)
    .filter(path => !ALLOWED_AFTER_TESTED.some(prefix => path.startsWith(prefix)));
  assert.deepEqual(unexpected, [], "PRODUCT_SOURCE_CHANGED_AFTER_TESTED_SHA");
  execFileSync(process.execPath, [join(ROOT, "scripts/family-release-boundary.mjs"), "--built-web"], { cwd: ROOT, stdio: "inherit" });
}

function wrangler(...args) {
  return execFileSync(process.execPath, [join(WEB, "node_modules/wrangler/bin/wrangler.js"), ...args],
    { cwd: WEB, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

/** Read-only: only `deployments list` and `versions view` for the one target. */
export function assertLiveIsRollbackTarget(deploymentsText, versionText) {
  const active = [...deploymentsText.matchAll(/\((\d+)%\)\s+([0-9a-f-]{36})/g)].map(m => ({ pct: Number(m[1]), id: m[2] }));
  assert.deepEqual(active, [{ pct: 100, id: ROLLBACK_VERSION }], "LIVE_VERSION_IS_NOT_THE_RECORDED_ROLLBACK_TARGET");
  assert.match(versionText, new RegExp("Version ID:\\s+" + ROLLBACK_VERSION), "ROLLBACK_VERSION_NOT_RETRIEVABLE");
  const bindings = versionText.split("bindings:")[1] ?? "";
  const names = [...bindings.matchAll(/env\.(\w+)/g)].map(m => m[1]);
  assert.deepEqual(names, ["ASSETS"], "LIVE_WORKER_HAS_UNEXPECTED_BINDINGS");
}

export function rollbackCommands() {
  return {
    rollback: `npx --no-install wrangler rollback ${ROLLBACK_VERSION} --name ${TARGET_WORKER} --message "Restore pre-#117 version"`,
    lockdown: "npx --no-install wrangler deploy --config dist/server/wrangler.family-open-test-117-closed.json",
    verify: `npx --no-install wrangler deployments list --name ${TARGET_WORKER}`,
  };
}

function run() {
  const mode = process.argv[2];
  const modes = ["--validate-only", "--prepare-local-config", "--verify-local-config", "--live-readonly", "--print-rollback"];
  assert.ok(process.argv.length === 3 && modes.includes(mode), "USAGE: " + modes.join(" | "));
  assert.ok(!process.env.NEXT_PUBLIC_CRESCO_API_URL, "PUBLIC_TEST_MUST_NOT_INHERIT_BACKEND_API");
  let extra = {};
  if (mode === "--print-rollback") { console.log(JSON.stringify(rollbackCommands(), null, 2)); return; }
  if (mode === "--live-readonly") {
    assertLiveIsRollbackTarget(wrangler("deployments", "list", "--name", TARGET_WORKER),
      wrangler("versions", "view", ROLLBACK_VERSION, "--name", TARGET_WORKER));
    extra = { liveVersion: ROLLBACK_VERSION, liveBindings: ["ASSETS"], cloudflareReads: 2, cloudflareWrites: 0 };
  } else {
    checkProvenance();
    const sha = git("rev-parse", "HEAD");
    const source = JSON.parse(readFileSync(SOURCE, "utf8"));
    const built = JSON.parse(readFileSync(BUILT, "utf8"));
    const { opened, closed } = makeOpenTestConfigs(source, built);
    if (mode === "--prepare-local-config") {
      writeFileSync(OPEN, JSON.stringify(opened, null, 2) + "\n");
      writeFileSync(CLOSED, JSON.stringify(closed, null, 2) + "\n");
      writeFileSync(MANIFEST, JSON.stringify(buildManifest(WEB, sha), null, 2) + "\n");
    } else if (mode === "--verify-local-config") {
      verifyPreparedConfigs(source, built, JSON.parse(readFileSync(OPEN, "utf8")), JSON.parse(readFileSync(CLOSED, "utf8")));
      assert.ok(existsSync(MANIFEST), "BUILD_MANIFEST_MISSING");
      const saved = JSON.parse(readFileSync(MANIFEST, "utf8"));
      const now = buildManifest(WEB, sha);
      assert.equal(saved.sourceSha, sha, "MANIFEST_FOR_DIFFERENT_COMMIT");
      assert.equal(now.buildDigest, saved.buildDigest, "BUILD_CHANGED_SINCE_PREPARED");
      extra = { buildDigest: now.buildDigest, clientFiles: now.clientFiles, serverFiles: now.serverFiles };
    }
  }
  console.log(JSON.stringify({ verdict: "OPEN_TEST_117_" + mode.slice(2).toUpperCase().replace(/-/g, "_") + "_NOT_DEPLOYED",
    targetWorker: TARGET_WORKER, testedProductSha: TESTED_PRODUCT_SHA, rollbackVersion: ROLLBACK_VERSION,
    historicalWorkersUntouched: true, deployed: false, ...extra }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(); } catch (error) { console.error("FAMILY_OPEN_TEST_117_NO_GO: " + error.message); process.exitCode = 1; }
}
