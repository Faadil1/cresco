/**
 * CRESCO Family Cloudflare READ-ONLY inventory.
 * No Wrangler, deploy, mutations, uploads, secrets reads or HTTP non-GET methods.
 * Operator runs locally with a least-privilege Cloudflare API token in the shell,
 * never pasted into chat, GitHub issues, CI logs or source.
 *
 * Verified API endpoints (Cloudflare 2026 docs):
 * GET /accounts/{account_id}/workers/scripts
 * GET /accounts/{account_id}/access/apps
 * GET /accounts/{account_id}/workers/durable_objects/namespaces
 *
 * Even a complete inventory cannot authorize a launch. Result is ALWAYS NO_GO
 * or MANUAL_REVIEW_ONLY; an independent human access/privacy review is required.
 */
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const ROOT = 'https://api.cloudflare.com/client/v4';
const LEGACY = ['cresco', 'cresco-api-stocklana', 'keys-api-stocklana'];
const FAMILY = ['cresco-family-web', 'cresco-family-api'];
const EXPECTED_FAMILY_DO = [
  'CrescoFamilyIsolatedState',
  'CrescoFamilyPracticeState',
  'CrescoFamilyPracticeInviteGuard'
];
const HEX32 = /^[a-f0-9]{32}$/i;

const requiredError = (key) => new Error('Missing or invalid environment setting: ' + key);

function parseList(result, name) {
  if (!Array.isArray(result)) throw new Error(name + ': unexpected response structure; no completeness claim');
  return result;
}

function workerName(item) {
  return typeof item?.id === 'string' ? item.id : null;
}


function accessCoverageForWorker(app, worker) {
  if (!worker || !app || typeof app !== 'object') return [];
  const name = workerName(worker);
  const tag = typeof worker.tag === 'string' ? worker.tag : null;
  const hostname = name + '.faadil-casecraft.workers.dev';
  const hits = [];
  const hostnames = [app.domain, ...(Array.isArray(app.domains) ? app.domains : [])];
  if (hostnames.some((value) => typeof value === 'string' &&
    [hostname, 'https://' + hostname].includes(value.toLowerCase()))) {
    hits.push('hostname_specific');
  }
  for (const d of Array.isArray(app.destinations) ? app.destinations : []) {
    if (d?.type === 'worker' || d?.type === 'preview_worker') {
      // Workers list id is the script name, whereas a Worker-level Access
      // destination may use the immutable script tag. Never assume IDs match.
      if (typeof d.worker_id === 'string' && (d.worker_id === tag || d.worker_id === name)) {
        hits.push(d.type === 'worker' ? 'worker_all_traffic' : 'preview_only');
      }
    } else if (d?.type === 'public' &&
      [hostname, 'https://' + hostname].includes(String(d.uri).toLowerCase())) {
      hits.push('hostname_specific');
    } else if (!d?.type && [hostname, 'https://' + hostname].includes(String(d?.uri).toLowerCase())) {
      hits.push('hostname_specific');
    }
  }
  return [...new Set(hits)];
}

function hasPublicOverride(app) {
  return (Array.isArray(app?.destinations) ? app.destinations : [])
    .some((d) => Array.isArray(d?.overrides) &&
      d.overrides.some((override) => override?.behavior === 'public'));
}

function targetsHistoricalBroadly(app) {
  const destinations = Array.isArray(app?.destinations) ? app.destinations : [];
  // The typed account-wide destination is independent of wildcard hostnames.
  if (destinations.some((d) =>
    d?.type === 'all_workers' || d?.type === 'all_preview_workers')) return true;
  const fields = [app?.domain,
    ...(Array.isArray(app?.domains) ? app.domains : []),
    ...destinations.map((d) => d?.uri)];
  return fields.some((d) => typeof d === 'string' &&
    (d.includes('*.faadil-casecraft.workers.dev') ||
      d.includes('*.workers.dev') ||
      d.includes('faadil-casecraft.workers.dev/*')));
}

