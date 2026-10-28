/**
 * Private, locally run Cloudflare inventory for the historical Colosseum account.
 * Exclusively GET requests. It never creates, deploys, updates or deletes a Worker.
 *
 * Usage on a machine controlled by the owner:
 *  CLOUDFLARE_ACCOUNT_ID=<id> CLOUDFLARE_API_TOKEN=<read-only token> \
 *    node scripts/family-cloudflare-readonly-inventory.mjs
 *
 * Never paste a token into source, logs, GitHub issues or a shell argument.
 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const HISTORIC_WEB = 'cresco';
export const HISTORIC_PUBLIC_API = 'keys-api-stocklana';
export const HISTORIC_CONFIG_API = 'cresco-api-stocklana';
export const FAMILY_WORKERS = Object.freeze(['cresco-family-web', 'cresco-family-api']);
export const HISTORIC_SUBDOMAIN = 'faadil-casecraft';
const CLOUDFLARE_API = 'https://api.cloudflare.com';

function checkedAccount(accountId) {
  assert.match(accountId ?? '', /^[a-fA-F0-9]{32}$/, 'CLOUDFLARE_ACCOUNT_ID must be a 32-character account ID');
  return accountId.toLowerCase();
}

export function safeWorkerName(name) {
  assert.match(name, /^[a-z0-9][a-z0-9-]{0,62}$/, 'unsafe Worker name');
  return name;
}

export async function makeReadOnlyCloudflareRequest({
  accountId, token, path, fetcher = fetch
}) {
  const account = checkedAccount(accountId);
  assert.ok(typeof token === 'string' && token.length > 0, 'CLOUDFLARE_API_TOKEN is missing');
  assert.ok(path.startsWith('/accounts/' + account + '/workers/'),
    'READONLY_INVENTORY_SCOPE_VIOLATION');
  assert.ok(!path.includes('..') && !path.includes('//') && !path.includes('#'),
    'UNSAFE_INVENTORY_PATH');
  const url = CLOUDFLARE_API + '/client/v4' + path;
  const response = await fetcher(url, {
    method: 'GET',
    redirect: 'error',
    cache: 'no-store',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  });
  // Deliberately omit response body from errors to avoid revealing metadata.
  assert.equal(response.status, 200, 'CLOUDFLARE_INVENTORY_HTTP_' + response.status);
  const body = await response.json();
  assert.equal(body?.success, true, 'CLOUDFLARE_INVENTORY_API_FAILED');
  return body.result;
}

function safeDeployment(deployment) {
  if (!deployment) return null;
  return {
    deploymentId: typeof deployment.id === 'string' ? deployment.id : null,
    createdOn: typeof deployment.created_on === 'string' ? deployment.created_on : null,
    source: typeof deployment.source === 'string' ? deployment.source : null,
    versions: Array.isArray(deployment.versions)
      ? deployment.versions.map((v) => ({
          id: typeof v.version_id === 'string' ? v.version_id : null,
          percentage: typeof v.percentage === 'number' ? v.percentage : null
        }))
      : []
  };
}

export async function inspectHistoricalCloudflareAccount({
  accountId, token, fetcher = fetch
}) {
  const account = checkedAccount(accountId);
  const get = async (path) => makeReadOnlyCloudflareRequest({
    accountId: account, token, path, fetcher
  });
  const subdomainResult = await get('/accounts/' + account + '/workers/subdomain');
  const subdomain = typeof subdomainResult?.subdomain === 'string'
    ? subdomainResult.subdomain.toLowerCase() : null;

  const scripts = await get('/accounts/' + account + '/workers/scripts');
  assert.ok(Array.isArray(scripts), 'CLOUDFLARE_WORKER_LIST_INVALID');
  const metadata = new Map(scripts
    .filter(x => typeof x?.id === 'string')
    .map(x => [x.id, x]));
  const historical = [HISTORIC_WEB, HISTORIC_PUBLIC_API, HISTORIC_CONFIG_API];
  const historicalWorkers = [];
  for (const name of historical) {
    const s = metadata.get(name);
    if (!s) {
      historicalWorkers.push({ name, found: false, activeDeployment: null });
      continue;
    }
    const result = await get('/accounts/' + account + '/workers/scripts/' +
      safeWorkerName(name) + '/deployments?per_page=1');
    const deployment = Array.isArray(result?.deployments)
      ? safeDeployment(result.deployments[0]) : null;
    historicalWorkers.push({
      name, found: true,
      modifiedOn: typeof s.modified_on === 'string' ? s.modified_on : null,
      lastDeployedFrom: typeof s.last_deployed_from === 'string' ? s.last_deployed_from : null,
      activeDeployment: deployment
    });
  }

  const familyCollisions = FAMILY_WORKERS.filter(name => metadata.has(name));
  const web = historicalWorkers.find(w => w.name === HISTORIC_WEB);
  const api = historicalWorkers.find(w => w.name === HISTORIC_PUBLIC_API);
  const subdomainMatches = subdomain === HISTORIC_SUBDOMAIN;
  const historyVerified = Boolean(web?.found && web.activeDeployment && api?.found && api.activeDeployment);
  const releasePreflight = !subdomainMatches
    ? 'BLOCKED_ACCOUNT_SUBDOMAIN_MISMATCH'
    : !historyVerified
      ? 'BLOCKED_HISTORICAL_WORKERS_NOT_CONFIRMED'
      : familyCollisions.length
        ? 'BLOCKED_FAMILY_WORKER_NAME_COLLISION'
        : 'ACCOUNT_METADATA_VERIFIED__DEPLOYMENT_STILL_REQUIRES_APPROVAL';

  // Only sanitized identifiers and statuses. No API token or raw API body.
  return {
    checkedAt: new Date().toISOString(),
    accountFingerprint: account.slice(0, 6) + '…' + account.slice(-4),
    accountSubdomain: subdomain,
    historicalSubdomainMatches: subdomainMatches,
    historicalWorkers,
    familyTargets: FAMILY_WORKERS.map(name => ({ name, available: !metadata.has(name) })),
    releasePreflight,
    buildBranchVerified: false, // requires owner's dashboard verification
    activeWebCommitVerified: false,
    activeApiCommitVerified: false,
    cloudflareModified: false,
    deploymentAuthorized: false
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await inspectHistoricalCloudflareAccount({
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      token: process.env.CLOUDFLARE_API_TOKEN
    });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (error) {
    // Exception messages emitted by this module contain no credential values.
    process.stderr.write('CLOUDFLARE_READONLY_INVENTORY_BLOCKED: ' + error.message + '\n');
    process.exitCode = 1;
  }
}
