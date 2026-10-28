import test from 'node:test';
import assert from 'node:assert/strict';
import { assertStandaloneFamilyTargets, probeStandaloneFamily } from '../scripts/family-standalone-readonly-probe.mjs';

const api = 'https://cresco-family-api.example-account.workers.dev';
const web = 'https://cresco-family-web.example-account.workers.dev';
const prefix = '/api/v0.4/worlds-fair';
const familyPaths = Object.fromEntries([
  '/workspaces/{id}/roles/{role}/rotate',
  '/workspaces/{id}/principal/recovery/challenge',
  '/workspaces/{id}/principal/recovery/complete'
].map(p => [prefix + p, { post: {} }]));
function mockFetcher(calls, overrides = {}) {
  return async (url, init) => {
    assert.ok(['GET','OPTIONS'].includes(init.method), 'unexpected write');
    assert.equal(init.redirect, 'error');
    assert.equal(init.cache, 'no-store');
    const { origin, pathname } = new URL(url);
    calls.push({ origin, pathname, method: init.method, headers: init.headers });
    const opts = { status: 200, headers: {} };
    if (origin === new URL(api).origin && pathname === prefix + '/openapi') {
      if (init.headers?.origin === 'https://untrusted.example') {
        return new Response('', { status: 403, headers: {} });
      }
      return new Response(JSON.stringify({
        'x-cresco-family-only': true,
        'x-cresco-devnet-writes-enabled': false,
        paths: { ...familyPaths, ...(overrides.paths ?? {}) }
      }), { status: 200, headers: {
        'cache-control': 'no-store',
        'access-control-allow-origin': new URL(web).origin
      }});
    }
    if (init.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'access-control-allow-origin': new URL(web).origin,
      'access-control-allow-headers': 'content-type,x-cresco-create-token'
    }});
    if (pathname === '/api/v0.1/capabilities' || pathname === '/worlds-fair')
      return new Response('', { status: 404 });
    return new Response('<h1>Cresco Family</h1>', opts);
  };
}

test('read-only probe rejects historic Colosseum and cross-account hosts', () => {
  for (const pair of [
    ['https://keys-api-stocklana.faadil-casecraft.workers.dev', web],
    ['https://cresco-api-stocklana.faadil-casecraft.workers.dev', web],
    [api, 'https://cresco.faadil-casecraft.workers.dev'],
    [api, 'https://cresco-family-web.other-account.workers.dev'],
    [api + '/foo', web],
    [api.replace('https:', 'http:'), web],
    [api, web + '?token=unsafe']
  ]) assert.throws(() => assertStandaloneFamilyTargets(...pair));
});
test('hosted probe invokes only GET/OPTIONS and proves isolated API, CORS and Capital block', async () => {
  const calls = [];
  const result = await probeStandaloneFamily(api, web, mockFetcher(calls));
  assert.equal(result.status, 'HOSTED_READ_ONLY_PASS');
  assert.equal(result.hostedCommitVerified, false);
  assert.equal(result.moneyActionsInvoked, false);
  assert.ok(calls.every(x => ['GET','OPTIONS'].includes(x.method)));
  assert.equal(calls.length, 6);
});
test('hosted probe fails closed if Family contract is incomplete', async () => {
  const calls = [];
  const badFetcher = async (u, init) => {
    const res = await mockFetcher(calls)(u,init);
    if (new URL(u).pathname === prefix + '/openapi' && init.headers?.origin !== 'https://untrusted.example') {
      return new Response(JSON.stringify({
        'x-cresco-family-only': true,
        'x-cresco-devnet-writes-enabled': true,
        paths: familyPaths
      }), {headers:{'cache-control':'no-store','access-control-allow-origin':new URL(web).origin}});
    }
    return res;
  };
  await assert.rejects(() => probeStandaloneFamily(api, web, badFetcher), /Devnet write gate must remain OFF/);
});
