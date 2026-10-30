/**
 * Offline, read-only release boundary check for Cresco Family.
 * This script NEVER authenticates to Cloudflare, uploads, deploys, signs or pays.
 * Run it on the standalone branch before preparing any Family deployment.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const FROZEN_COLOSSEUM_BLOBS = Object.freeze({
  api: '4596cf7d12af18fb3d5d17e87ebc3357b5bc766a',
  web: 'ae4492f08ba1aac45ff3b37f8289cdbbe5bbe3fd'
});

export function gitBlobSha(buffer) {
  return createHash('sha1')
    .update(Buffer.from('blob ' + buffer.byteLength + '\0'))
    .update(buffer)
    .digest('hex');
}

const readConfig = (root, name) => JSON.parse(readFileSync(join(root, name), 'utf8'));
const workersDevUrl = (workerName, value) =>
  typeof value === 'string' &&
  new RegExp('^https://' + workerName + '\\.[a-z0-9-]+\\.workers\\.dev$', 'i').test(value);

export function validateFamilyReleaseBoundary({
  oldApi, oldWeb, api, web, historicApiSha, historicWebSha, builtWeb
}) {
  assert.equal(historicApiSha, FROZEN_COLOSSEUM_BLOBS.api,
    'FROZEN_COLOSSEUM_API_CONFIG_CHANGED: never alter the historic API config');
  assert.equal(historicWebSha, FROZEN_COLOSSEUM_BLOBS.web,
    'FROZEN_COLOSSEUM_WEB_CONFIG_CHANGED: never alter the historic Web config');
  assert.equal(oldApi.name, 'cresco-api-stocklana');
  assert.equal(oldWeb.name, 'cresco');

  assert.equal(api.name, 'cresco-family-api', 'wrong isolated Family API Worker');
  assert.equal(api.main, 'src/cloudflare-family-only-worker.mjs');
  assert.equal(web.name, 'cresco-family-web', 'wrong isolated Family Web Worker');
  assert.equal(web.main, 'vinext/server/fetch-handler');
  assert.notEqual(api.name, oldApi.name);
  assert.notEqual(web.name, oldWeb.name);

  assert.deepEqual(api.durable_objects?.bindings?.map((x) => [x.name, x.class_name]),
    [['FAMILY_STATE', 'CrescoFamilyIsolatedState'], ['FAMILY_PRACTICE_STATE', 'CrescoFamilyPracticeState'], ['FAMILY_PRACTICE_INVITE_GUARD', 'CrescoFamilyPracticeInviteGuard']],
    'Family API must use exactly its own Durable Object class');
  assert.ok(api.exports?.CrescoFamilyIsolatedState, 'isolated DO class export required');
  assert.ok(api.exports?.CrescoFamilyPracticeInviteGuard, 'separate invite quota DO export required');
  assert.ok(api.exports?.CrescoFamilyPracticeState, 'standalone fictional-practice DO export required');
  assert.notEqual(api.durable_objects.bindings[0].class_name,
    oldApi.durable_objects?.bindings?.[0]?.class_name,
    'historical DO class cannot be reused');
  assert.ok(!web.durable_objects?.bindings?.length, 'Family Web cannot bind historic DO');
  assert.ok(workersDevUrl('cresco-family-web', api.vars?.CRESCO_FAMILY_WEB_ORIGIN),
    'Family API must allow only the dedicated Family Web origin');
  assert.equal(api.vars?.CRESCO_FAMILY_RESEARCH_ONLY, '1',
    'FAMILY_RESEARCH_GATE_REQUIRED: all old Devnet/Workspace routes must be inaccessible');
  assert.ok(!Object.hasOwn(api.vars ?? {}, 'CRESCO_FAMILY_STAGING_REQUIRE_ACCESS'),
    'FAMILY_ACCESS_LOGIN_NOT_REQUIRED: no Cloudflare Access account gate for adult testers');
  assert.ok(!Object.hasOwn(api.vars ?? {}, 'CRESCO_FAMILY_DEVNET_WRITES'),
    'Devnet writes must not be enabled via committed Wrangler vars');
  assert.ok(!Object.hasOwn(api.vars ?? {}, 'CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN'), 'operator recovery must be a secret, not a committed variable');
  assert.ok(!Object.hasOwn(api.vars ?? {}, 'CRESCO_FAMILY_PRACTICE_INVITE_TOKEN'),
    'Practice invite must be a secret, never a committed variable');
  assert.ok(!Object.hasOwn(api.vars ?? {}, 'CRESCO_FAMILY_CREATE_TOKEN'),
    'Private invite token must be a Worker secret, not a plaintext variable');

  for (const [name, config] of [['API', api], ['WEB', web]]) {
    assert.equal(config.workers_dev, false,
      name + '_FIRST_INSTALL_EXPOSES_WORKERS_DEV: disabled until separate owner-approved Access review');
    assert.equal(config.preview_urls, false,
      name + '_FIRST_INSTALL_EXPOSES_PREVIEW_URLS: disabled until owner-approved access review');
    for (const field of ['route', 'routes', 'zone_id', 'account_id', 'custom_domain', 'assets_public']) {
      assert.ok(config[field] == null, name + ' cannot bind routes/zones or embedded accounts');
    }
    for (const [key, value] of Object.entries(config.vars ?? {})) {
      assert.ok(!/TOKEN|SECRET|KEYPAIR|PRIVATE_KEY|API_KEY|SOLANA_DEVNET_RPC/i.test(key),
        name + ' config contains a secret-like variable ' + key);
      assert.ok(!/keys-api-stocklana|cresco-api-stocklana|^https:\/\/cresco\.faadil-casecraft\./i.test(String(value)),
        name + ' contains historic Colosseum service reference');
    }
  }
  if (builtWeb) {
    assert.equal(builtWeb.name, 'cresco-family-web',
      'BUILD_TARGET_MISMATCH: would publish the Colosseum Worker');
    assert.equal(builtWeb.workers_dev, false,
      'FAMILY_BUILD_EXPOSES_WORKERS_DEV: generated build is not sealed');
    assert.equal(builtWeb.preview_urls, false,
      'FAMILY_BUILD_EXPOSES_PREVIEW_URLS: generated build is not sealed');
    assert.ok(!builtWeb.routes?.length && !builtWeb.route,
      'FAMILY_BUILD_HAS_PUBLIC_ROUTE: generated build is not sealed');
  }
  return {
    historicApiSha, historicWebSha, familyApi: api.name, familyWeb: web.name,
    familyDurableObject: 'CrescoFamilyIsolatedState',
    devnetWrites: 'default-off', cloudflareWrite: false, deployApproved: false
  };
}

export function checkFamilyReleaseBoundary(root = ROOT, { checkBuiltWeb = false } = {}) {
  const legacyApiBuffer = readFileSync(join(root, 'wrangler.jsonc'));
  const legacyWebBuffer = readFileSync(join(root, 'apps/web/wrangler.jsonc'));
  const artifact = join(root, 'apps/web/dist/server/wrangler.json');
  if (checkBuiltWeb) assert.ok(existsSync(artifact), 'Family Web build artifact absent');
  return validateFamilyReleaseBoundary({
    oldApi: readConfig(root, 'wrangler.jsonc'),
    oldWeb: readConfig(root, 'apps/web/wrangler.jsonc'),
    api: readConfig(root, 'wrangler.family-api.jsonc'),
    web: readConfig(root, 'apps/web/wrangler.family.jsonc'),
    historicApiSha: gitBlobSha(legacyApiBuffer),
    historicWebSha: gitBlobSha(legacyWebBuffer),
    builtWeb: checkBuiltWeb ? JSON.parse(readFileSync(artifact, 'utf8')) : undefined
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = checkFamilyReleaseBoundary(ROOT, {
      checkBuiltWeb: process.argv.includes('--built-web')
    });
    process.stdout.write(JSON.stringify({ status: 'PASS', ...result }, null, 2) + '\n');
  } catch (error) {
    process.stderr.write('FAMILY_RELEASE_BOUNDARY_BLOCKED: ' + error.message + '\n');
    process.exitCode = 1;
  }
}
