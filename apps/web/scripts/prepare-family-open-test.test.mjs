import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeOpenTestConfigs, FROZEN_PRODUCT_SHA, OPEN_TEST_WORKER
} from "./prepare-family-open-test.mjs";

function fixture() {
  return {
    source: { name: "cresco-family-web", workers_dev: false, preview_urls: false },
    built: {
      name: "cresco-family-web",
      main: "index.js",
      assets: { directory: "../client", binding: "ASSETS" },
      compatibility_date: "2026-08-06",
      compatibility_flags: ["nodejs_compat"],
      workers_dev: false, preview_urls: false,
    },
  };
}

test("generates only a distinct one-click public testing Worker, and a closed rollback config", () => {
  const { source, built } = fixture();
  const { opened, closed } = makeOpenTestConfigs(source, built);
  assert.equal(FROZEN_PRODUCT_SHA.length, 40);
  assert.equal(opened.name, OPEN_TEST_WORKER);
  assert.notEqual(opened.name, built.name);
  assert.equal(opened.workers_dev, true);
  assert.equal(opened.preview_urls, false);
  assert.equal(closed.name, OPEN_TEST_WORKER);
  assert.equal(closed.workers_dev, false);
  assert.deepEqual(opened.assets, built.assets);
  assert.equal(opened.main, built.main);
  assert.equal(opened.route, undefined);
  assert.equal(opened.durable_objects, undefined);
  assert.equal(opened.vars, undefined);
  assert.equal(built.workers_dev, false, "source objects must remain unchanged");
});

test("rejects a source or built Worker already exposed to the public", () => {
  const x = fixture();
  x.built.workers_dev = true;
  assert.throws(() => makeOpenTestConfigs(x.source, x.built));
});

test("rejects a historic Worker name", () => {
  const x = fixture();
  x.built.name = "cresco";
  assert.throws(() => makeOpenTestConfigs(x.source, x.built));
});

test("rejects backend bindings, application vars and cross-service routing", () => {
  for (const field of ["services", "d1_databases", "durable_objects", "vars"]) {
    const x = fixture();
    x.built[field] = field === "vars" ? { API: "some-value" } : [{ binding: "X" }];
    assert.throws(() => makeOpenTestConfigs(x.source, x.built), field);
  }
});

test("rejects any malformed or canonical Durable Object declaration in source or build", () => {
  for (const key of ["source", "built"]) {
    for (const declaration of [
      [{ binding: "STATE" }],
      { bindings: [{ name: "STATE", class_name: "Counter" }] },
      { unexpected: { binding: "STATE" } },
    ]) {
      const x = fixture();
      x[key].durable_objects = declaration;
      assert.throws(() => makeOpenTestConfigs(x.source, x.built), key);
    }
  }
});

test("rejects less common execution/storage bindings, routes and scheduled triggers", () => {
  for (const field of ["ai", "vectorize", "unsafe", "workflows", "pipelines"]) {
    const x = fixture();
    x.built[field] = { binding: "X" };
    assert.throws(() => makeOpenTestConfigs(x.source, x.built), field);
  }
  const routed = fixture();
  routed.built.route = "example.com/*";
  assert.throws(() => makeOpenTestConfigs(routed.source, routed.built));
  const scheduled = fixture();
  scheduled.built.triggers = { crons: ["0 * * * *"] };
  assert.throws(() => makeOpenTestConfigs(scheduled.source, scheduled.built));
});

test("refuses embedded custom account/zone IDs and preview URLs", () => {
  for (const [field, value] of [["account_id", "fake"], ["zone_id", "fake"], ["preview_urls", true]]) {
    const x = fixture();
    x.built[field] = value;
    assert.throws(() => makeOpenTestConfigs(x.source, x.built), field);
  }
});
