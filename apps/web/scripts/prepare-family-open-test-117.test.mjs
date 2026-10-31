import test from "node:test";
import assert from "node:assert/strict";
import {
  assertLiveIsRollbackTarget, makeOpenTestConfigs, rollbackCommands, verifyPreparedConfigs,
  ROLLBACK_VERSION, TARGET_WORKER,
} from "./prepare-family-open-test-117.mjs";

const source = () => ({ name: "cresco-family-web", workers_dev: false, preview_urls: false });
const built = () => ({ name: "cresco-family-web", workers_dev: false, preview_urls: false, main: "index.js",
  assets: { directory: "../client", binding: "ASSETS" }, durable_objects: {}, vars: {} });

test("opens only the dedicated test Worker and closes it with workers_dev off", () => {
  const { opened, closed } = makeOpenTestConfigs(source(), built());
  assert.equal(opened.name, TARGET_WORKER);
  assert.equal(opened.workers_dev, true);
  assert.equal(opened.preview_urls, false);
  assert.equal(closed.name, TARGET_WORKER);
  assert.equal(closed.workers_dev, false);
  assert.equal(opened.assets.directory, "../client");
  assert.doesNotThrow(() => verifyPreparedConfigs(source(), built(), opened, closed));
});

test("rejects backends, bindings, routes and environments", () => {
  for (const mutation of [
    { durable_objects: { bindings: [{ name: "S", class_name: "X" }] } },
    { services: [{ binding: "API", service: "keys-api-stocklana" }] },
    { kv_namespaces: [{ binding: "K", id: "1" }] },
    { ai: { binding: "AI" } },
    { routes: ["example.com/*"] },
    { env: { prod: {} } },
    { triggers: { crons: ["* * * * *"] } },
    { vars: { NEXT_PUBLIC_CRESCO_API_URL: "https://x" } },
  ]) assert.throws(() => makeOpenTestConfigs(source(), { ...built(), ...mutation }), undefined, JSON.stringify(mutation));
});

test("detects drift in prepared configs", () => {
  const { opened, closed } = makeOpenTestConfigs(source(), built());
  assert.throws(() => verifyPreparedConfigs(source(), built(), { ...opened, name: "cresco-family-web" }, closed), /OPEN_CONFIG_DRIFT/);
  assert.throws(() => verifyPreparedConfigs(source(), built(), opened, { ...closed, workers_dev: true }), /CLOSED_CONFIG_DRIFT/);
  assert.throws(() => verifyPreparedConfigs(source(), built(), { ...opened, services: [{ binding: "A", service: "b" }] }, closed));
});

const deployments = `Version(s):  (100%) ${ROLLBACK_VERSION}`;
const version = `Version ID:  ${ROLLBACK_VERSION}\nYour Worker has access to the following bindings:\nBinding  Resource\nenv.ASSETS  Assets\n`;

test("live precondition requires exactly the recorded version at 100% with only ASSETS", () => {
  assert.doesNotThrow(() => assertLiveIsRollbackTarget(deployments, version));
  assert.throws(() => assertLiveIsRollbackTarget(deployments.replace("42900c64", "11111111"), version), /NOT_THE_RECORDED/);
  assert.throws(() => assertLiveIsRollbackTarget(deployments + "\n(50%) 22222222-2222-2222-2222-222222222222", version));
  assert.throws(() => assertLiveIsRollbackTarget(deployments, version + "env.DB  D1\n"), /UNEXPECTED_BINDINGS/);
});

test("rollback and lockdown commands name only the dedicated Worker", () => {
  const { rollback, lockdown, verify } = rollbackCommands();
  assert.match(rollback, new RegExp(`${ROLLBACK_VERSION} --name ${TARGET_WORKER}`));
  assert.match(lockdown, /wrangler\.family-open-test-117-closed\.json/);
  assert.match(verify, new RegExp(TARGET_WORKER));
  for (const text of [rollback, lockdown, verify]) assert.doesNotMatch(text, /stocklana|cresco-family-api|\bcresco\b(?!-family-open)/);
});

test("build hash ignores local Wrangler dev state but detects real file changes", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { hashTree } = await import("./prepare-family-open-test-117.mjs");
  const dir = mkdtempSync(join(tmpdir(), "hash-"));
  writeFileSync(join(dir, "index.js"), "a");
  const before = JSON.stringify(hashTree(dir));
  mkdirSync(join(dir, ".wrangler/state"), { recursive: true });
  writeFileSync(join(dir, ".wrangler/state/x.sqlite"), "state");
  assert.equal(JSON.stringify(hashTree(dir)), before);
  writeFileSync(join(dir, "index.js"), "b");
  assert.notEqual(JSON.stringify(hashTree(dir)), before);
});
