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

function appProtectsWorker(app, workerName) {
  if (!app || typeof app !== 'object') return false;
  const host = workerName + '.faadil-casecraft.workers.dev';
  const direct = [app.domain, ...(Array.isArray(app.domains) ? app.domains : [])]
    .some((domain) => typeof domain === 'string' && (
      domain.toLowerCase() === host ||
      domain.toLowerCase() === 'https://' + host
    ));
  const destination = Array.isArray(app.destinations) &&
    app.destinations.some((d) => d?.worker_id === workerName ||
      d?.uri === host || d?.uri === 'https://' + host);
  return Boolean(direct || destination);
}

function targetsHistoricalBroadly(app) {
  // Descriptive, not proof: flag especially dangerous broad matches so the
  // owner does not accidentally introduce account-wide Access during setup.
  const fields = [app?.domain, ...(app?.domains || []),
    ...(app?.destinations || []).map((d) => d?.uri)];
  return fields.some((d) => typeof d === 'string' &&
    (d.includes('*.faadil-casecraft.workers.dev') ||
      d.includes('*.workers.dev') ||
      d.includes('faadil-casecraft.workers.dev/*')));
}

export function summarizeInventory({ workers, apps, namespaces, pageComplete, accountId }) {
  const names = new Set(workers.map(workerName).filter(Boolean));
  const family = FAMILY.map((name) => {
    const candidates = apps.filter((app) => appProtectsWorker(app, name));
    const directAccessTargets = candidates.map((app) => ({
      appType: typeof app.type === 'string' ? app.type : 'UNKNOWN',
      policyConfigurationPresent: Array.isArray(app.policies) && app.policies.length > 0,
      // App presence does not prove active enforcement. No policies or PII shown.
      accessRuntimeVerified: false
    }));
    return {
      worker: name,
      scriptPresent: names.has(name),
      accessApplicationMatchCount: candidates.length,
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
  if (family.some((f) => !f.scriptPresent)) findings.push('FAMILY_WORKERS_NOT_BOTH_PRESENT');
  if (family.some((f) => f.accessApplicationMatchCount === 0)) findings.push('FAMILY_ACCESS_APPS_NOT_BOTH_EVIDENCED');
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
    const url = new URL(path, ROOT);
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
  const complete = pagination == null ||
    (Number(pagination.total_pages ?? 1) <= 1 &&
      Number(pagination.page ?? 1) === 1);
  return summarizeInventory({
    workers: parseList(data.workers.result, 'workers'),
    apps: parseList(data.apps.result, 'Access apps'),
    namespaces: parseList(data.namespaces.result, 'Durable Object namespaces'),
    pageComplete: complete,
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
