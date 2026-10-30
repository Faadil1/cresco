/**
 * Prepare an isolated public, no-login CRESCO Family **testing** Worker.
 *
 * NO DEPLOY, NO CLOUDFARE API, NO LOGIN, NO PROD WRITE.
 * The reviewed product source is pinned to PR #114 HEAD. This tool may only
 * write a sibling Wrangler config inside the ignored dist/server folder.
 *
 * Usage from apps/web after npm run build:public-family:
 *   node scripts/prepare-family-open-test.mjs --validate-only
 *   node scripts/prepare-family-open-test.mjs --prepare-local-config
 *   node scripts/prepare-family-open-test.mjs --verify-local-config
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateFamilyPublicRelease } from "./family-public-web-release.mjs";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(WEB, "../..");
const SOURCE = join(WEB, "wrangler.family.jsonc");
const BUILT = join(WEB, "dist/server/wrangler.json");
const OPEN = join(WEB, "dist/server/wrangler.family-open-test.json");
const CLOSED = join(WEB, "dist/server/wrangler.family-open-test-closed.json");

export const FROZEN_PRODUCT_SHA = "878fad8517c29b2ea778f8f82e18093a057cf1bc";
export const PREP_BRANCH = "family/open-one-click-tester-launch-prep-2026-10-30";
export const OPEN_TEST_WORKER = "cresco-family-open-test-web";

// These names are not authorized deployment targets for this preparation.
const PROTECTED_NAMES = new Set([
  "cresco", "keys-api-stocklana", "cresco-api-stocklana",
  "cresco-family-api", "cresco-family-web",
]);
const EXTRA_FORBIDDEN_BINDINGS = [
  "unsafe", "ai", "browser", "vectorize", "analytics_engine_datasets",
  "send_email", "secret_store_secrets", "mtls_certificates", "ratelimits",
  "images", "containers", "workflows", "pipelines",
];

function empty(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.values(value).every(empty);
  return false;
}

export function makeOpenTestConfigs(source, built) {
  // Reuse the existing sealed Family-only production-build policy.
  validateFamilyPublicRelease(source, built);
  assert.equal(PROTECTED_NAMES.has(OPEN_TEST_WORKER), false,
    "PROTECTED_WORKER_NAME");
  // Existing release policy detects a conventional durable_objects.bindings
  // array. Reject *any* non-empty/malformed object as well, rather than only
  // looking at its optional .bindings path (the negative CI caught this).
  for (const config of [source, built]) {
    assert.ok(empty(config.durable_objects), "DURABLE_OBJECTS_FORBIDDEN");
    for (const field of EXTRA_FORBIDDEN_BINDINGS) {
      assert.ok(empty(config[field]), "FORBIDDEN_TEST_BINDING: " + field);
    }
  }
  assert.ok(!Object.keys(built.env ?? {}).length,
    "NO_WORKER_ENVIRONMENTS_ALLOWED");
  assert.ok(!Object.keys(built.triggers ?? {}).length,
    "NO_SCHEDULED_OR_QUEUE_TRIGGERS_ALLOWED");
  assert.ok(!built.routes?.length && !built.route && !built.custom_domain,
    "PUBLIC_CUSTOM_ROUTING_FORBIDDEN");

  // Preserve all necessary build-generated asset paths relative to dist/server.
  // Only the new Worker name and public workers.dev toggle can change.
  const opened = { ...built,
    name: OPEN_TEST_WORKER,
    workers_dev: true,
    preview_urls: false,
  };
  const closed = { ...opened, workers_dev: false };
  assert.notEqual(opened.name, source.name);
  assert.equal(opened.preview_urls, false);
  assert.equal(closed.preview_urls, false);
  assert.equal(closed.workers_dev, false);
  return { opened, closed };
}

/**
 * Verify the final, on-disk open/close configs against the validated build.
 * JSON objects like {} are legitimate empty settings: do not use PowerShell's
 * PSCustomObject truthiness to decide whether a backend binding exists.
 * Reject any field drift, added endpoint, worker rename or unexpected binding.
 */
