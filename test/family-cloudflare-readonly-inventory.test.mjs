import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectHistoricalCloudflareAccount, makeReadOnlyCloudflareRequest
} from '../scripts/family-cloudflare-readonly-inventory.mjs';

const ACCOUNT = '0123456789abcdef0123456789abcdef';
const TOKEN = 'private-token-that-must-not-be-printed';
function stub(calls, options = {}) {
  return async (url, init) => {
    calls.push({ url, method: init.method, redirect: init.redirect, cache: init.cache,
      authorization: init.headers.Authorization });
    const p = new URL(url).pathname;
    assert.equal(init.method, 'GET');
    assert.equal(init.redirect, 'error');
    assert.equal(init.cache, 'no-store');
    assert.ok(url.startsWith('https://api.cloudflare.com/client/v4/accounts/' + ACCOUNT + '/workers/'));
    if (p.endsWith('/subdomain')) return Response.json({
      success: true, result: { subdomain: options.subdomain ?? 'faadil-casecraft' }
    });
    if (p.endsWith('/scripts')) {
      const names = options.missingHistoric
        ? ['cresco']
        : ['cresco', 'keys-api-stocklana', 'cresco-api-stocklana'];
      if (options.collision) names.push('cresco-family-web');
      return Response.json({ success: true, result: names.map(id => ({
        id, modified_on: '2026-10-12T23:36:51Z', last_deployed_from: 'workersci',
        unsafe_secret: 'DO_NOT_EMIT'
      })) });
    }
    if (p.endsWith('/deployments')) return Response.json({
      success: true, result: {
        deployments: [{ id: 'deployment-id', created_on: '2026-10-12T23:36:51Z',
          source: 'workersci', versions: [{ version_id: 'immutable-version-id', percentage: 100 }],
          author_email: 'DO_NOT_EMIT'
        }]
      }
    });
    throw Error('unexpected Cloudflare endpoint');
  };
}

test('Cloudflare account inventory calls only GET and reveals no credentials or raw secret-bearing response', async () => {
  const calls = [];
  const value = await inspectHistoricalCloudflareAccount({
    accountId: ACCOUNT, token: TOKEN, fetcher: stub(calls)
  });
  assert.equal(value.releasePreflight,
    'ACCOUNT_METADATA_VERIFIED__DEPLOYMENT_STILL_REQUIRES_APPROVAL');
  assert.equal(value.accountSubdomain, 'faadil-casecraft');
  assert.equal(value.cloudflareModified, false);
  assert.equal(value.deploymentAuthorized, false);
  assert.equal(value.buildBranchVerified, false);
  assert.ok(calls.every(x => x.method === 'GET' && x.redirect === 'error'));
  assert.equal(calls.length, 6);
  assert.ok(!JSON.stringify(value).includes(TOKEN));
  assert.ok(!JSON.stringify(value).includes('DO_NOT_EMIT'));
  assert.ok(!JSON.stringify(value).includes(ACCOUNT));
});
test('Cloudflare inventory blocks a wrong account subdomain or missing historical API Worker', async () => {
  const a = await inspectHistoricalCloudflareAccount({
    accountId: ACCOUNT, token: TOKEN, fetcher: stub([], { subdomain: 'different-account' })
  });
  assert.equal(a.releasePreflight, 'BLOCKED_ACCOUNT_SUBDOMAIN_MISMATCH');
  const b = await inspectHistoricalCloudflareAccount({
    accountId: ACCOUNT, token: TOKEN, fetcher: stub([], { missingHistoric: true })
  });
  assert.equal(b.releasePreflight, 'BLOCKED_HISTORICAL_WORKERS_NOT_CONFIRMED');
});
test('Cloudflare inventory treats pre-existing Family Worker name as collision', async () => {
  const c = await inspectHistoricalCloudflareAccount({
    accountId: ACCOUNT, token: TOKEN, fetcher: stub([], { collision: true })
  });
  assert.equal(c.releasePreflight, 'BLOCKED_FAMILY_WORKER_NAME_COLLISION');
  assert.equal(c.familyTargets.find(x => x.name === 'cresco-family-web').available, false);
});
test('inventory refuses arbitrary URLs, missing token, invalid account ID, and non-success API', async () => {
  await assert.rejects(() => makeReadOnlyCloudflareRequest({
    accountId: ACCOUNT, token: TOKEN,
    path: '/accounts/' + ACCOUNT + '/workers/../../../user/tokens',
    fetcher: stub([])
  }), /UNSAFE_INVENTORY_PATH/);
  await assert.rejects(() => makeReadOnlyCloudflareRequest({
    accountId: ACCOUNT, token: '',
    path: '/accounts/' + ACCOUNT + '/workers/scripts', fetcher: stub([])
  }), /CLOUDFLARE_API_TOKEN/);
  await assert.rejects(() => makeReadOnlyCloudflareRequest({
    accountId: 'bad', token: TOKEN,
    path: '/accounts/bad/workers/scripts', fetcher: stub([])
  }), /CLOUDFLARE_ACCOUNT_ID/);
  await assert.rejects(() => makeReadOnlyCloudflareRequest({
    accountId: ACCOUNT, token: TOKEN,
    path: '/accounts/' + ACCOUNT + '/workers/scripts',
    fetcher: async () => Response.json({ success: false }, {status:403})
  }), /CLOUDFLARE_INVENTORY_HTTP_403/);
});