export function summarizeInventory({ workers, apps, namespaces, pageComplete, namespacePageComplete = true, accountId }) {
  const names = new Set(workers.map(workerName).filter(Boolean));
  const family = FAMILY.map((name) => {
    const worker = workers.find((item) => workerName(item) === name);
    const candidates = apps.map((app) => ({
      app, coverage: accessCoverageForWorker(app, worker)
    })).filter((item) => item.coverage.length > 0);
    const directAccessTargets = candidates.map(({ app, coverage }) => ({
      appType: typeof app.type === 'string' ? app.type : 'UNKNOWN',
      coverageSignals: coverage,
      // Preview-only or hostname-specific matches never prove protection of
      // both production + preview URLs. Access enforcement requires live tests.
      publicPathOverrideDetected: hasPublicOverride(app),
      policyConfigurationPresent: Array.isArray(app.policies) && app.policies.length > 0,
      accessRuntimeVerified: false
    }));
    return {
      worker: name,
      scriptPresent: names.has(name),
      workerImmutableIdPresent: typeof worker?.tag === 'string',
      accessApplicationMatchCount: candidates.length,
      workerLevelAllTrafficMatch: candidates.some((item) =>
        item.coverage.includes('worker_all_traffic')),
      publicPathOverrideDetected: candidates.some((item) => hasPublicOverride(item.app)),
      appObservations: directAccessTargets,
      accessRuntimeVerified: false
    };
  });
  const legacy = LEGACY.map((name) => ({worker:name,scriptPresent:names.has(name)}));
  const doNames = namespaces.map((x) => x?.class || x?.class_name || x?.name)
    .filter((x) => typeof x === 'string');
  const needHumanReview = [
    'Exact Cloudflare account ownership and historical Worker deployments',
    'New Workers Access policy destinations, identities, actual GET/POST denial',
    'Cross-origin API Access/CORS preflight and Safari cookie behavior',
    'Durable Object binding class-to-namespace mapping and data isolation',
    'Web/API exact published source SHA, routes, secrets and WAF',
    'PITR backup retention, child privacy and adult research consent'
  ];
  const findings = [];
  if (!pageComplete) findings.push('ACCESS_APPLICATION_PAGINATION_INCOMPLETE');
  if (!namespacePageComplete) findings.push('DURABLE_OBJECT_PAGINATION_INCOMPLETE');
  if (family.some((f) => !f.scriptPresent)) findings.push('FAMILY_WORKERS_NOT_BOTH_PRESENT');
  if (family.some((f) => f.accessApplicationMatchCount === 0)) findings.push('FAMILY_ACCESS_APPS_NOT_BOTH_EVIDENCED');
  if (family.some((f) => f.scriptPresent && !f.workerLevelAllTrafficMatch)) {
    findings.push('FAMILY_FULL_WORKER_ACCESS_NOT_EVIDENCED');
  }
  if (family.some((f) => f.publicPathOverrideDetected)) {
    findings.push('FAMILY_ACCESS_PUBLIC_PATH_OVERRIDE_REVIEW');
  }
  if (apps.some(targetsHistoricalBroadly)) findings.push('BROAD_ACCESS_SCOPE_REQUIRES_HISTORIC_WORKER_REVIEW');
  if (!EXPECTED_FAMILY_DO.every((name) => doNames.includes(name))) {
    findings.push('FAMILY_DURABLE_OBJECT_CLASSES_NOT_ALL_EVIDENCED');
  }
  if (legacy.filter((x) => x.scriptPresent).length === 0) {
    findings.push('HISTORIC_WORKERS_NOT_FOUND_IN_THIS_ACCOUNT');
  }

  return {
    contract: 'CRESCO_CF_READONLY_INVENTORY_V1',
    fetchedAt: new Date().toISOString(),
    source: 'AUTHENTICATED_READ_ONLY_CLOUDFLARE_API',
    accountFingerprint: awaitAccountFingerprint(accountId),
    mode: 'GET_ONLY',
    launchVerdict: 'NO_GO',
    // Never promote to GO: list APIs cannot verify access policy execution,
    // permissions, origin/CSRF, WAF configuration or production Worker SHA.
    evidenceLevel: 'INVENTORY_NOT_DEPLOYMENT_OR_POLICY_VERIFICATION',
    historicWorkers: legacy,
    familyWorkers: family,
    familyDoClassNamesObserved: EXPECTED_FAMILY_DO.filter((n) => doNames.includes(n)),
    risks: findings,
    ownerReviewRequired: needHumanReview
  };
}

function awaitAccountFingerprint(accountId) {
  // Not a secret, but do not echo raw account ID into copied issue evidence.
  const last4 = accountId.slice(-4).toLowerCase();
  return 'redacted-account-...' + last4;
}

export async function inspectCloudflareReadOnly({
  accountId, apiToken, fetchImpl = fetch, deadlineMs = 12000
}) {
  if (!HEX32.test(accountId || '')) throw requiredError('CLOUDFLARE_ACCOUNT_ID');
  if (typeof apiToken !== 'string' || apiToken.length < 16) {
    throw requiredError('CLOUDFLARE_READONLY_API_TOKEN');
  }
  const requests = [
    ['workers', '/accounts/' + accountId + '/workers/scripts'],
    ['apps', '/accounts/' + accountId + '/access/apps?per_page=100'],
    ['namespaces', '/accounts/' + accountId + '/workers/durable_objects/namespaces']
  ];
  const data = {};
  for (const [key, path] of requests) {
    const url = new URL(ROOT + path);
    if (url.origin !== 'https://api.cloudflare.com' ||
        !url.pathname.startsWith('/client/v4/accounts/' + accountId + '/')) {
      throw new Error('CLOUDFLARE_API_HOST_OR_PATH_NOT_ALLOWED');
    }
    let response;
    try {
      response = await fetchImpl(url.href, {
        method: 'GET',
        redirect: 'error',
        cache: 'no-store',
        headers: { 'Authorization': 'Bearer ' + apiToken, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(deadlineMs)
      });
    } catch {
      throw new Error(key + ': read-only API unavailable; NO_GO');
    }
    if (!response.ok) throw new Error(key + ': HTTP ' + response.status + '; NO_GO');
    let body;
    try { body = await response.json(); } catch {
      throw new Error(key + ': invalid JSON; NO_GO');
    }
    if (body?.success !== true) throw new Error(key + ': Cloudflare did not confirm success; NO_GO');
    data[key] = body;
  }
  const pagination = data.apps.result_info;
  const complete = pagination == null
    ? Array.isArray(data.apps.result) && data.apps.result.length < 100
    : (Number(pagination.total_pages ?? 1) <= 1 &&
      Number(pagination.page ?? 1) === 1);
  return summarizeInventory({
    workers: parseList(data.workers.result, 'workers'),
    apps: parseList(data.apps.result, 'Access apps'),
    namespaces: parseList(data.namespaces.result, 'Durable Object namespaces'),
    pageComplete: complete,
    namespacePageComplete: Number(data.namespaces.result_info?.total_pages ?? 1) <= 1 &&
      Number(data.namespaces.result_info?.page ?? 1) === 1,
    accountId
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await inspectCloudflareReadOnly({
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      apiToken: process.env.CLOUDFLARE_READONLY_API_TOKEN
    });
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } catch (error) {
    // No exception details from upstream API are printed: no secret leakage.
    process.stderr.write('CRESCO_CF_PREFLIGHT_NO_GO: ' + error.message + '\n');
    process.exitCode = 2;
  }
}