export function verifyPreparedOpenTestConfigs(source, built, opened, closed) {
  const expected = makeOpenTestConfigs(source, built);
  assert.deepStrictEqual(opened, expected.opened, "OPEN_TEST_CONFIG_DRIFT");
  assert.deepStrictEqual(closed, expected.closed, "CLOSED_TEST_CONFIG_DRIFT");
  return true;
}

function git(...args) {
  return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).trim();
}

function checkProvenance() {
  assert.equal(git("branch", "--show-current"), PREP_BRANCH,
    "WRONG_BRANCH_DO_NOT_USE_REVIEWED_PR_OR_HISTORIC_CHECKOUT");
  assert.equal(git("status", "--porcelain"), "", "DIRTY_CHECKOUT");
  assert.equal(git("merge-base", FROZEN_PRODUCT_SHA, "HEAD"), FROZEN_PRODUCT_SHA,
    "BRANCH_IS_NOT_DESCENDED_FROM_REVIEWED_PRODUCT");
  // Whitelist only documentation / this release preparation tooling since the
  // audited exact product SHA: no UI, finance, route or Worker source mutation.
  const changed = git("diff", "--name-only", FROZEN_PRODUCT_SHA, "HEAD");
  const allowed = [
    "docs/family/OPEN-TEST-",
    "apps/web/scripts/prepare-family-open-test.mjs",
    "apps/web/scripts/prepare-family-open-test.test.mjs",
    "apps/web/scripts/family-open-test-windows-launch.ps1",
    ".github/workflows/family-open-test-prep.yml",
  ];
  const unexpected = changed.split(/\r?\n/).filter(Boolean)
    .filter(path => !allowed.some(prefix => path.startsWith(prefix)));
  assert.deepEqual(unexpected, [], "REVIEWED_PRODUCT_SOURCE_CHANGED");
  execFileSync(process.execPath, [
    join(ROOT, "scripts/family-release-boundary.mjs"), "--built-web"
  ], { cwd: ROOT, stdio: "inherit" });
}

function run() {
  const mode = process.argv[2];
  assert.ok(process.argv.length === 3 &&
    ["--validate-only", "--prepare-local-config", "--verify-local-config"].includes(mode),
    "USAGE: --validate-only | --prepare-local-config | --verify-local-config");
  assert.ok(!process.env.NEXT_PUBLIC_CRESCO_API_URL,
    "PUBLIC_TEST_MUST_NOT_INHERIT_BACKEND_API");
  checkProvenance();
  const source = JSON.parse(readFileSync(SOURCE, "utf8"));
  const built = JSON.parse(readFileSync(BUILT, "utf8"));
  const { opened, closed } = makeOpenTestConfigs(source, built);

  if (mode === "--prepare-local-config") {
    writeFileSync(OPEN, JSON.stringify(opened, null, 2) + "\n");
    writeFileSync(CLOSED, JSON.stringify(closed, null, 2) + "\n");
  } else if (mode === "--verify-local-config") {
    verifyPreparedOpenTestConfigs(
      source, built,
      JSON.parse(readFileSync(OPEN, "utf8")),
      JSON.parse(readFileSync(CLOSED, "utf8"))
    );
  }

  const verdict = mode === "--prepare-local-config"
    ? "OPEN_TEST_CONFIG_PREPARED_NOT_DEPLOYED"
    : mode === "--verify-local-config"
      ? "OPEN_TEST_CONFIG_VERIFIED_NOT_DEPLOYED"
      : "OPEN_TEST_CONFIG_VALIDATED_NOT_DEPLOYED";
  console.log(JSON.stringify({
    verdict,
    reviewedProductSha: FROZEN_PRODUCT_SHA,
    targetWorker: OPEN_TEST_WORKER,
    existingFamilyWorkerUntouched: true,
    historicalWorkersUntouched: true,
    cloudflareOperations: 0,
    visitorLoginOrInviteRequired: false,
    realMoneyOrGuardianVerification: false,
    testConfig: mode === "--prepare-local-config" ? OPEN : null,
    closeConfig: mode === "--prepare-local-config" ? CLOSED : null,
    deployed: false,
    publicUrlVerified: false,
  }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(); }
  catch (err) {
    console.error("FAMILY_OPEN_TEST_PREPARATION_NO_GO: " + err.message);
    process.exitCode = 1;
  }
}
