/**
 * Standalone Family hosted verification; strictly anonymous GET + OPTIONS.
 * Not a deploy script. It cannot create accounts, roles, challenges or funds.
 */
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function assertStandaloneFamilyTargets(apiUrl, webUrl) {
  const a = new URL(apiUrl), w = new URL(webUrl);
  for (const u of [a, w]) {
    assert.equal(u.protocol, 'https:', 'HTTPS only');
    assert.equal(u.username, '', 'no embedded credentials');
    assert.equal(u.password, '', 'no embedded credentials');
    assert.equal(u.port, '', 'no nonstandard ports');
    assert.equal(u.pathname, '/', 'origin only, no path');
    assert.equal(u.search, '', 'no query params');
    assert.equal(u.hash, '', 'no fragments');
  }
  const api = /^cresco-family-api\.([a-z0-9-]+)\.workers\.dev$/i.exec(a.hostname);
  const web = /^cresco-family-web\.([a-z0-9-]+)\.workers\.dev$/i.exec(w.hostname);
  assert.ok(api, 'only dedicated cresco-family-api Workers host allowed');
  assert.ok(web, 'only dedicated cresco-family-web Workers host allowed');
  assert.equal(api[1].toLowerCase(), web[1].toLowerCase(), 'Workers must belong to same verified account subdomain');
  return { apiOrigin: a.origin, webOrigin: w.origin, accountSubdomain: api[1] };
}

function requireNoStore(response, label) {
  assert.match(response.headers.get('cache-control') || '', /(?:^|,)\s*no-store(?:\s*,|$)/i, label + ' must not be cached');
}

export async function probeStandaloneFamily(apiUrl, webUrl, fetcher = fetch) {
  const targets = assertStandaloneFamilyTargets(apiUrl, webUrl);
  const apiPath = '/api/v0.4/worlds-fair';
  const calls = [];
  async function readOnly(origin, path, method = 'GET', headers = {}) {
    assert.ok(method === 'GET' || method === 'OPTIONS', 'PROBE_WRITE_FORBIDDEN');
    const u = new URL(path, origin);
    assert.equal(u.origin, origin, 'same-origin checks only');
    const response = await fetcher(u.toString(), { method, headers, redirect: 'error', cache: 'no-store' });
    calls.push({ method, url: u.pathname, status: response.status });
    return response;
  }

  const contract = await readOnly(targets.apiOrigin, apiPath + '/openapi', 'GET', { origin: targets.webOrigin });
  assert.equal(contract.status, 200, 'Family OpenAPI unavailable');
  requireNoStore(contract, 'Family contract');
  assert.equal(contract.headers.get('access-control-allow-origin'), targets.webOrigin, 'Family CORS origin mismatch');
  const spec = await contract.json();
  assert.equal(spec['x-cresco-family-only'], true, 'not an isolated Family API');
  assert.equal(spec['x-cresco-devnet-writes-enabled'], false, 'Devnet write gate must remain OFF');
  for (const tail of [
    '/workspaces/{id}/roles/{role}/rotate',
    '/workspaces/{id}/principal/recovery/challenge',
    '/workspaces/{id}/principal/recovery/complete'
  ]) assert.ok(spec.paths?.[apiPath + tail], 'required private Family route missing: ' + tail);

  const preflight = await readOnly(targets.apiOrigin, apiPath + '/workspaces', 'OPTIONS', {
    origin: targets.webOrigin,
    'access-control-request-method': 'POST',
    'access-control-request-headers': 'x-cresco-create-token'
  });
  assert.equal(preflight.status, 204, 'Family invitation preflight unavailable');
  assert.equal(preflight.headers.get('access-control-allow-origin'), targets.webOrigin);
  assert.match(preflight.headers.get('access-control-allow-headers') || '', /x-cresco-create-token/i);

  const legacy = await readOnly(targets.apiOrigin, '/api/v0.1/capabilities');
  assert.equal(legacy.status, 404, 'legacy backend endpoint leaked from Family Worker');

  const unrelated = await readOnly(targets.apiOrigin, apiPath + '/openapi', 'GET', {
    origin: 'https://untrusted.example'
  });
  assert.equal(unrelated.status, 403, 'untrusted Origin must be refused');
  assert.equal(unrelated.headers.get('access-control-allow-origin'), null);

  const landing = await readOnly(targets.webOrigin, '/');
  assert.equal(landing.status, 200, 'Family Web homepage not live');
  const html = await landing.text();
  assert.ok(/Cresco Family|Family early access|Family · Separate early access/i.test(html),
    'Family homepage branding not found');

  const capitalPage = await readOnly(targets.webOrigin, '/worlds-fair');
  assert.equal(capitalPage.status, 404, 'capital-only site route leaked from Family Web');

  return { status: 'HOSTED_READ_ONLY_PASS', ...targets, calls,
    moneyActionsInvoked: false, hostedCommitVerified: false, securityReviewVerified: false };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const apiIdx = process.argv.indexOf('--api');
  const webIdx = process.argv.indexOf('--web');
  if (apiIdx < 0 || webIdx < 0 || !process.argv[apiIdx + 1] || !process.argv[webIdx + 1]) {
    process.stderr.write('Usage: node scripts/family-standalone-readonly-probe.mjs --api https://cresco-family-api.<account>.workers.dev --web https://cresco-family-web.<account>.workers.dev\n');
    process.exitCode = 2;
  } else {
    try {
      process.stdout.write(JSON.stringify(await probeStandaloneFamily(process.argv[apiIdx + 1], process.argv[webIdx + 1]), null, 2) + '\n');
    } catch (error) {
      process.stderr.write('FAMILY_HOSTED_PROBE_BLOCKED: ' + error.message + '\n');
      process.exitCode = 1;
    }
  }
}
