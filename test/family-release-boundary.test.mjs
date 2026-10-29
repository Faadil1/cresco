import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateFamilyReleaseBoundary, gitBlobSha, checkFamilyReleaseBoundary,
  FROZEN_COLOSSEUM_BLOBS } from '../scripts/family-release-boundary.mjs';

const config = (f) => JSON.parse(readFileSync(new URL('../' + f, import.meta.url), 'utf8'));
const baseline = {
  oldApi: config('wrangler.jsonc'),
  oldWeb: config('apps/web/wrangler.jsonc'),
  api: config('wrangler.family-api.jsonc'),
  web: config('apps/web/wrangler.family.jsonc'),
  historicApiSha: gitBlobSha(readFileSync(new URL('../wrangler.jsonc', import.meta.url))),
  historicWebSha: gitBlobSha(readFileSync(new URL('../apps/web/wrangler.jsonc', import.meta.url)))
};
const cloned = () => structuredClone(baseline);
const rejects = (mutate) => {
  const x = cloned(); mutate(x);
  assert.throws(() => validateFamilyReleaseBoundary(x));
};

test('standalone Family boundary permits only isolated configs and pins original Colosseum blobs', () => {
  assert.equal(baseline.historicApiSha, FROZEN_COLOSSEUM_BLOBS.api);
  assert.equal(baseline.historicWebSha, FROZEN_COLOSSEUM_BLOBS.web);
  assert.equal(checkFamilyReleaseBoundary().familyWeb, 'cresco-family-web');
  assert.equal(validateFamilyReleaseBoundary(baseline).devnetWrites, 'default-off');
});
test('guard refuses any change to historical Colosseum API or Web Wrangler contents', () => {
  rejects(x => { x.historicApiSha = 'changed'; });
  rejects(x => { x.historicWebSha = 'changed'; });
});
test('guard refuses historical Worker as the Family deployment target', () => {
  rejects(x => { x.api.name = 'cresco-api-stocklana'; });
  rejects(x => { x.web.name = 'cresco'; });
  rejects(x => { x.builtWeb = { name: 'cresco' }; });
  assert.equal(validateFamilyReleaseBoundary({...cloned(),builtWeb:{name:'cresco-family-web'}}).familyWeb, 'cresco-family-web');
});
test('guard refuses historical DO reuse, unknown entrypoint or web DO binding', () => {
  rejects(x => { x.api.durable_objects.bindings[0].class_name = 'FamilyState'; });
  rejects(x => { x.api.main = 'src/cloudflare-worker.mjs'; });
  rejects(x => { x.web.durable_objects = { bindings: [{class_name:'FamilyState'}] }; });
});
test('guard refuses a historical frontend Origin, plain secret, enabled Devnet writes or zone route', () => {
  rejects(x => { x.api.vars.CRESCO_FAMILY_WEB_ORIGIN = 'https://cresco.faadil-casecraft.workers.dev'; });
  rejects(x => { x.api.vars.CRESCO_FAMILY_CREATE_TOKEN = 'unsafe'; });
  rejects(x => { x.api.vars.CRESCO_FAMILY_DEVNET_WRITES = 'enabled-by-owner'; });
  rejects(x => { x.api.vars.PYTH_PRO_API_KEY = 'unsafe'; });
  rejects(x => { x.web.routes = [{pattern:'*',zone_name:'example.com'}]; });
});

test('family API cannot be prepared without mandatory Access flag on the only isolated Worker', () => {
  rejects(x => { delete x.api.vars.CRESCO_FAMILY_STAGING_REQUIRE_ACCESS; });
  rejects(x => { x.api.vars.CRESCO_FAMILY_STAGING_REQUIRE_ACCESS = 'unit-test-only'; });
  rejects(x => { x.api.vars.CRESCO_FAMILY_STAGING_REQUIRE_ACCESS = '0'; });
});
