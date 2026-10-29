import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  inspectCloudflareReadOnly, summarizeInventory
} from '../scripts/family-cloudflare-readonly-inventory.mjs';

const ACCOUNT = 'a'.repeat(32);
const TOKEN = 'test-token-never-real-' + 'a'.repeat(24);
const ROOT = 'https://api.cloudflare.com/client/v4/accounts/' + ACCOUNT;

function mockCall({ workerNames, apps, namespaces, totalPages = 1, doTotalPages = 1, status = 200 }) {
  const observed = [];
  const fetchImpl = async (url, options) => {
    observed.push({ url, options });
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers.Authorization, 'Bearer ' + TOKEN);
    assert.ok(url.startsWith(ROOT + '/'));
    let body;
    if (url === ROOT + '/workers/scripts') {
      body = { success: true, result: workerNames.map((item) => typeof item === 'string' ? { id: item } : item) };
    } else if (url === ROOT + '/access/apps?per_page=100') {
      body = { success: true, result: apps,
        result_info: { page: 1, total_pages: totalPages } };
    } else if (url === ROOT + '/workers/durable_objects/namespaces') {
      body = { success: true, result: namespaces.map((name) => ({ class: name })),
        result_info: { page: 1, total_pages: doTotalPages } };
    } else {
      throw new Error('unexpected request');
    }
    return { status, ok: status === 200, json: async () => body };
  };
  return { fetchImpl, observed };
}

test('Inventory uses exactly three authenticated GET operations with fixed Cloudflare host', async () => {
  const mock = mockCall({
    workerNames: ['cresco','cresco-api-stocklana','keys-api-stocklana'],
    apps: [], namespaces: []
  });
  const r = await inspectCloudflareReadOnly({
    accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: mock.fetchImpl
  });
  assert.equal(mock.observed.length, 3);
  assert.deepEqual(mock.observed.map((x) => new URL(x.url).pathname), [
    '/client/v4/accounts/'+ACCOUNT+'/workers/scripts',
    '/client/v4/accounts/'+ACCOUNT+'/access/apps',
    '/client/v4/accounts/'+ACCOUNT+'/workers/durable_objects/namespaces'
  ]);
  assert.equal(r.launchVerdict, 'NO_GO');
  assert.equal(r.mode, 'GET_ONLY');
  assert.deepEqual(r.familyWorkers.map((x) => x.scriptPresent), [false, false]);
  assert.ok(r.risks.includes('FAMILY_WORKERS_NOT_BOTH_PRESENT'));
  assert.ok(r.risks.includes('FAMILY_ACCESS_APPS_NOT_BOTH_EVIDENCED'));
  assert.equal(JSON.stringify(r).includes(TOKEN), false);
  assert.equal(JSON.stringify(r).includes(ACCOUNT), false);
});

test('Even if every named asset and Access app appears, inventory can never authorize staging', async () => {
  const mock = mockCall({
    workerNames: [
      'cresco','keys-api-stocklana','cresco-api-stocklana',
      {id:'cresco-family-web',tag:'immutable-web-tag-123'},
      {id:'cresco-family-api',tag:'immutable-api-tag-456'}
    ],
    apps: [
      { name: 'Cresco Family Web', type: 'self_hosted',
        destinations: [{ type: 'worker', worker_id: 'immutable-web-tag-123' }],
        policies: [{ id: 'dont-share' }] },
      { name: 'Cresco Family API', type: 'self_hosted',
        destinations: [{ type: 'worker', worker_id: 'immutable-api-tag-456' }],
        policies: [{ id: 'dont-share' }] }
    ],
    namespaces: [
      'CrescoFamilyIsolatedState',
      'CrescoFamilyPracticeState',
      'CrescoFamilyPracticeInviteGuard'
    ]
  });
  const r = await inspectCloudflareReadOnly({
    accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: mock.fetchImpl
  });
  assert.equal(r.launchVerdict, 'NO_GO');
  assert.equal(r.evidenceLevel, 'INVENTORY_NOT_DEPLOYMENT_OR_POLICY_VERIFICATION');
  assert.ok(r.familyWorkers.every((x) => x.scriptPresent));
  assert.ok(r.familyWorkers.every((x) => x.accessApplicationMatchCount === 1));
  assert.ok(r.familyWorkers.every((x) => x.workerLevelAllTrafficMatch === true));
  assert.ok(r.familyWorkers.every((x) => x.accessRuntimeVerified === false));
  assert.equal(r.familyDoClassNamesObserved.length, 3);
  assert.deepEqual(r.risks, []);
  assert.ok(r.ownerReviewRequired.some((x) => x.includes('WAF')));
});

test('Incomplete Access pagination, broad wildcard policy and historical ambiguity force manual flags', async () => {
  const mock = mockCall({
    workerNames: ['cresco-family-web','cresco-family-api'],
    apps: [{
      name: 'DANGEROUS BROAD APP',
      domain: '*.faadil-casecraft.workers.dev'
    }],
    namespaces: [], totalPages: 2
  });
  const r = await inspectCloudflareReadOnly({
    accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: mock.fetchImpl
  });
  assert.equal(r.launchVerdict, 'NO_GO');
  assert.ok(r.risks.includes('ACCESS_APPLICATION_PAGINATION_INCOMPLETE'));
  assert.ok(r.risks.includes('BROAD_ACCESS_SCOPE_REQUIRES_HISTORIC_WORKER_REVIEW'));
  assert.ok(r.risks.includes('HISTORIC_WORKERS_NOT_FOUND_IN_THIS_ACCOUNT'));
});

