import test from 'node:test';
import assert from 'node:assert/strict';

import { probeFamilyHostedReadOnly } from '../scripts/family-readonly-host-probe.mjs';

const API = 'https://api.example.test';
const WEB = 'https://cresco.example.test';
const PREFIX = '/api/v0.4/worlds-fair';
const paths = [
  PREFIX + '/workspaces/{id}/whoami',
  PREFIX + '/workspaces/{id}/roles/{role}/rotate',
  PREFIX + '/workspaces/{id}/principal/recovery/challenge',
  PREFIX + '/workspaces/{id}/principal/recovery/complete'
];

function mockReadOnlyHost({ stale = false, allowHostile = false, exposed = false } = {}) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    assert.ok(init.method === 'GET' || init.method === 'OPTIONS');
    assert.equal(init.credentials, 'omit');
    assert.equal(init.body, undefined);
    assert.equal(init.headers.authorization, undefined);
    assert.equal(init.headers.cookie, undefined);
    assert.ok(url.startsWith(API + PREFIX));
    const from = init.headers.origin;
    const allow = from === WEB || (allowHostile && from === 'https://unauthorized-origin.invalid');
    const headers = {
      'cache-control': 'no-store',
      ...(allow ? { 'access-control-allow-origin': from } : {})
    };
    if (init.method === 'OPTIONS') {
      headers['access-control-allow-headers'] = 'authorization,content-type';
      return new Response(null, { status: 204, headers });
    }
    if (url.endsWith('/openapi')) {
      return new Response(JSON.stringify({
        paths: Object.fromEntries((stale ? paths.slice(0, 2) : paths).map((p) => [p, { get: {} }]))
      }), { status: 200, headers });
    }
    return new Response(JSON.stringify({ error: 'AUTH_INVALID' }), {
      status: exposed ? 200 : 401, headers
    });
  };
  return { calls, fetchImpl };
}

test('hosted Family probe only sends GET/OPTIONS without credentials and explicitly cannot prove the SHA', async () => {
  const mock = mockReadOnlyHost();
  const result = await probeFamilyHostedReadOnly({
    apiOrigin: API, webOrigin: WEB, workspaceId: 'ws-abcdef12345'
  }, mock.fetchImpl);
  assert.equal(result.status, 'PARTIAL');
  assert.equal(result.chainWrites, false);
  assert.equal(result.hostedCommitVerified, false);
  assert.equal(result.authorizationSent, false);
  assert.ok(result.outcomes.filter((x) => x.state === 'PASS').length >= 10);
  assert.ok(mock.calls.every((x) => ['GET','OPTIONS'].includes(x.init.method)));
  assert.ok(!JSON.stringify(result).includes('ws-abcdef12345'));
});

test('hosted probe flags missing Family routes and unexpected anonymous access', async () => {
  const mock = mockReadOnlyHost({ stale: true, exposed: true });
  const result = await probeFamilyHostedReadOnly({
    apiOrigin: API, webOrigin: WEB, workspaceId: 'ws-abcdef12345'
  }, mock.fetchImpl);
  assert.equal(result.status, 'FAIL');
  assert.ok(result.outcomes.some((x) => x.name === 'Expected Family API contract deployed' && x.state === 'FAIL'));
  assert.ok(result.outcomes.some((x) => x.name.includes('Anonymous workspace read refused') && x.state === 'FAIL'));
});

test('hosted probe flags untrusted CORS and avoids claiming auth proof without an existing workspace', async () => {
  const mock = mockReadOnlyHost({ allowHostile: true });
  const result = await probeFamilyHostedReadOnly({ apiOrigin: API, webOrigin: WEB }, mock.fetchImpl);
  assert.equal(result.status, 'FAIL');
  assert.ok(result.outcomes.some((x) => x.name === 'Untrusted origin not authorized by CORS' && x.state === 'FAIL'));
  assert.ok(result.outcomes.some((x) => x.state === 'NOT_TESTED'));
  assert.ok(mock.calls.every((x) => x.init.method === 'GET' || x.init.method === 'OPTIONS'));
});

test('hosted probe refuses non-HTTPS/credentialed URLs and bad workspace identifiers before fetching', async () => {
  const fetchImpl = () => { throw new Error('Should never fetch'); };
  for (const input of [
    { apiOrigin: 'http://api.example.test', webOrigin: WEB },
    { apiOrigin: 'https://x:secret@api.example.test', webOrigin: WEB },
    { apiOrigin: API, webOrigin: WEB + '/index' },
    { apiOrigin: API, webOrigin: WEB, workspaceId: 'not-a-family-workspace' }
  ]) {
    await assert.rejects(() => probeFamilyHostedReadOnly(input, fetchImpl));
  }
});
