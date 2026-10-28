#!/usr/bin/env node
/**
 * CRESCO Family hosted smoke probe — READ ONLY.
 * Allowed methods: GET, OPTIONS. Never sends bearer tokens, creator codes,
 * cookies, request bodies, signatures or transactions.
 *
 * Usage (operator-controlled; NOT executed by CI):
 * node scripts/family-readonly-host-probe.mjs --api-origin https://api.example.com \
 *   --web-origin https://app.example.com [--workspace-id ws-...]
 */
import { pathToFileURL } from 'node:url';

const PREFIX = '/api/v0.4/worlds-fair';
const CONTRACT_PATHS = [
  PREFIX + '/workspaces/{id}/whoami',
  PREFIX + '/workspaces/{id}/roles/{role}/rotate',
  PREFIX + '/workspaces/{id}/principal/recovery/challenge',
  PREFIX + '/workspaces/{id}/principal/recovery/complete'
];

function origin(value, name) {
  if (typeof value !== 'string') throw new Error(name + ' must be provided explicitly');
  const u = new URL(value);
  if (u.protocol !== 'https:' || u.origin !== value || u.username || u.password || u.search || u.hash) {
    throw new Error(name + ' must be a bare HTTPS origin without credentials, path or query');
  }
  return u.origin;
}

export async function probeFamilyHostedReadOnly({ apiOrigin, webOrigin, workspaceId = null }, fetchImpl = fetch) {
  const api = origin(apiOrigin, 'apiOrigin');
  const web = origin(webOrigin, 'webOrigin');
  if (workspaceId !== null && !/^ws-[a-z0-9-]{6,64}$/.test(workspaceId)) {
    throw new Error('workspaceId must be an existing nonsecret Family workspace identifier');
  }
  const outcomes = [];
  const check = (name, passed, evidence, state = passed ? 'PASS' : 'FAIL') =>
    outcomes.push({ name, state, evidence });
  const request = async (method, route, requestOrigin) => {
    if (method !== 'GET' && method !== 'OPTIONS') throw new Error('READ_ONLY_METHOD_REQUIRED');
    const headers = { origin: requestOrigin };
    if (method === 'OPTIONS') {
      headers['access-control-request-method'] = 'GET';
      headers['access-control-request-headers'] = 'authorization';
    }
    return fetchImpl(api + route, { method, headers, redirect: 'manual', credentials: 'omit' });
  };

  try {
    const spec = await request('GET', PREFIX + '/openapi', web);
    const cc = spec.headers.get('cache-control') || '';
    check('OpenAPI public read', spec.status === 200, { status: spec.status });
    check('OpenAPI no-store', /\bno-store\b/i.test(cc), { cacheControl: cc });
    check('Approved web origin CORS', spec.headers.get('access-control-allow-origin') === web,
      { allowed: spec.headers.get('access-control-allow-origin') === web });
    if (spec.status === 200) {
      try {
        const document = await spec.json();
        const missing = CONTRACT_PATHS.filter((p) => !document?.paths?.[p]);
        check('Expected Family API contract deployed', missing.length === 0, { missingRouteCount: missing.length, missingRoutes: missing });
      } catch {
        check('OpenAPI JSON parse', false, { reason: 'non-JSON response' });
      }
    }

    const hostileOrigin = 'https://unauthorized-origin.invalid';
    const hostile = await request('GET', PREFIX + '/openapi', hostileOrigin);
    const unauthorizedCors = hostile.headers.get('access-control-allow-origin');
    check('Untrusted origin not authorized by CORS', unauthorizedCors === null,
      { status: hostile.status, allowed: unauthorizedCors !== null });

    const options = await request('OPTIONS', PREFIX + '/openapi', web);
    check('GET authorization preflight', options.status === 204 &&
      options.headers.get('access-control-allow-origin') === web &&
      (options.headers.get('access-control-allow-headers') || '').toLowerCase().includes('authorization'),
      { status: options.status, allowed: options.headers.get('access-control-allow-origin') === web });

    if (workspaceId) {
      for (const path of ['', '/whoami', '/requests', '/history', '/mandate']) {
        const name = 'Anonymous workspace read refused: ' + (path || '/');
        const res = await request('GET', PREFIX + '/workspaces/' + workspaceId + path, web);
        check(name, res.status === 401, { status: res.status });
        check(name + ' no-store', /\bno-store\b/i.test(res.headers.get('cache-control') || ''),
          { cacheControl: res.headers.get('cache-control') || '' });
      }
    } else {
      outcomes.push({ name: 'Authenticated-workspace read refusal', state: 'NOT_TESTED',
        evidence: 'An existing disposable Family workspace ID was not provided' });
    }
  } catch (e) {
    check('Network / host reachability', false, { reason: 'Host not reachable or probe blocked; no live proof' });
  }
  return { status: outcomes.some((x) => x.state === 'FAIL') ? 'FAIL' : 'PARTIAL',
    methods: ['GET','OPTIONS'], authorizationSent: false, chainWrites: false,
    hostedCommitVerified: false, outcomes };
}

function argsFromCLI(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--api-origin','--web-origin','--workspace-id'].includes(argv[i]) || !argv[i + 1]) {
      throw new Error('Provide --api-origin HTTPS_URL --web-origin HTTPS_URL [--workspace-id ws-ID]');
    }
    parsed[argv[i].slice(2).replace(/-([a-z])/g, (_, x) => x.toUpperCase())] = argv[i + 1];
  }
  return parsed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await probeFamilyHostedReadOnly(argsFromCLI(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.status === 'FAIL' ? 1 : 0;
  } catch (e) {
    console.error('READ_ONLY_PROBE_INVALID_ARGUMENTS:', e instanceof Error ? e.message : String(e));
    process.exitCode = 2;
  }
}