test('Invalid inputs or insufficient permissions never create a positive or partial readout', async () => {
  let calls = 0;
  const denyFetch = async () => {
    calls++;
    return { ok: false, status: 403 };
  };
  await assert.rejects(inspectCloudflareReadOnly({
    accountId: 'not-an-id', apiToken: TOKEN, fetchImpl: denyFetch
  }), /CLOUDFLARE_ACCOUNT_ID/);
  await assert.rejects(inspectCloudflareReadOnly({
    accountId: ACCOUNT, apiToken: 'short', fetchImpl: denyFetch
  }), /CLOUDFLARE_READONLY_API_TOKEN/);
  assert.equal(calls, 0);
  await assert.rejects(inspectCloudflareReadOnly({
    accountId: ACCOUNT, apiToken: TOKEN, fetchImpl: denyFetch
  }), /HTTP 403; NO_GO/);
  assert.equal(calls, 1);
});

test('CLI without credentials makes zero network calls, exits NO_GO and does not echo secrets', () => {
  const script = fileURLToPath(new URL('../scripts/family-cloudflare-readonly-inventory.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script], {
    encoding: 'utf8', timeout: 5000, env: {
      ...process.env, CLOUDFLARE_ACCOUNT_ID: '', CLOUDFLARE_READONLY_API_TOKEN: ''
    }
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /CRESCO_CF_PREFLIGHT_NO_GO/);
  assert.ok(!result.stdout);
});

test('Summary intentionally excludes Access application policy details and token material', () => {
  const report = summarizeInventory({
    workers: [{id:'cresco-family-web'}],
    apps: [{domain:'cresco-family-web.faadil-casecraft.workers.dev',
      policies:[{include:[{email:{email:'family-research@example.test'}}]}]}],
    namespaces: [],
    pageComplete: true, accountId: ACCOUNT
  });
  assert.equal(report.launchVerdict, 'NO_GO');
  assert.ok(!JSON.stringify(report).includes('family-research@example.test'));
});


test('Access preview-only app and public bypass cannot be mistaken for full Worker protection', () => {
  const workers = [
    { id:'cresco',tag:'historic-tag' },
    { id:'cresco-family-web',tag:'web-immutable-tag' },
    { id:'cresco-family-api',tag:'api-immutable-tag' }
  ];
  const apps = [
    {type:'self_hosted',destinations:[{type:'preview_worker',worker_id:'web-immutable-tag'}],
      policies:[{decision:'allow'}]},
    {type:'self_hosted',destinations:[{type:'worker',worker_id:'api-immutable-tag',
      overrides:[{behavior:'public',path_pattern:'/api/*'}]}],
      policies:[{decision:'allow'}]}
  ];
  const r = summarizeInventory({ workers, apps, namespaces: [],
    pageComplete:true, accountId:ACCOUNT });
  assert.equal(r.launchVerdict,'NO_GO');
  assert.ok(r.familyWorkers[0].appObservations[0].coverageSignals.includes('preview_only'));
  assert.equal(r.familyWorkers[0].workerLevelAllTrafficMatch,false);
  assert.equal(r.familyWorkers[1].workerLevelAllTrafficMatch,true);
  assert.equal(r.familyWorkers[1].publicPathOverrideDetected,true);
  assert.ok(r.risks.includes('FAMILY_FULL_WORKER_ACCESS_NOT_EVIDENCED'));
  assert.ok(r.risks.includes('FAMILY_ACCESS_PUBLIC_PATH_OVERRIDE_REVIEW'));
});

test('Typed all_workers and all_preview_workers destinations flag historic-worker exposure review', () => {
  const r = summarizeInventory({
    workers:[{id:'cresco',tag:'historical-id'},{id:'cresco-family-api',tag:'family-id'}],
    apps:[{type:'self_hosted',destinations:[{type:'all_workers'}]},
      {type:'self_hosted',destinations:[{type:'all_preview_workers'}]}],
    namespaces:[],pageComplete:true,accountId:ACCOUNT
  });
  assert.ok(r.risks.includes('BROAD_ACCESS_SCOPE_REQUIRES_HISTORIC_WORKER_REVIEW'));
  assert.equal(r.launchVerdict,'NO_GO');
});

test('Durable Object namespace pagination stays separate from Access pagination', async () => {
  const mock=mockCall({
    workerNames:['cresco'],apps:[],namespaces:['CrescoFamilyPracticeState'],
    doTotalPages:2
  });
  const r=await inspectCloudflareReadOnly({
    accountId:ACCOUNT,apiToken:TOKEN,fetchImpl:mock.fetchImpl
  });
  assert.ok(r.risks.includes('DURABLE_OBJECT_PAGINATION_INCOMPLETE'));
  assert.ok(!r.risks.includes('ACCESS_APPLICATION_PAGINATION_INCOMPLETE'));
});
