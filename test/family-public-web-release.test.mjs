import test from "node:test";
import assert from "node:assert/strict";
import { validateFamilyPublicRelease } from "../apps/web/scripts/family-public-web-release.mjs";

const sealed = () => ({
  name: "cresco-family-web",
  workers_dev: false,
  preview_urls: false,
  main: "index.js",
  assets: { directory: "../client", binding: "ASSETS" }
});

test("public activation changes only the Family Web's public routing flag", () => {
  const source = sealed();
  const built = sealed();
  const before = JSON.stringify(built);
  const result = validateFamilyPublicRelease(source, built);
  assert.equal(JSON.stringify(built), before, "sealed build must not be mutated");
  assert.equal(result.publicConfig.name, "cresco-family-web");
  assert.equal(result.publicConfig.workers_dev, true);
  assert.equal(result.publicConfig.preview_urls, false);
  assert.equal(result.closedConfig.workers_dev, false);
  assert.equal(result.closedConfig.preview_urls, false);
  assert.equal(result.publicConfig.assets.directory, "../client");
});

test("reject historical Workers, public source, unintended APIs, persistent stores and routes", () => {
  for (const mutation of [
    { name: "cresco" },
    { name: "keys-api-stocklana" },
    { name: "cresco-family-api" },
    { workers_dev: true },
    { preview_urls: true },
    { routes: ["cresco.example.com/*"] },
    { account_id: "unexpected" },
    { durable_objects: { bindings: [{ name: "STATE", class_name: "Legacy" }] } },
    { services: [{ binding: "API", service: "keys-api-stocklana" }] },
    { vars: { NEXT_PUBLIC_CRESCO_API_URL: "https://keys-api-stocklana.example" } }
  ]) {
    assert.throws(() => validateFamilyPublicRelease(sealed(), { ...sealed(), ...mutation }),
      undefined, JSON.stringify(mutation));
  }
});

test("refuse non-Family source identities or already public Family sources", () => {
  for (const mutation of [{ name: "cresco" }, { workers_dev: true }, { preview_urls: true }]) {
    assert.throws(() => validateFamilyPublicRelease({ ...sealed(), ...mutation }, sealed()));
  }
});
