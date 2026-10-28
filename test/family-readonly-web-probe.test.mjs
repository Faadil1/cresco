import test from 'node:test';
import assert from 'node:assert/strict';
import { probeFamilyWebReadOnly } from '../scripts/family-readonly-web-probe.mjs';

const host = 'https://cresco.faadil-casecraft.workers.dev';

test('web host probe uses GET with no credentials and reports only a non-authoritative build hint', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({url,init});
    return new Response(url === host + '/' ?
      '<!doctype html><footer>Solana Devnet · build abc1234</footer>' :
      '<!doctype html><h1>Family desk</h1>',
      { status: 200, headers: {'content-type':'text/html; charset=utf-8'} });
  };
  const result = await probeFamilyWebReadOnly(host, fetchImpl);
  assert.equal(result.result,'REACHABLE');
  assert.equal(result.buildHint,'abc1234');
  assert.equal(result.sourceCommitVerified,false);
  assert.equal(result.immutableDeploymentIdVerified,false);
  assert.equal(result.chainWrites,false);
  assert.equal(result.credentialsSent,false);
  assert.equal(calls.length,2);
  for (const c of calls) {
    assert.equal(c.init.method,'GET');
    assert.equal(c.init.credentials,'omit');
    assert.equal(c.init.body,undefined);
    assert.equal(c.init.headers.authorization,undefined);
  }
});

test('web host probe refuses credentialed/insecure URLs before making any request', async () => {
  for (const input of ['http://example.test','https://user:pw@example.test','https://example.test/path','https://example.test?secret=1']) {
    await assert.rejects(probeFamilyWebReadOnly(input, async () => { throw new Error('must not fetch'); }));
  }
});

test('web host probe reports failed or non-HTML desk without asserting live readiness', async () => {
  const r = await probeFamilyWebReadOnly(host, async (url) =>
    new Response('nothing', {
      status:url.endsWith('/worlds-fair/desk') ? 404 : 200,
      headers:{'content-type':'text/html'}
    }));
  assert.equal(r.result,'FAIL');
  assert.equal(r.checks.length,2);
  assert.equal(r.sourceCommitVerified,false);
});
