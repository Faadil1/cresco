// Dedicated Cresco Family HTTP surface. Never route this Worker to the
// historical Colosseum / World's Fair namespace or Worker name.
import { handleCrescoCloudflareRequest } from './cloudflare-worker.mjs';
import { workflowOpenApi, WORKFLOW_PREFIX } from './worlds-fair-workflow-http.mjs';
import { handleFamilyPracticeRequest, PRACTICE_PREFIX } from './cloudflare-family-practice-api.mjs';

// A distinct class name on a distinct Worker produces a distinct Durable
// Object namespace. The historical FamilyState binding remains untouched.
export { FamilyState as CrescoFamilyIsolatedState } from './cloudflare-family-state.mjs';
export { CrescoFamilyPracticeState } from './cloudflare-family-practice-state.mjs';
export { CrescoFamilyPracticeInviteGuard } from './cloudflare-family-practice-invite-guard.mjs';

const CHAIN_WRITE = /^\/workspaces\/[a-z0-9-]+\/(?:bootstrap|intents|requests\/[a-z0-9-]+\/decision|mandate\/status|mandate\/policy|asset-rule|vault\/topup|guardian\/submit|reconcile)$/;
const ROUTES = new Set(['GET', 'POST', 'OPTIONS']);
const response = (status, error, message, request, env) => {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store', 'vary': 'Origin'
  });
  const from = request.headers.get('origin');
  if (from && from === env.CRESCO_FAMILY_WEB_ORIGIN) {
    headers.set('access-control-allow-origin', from);
  }
  return new Response(JSON.stringify({
    error, message, familyOnly: true, onChainAuthorityChanged: false
  }), { status, headers });
};

export function familyWorkerPolicy(request, env = {}) {
  const path = new URL(request.url).pathname;
  if (!ROUTES.has(request.method)) return { status: 405, error: 'METHOD_NOT_ALLOWED' };
  // Never reuse the older dashboard / demos / Colosseum endpoints.
  if (!path.startsWith(WORKFLOW_PREFIX + '/') && path !== '/health') {
    return { status: 404, error: 'FAMILY_ONLY_ROUTE' };
  }
  const origin = env.CRESCO_FAMILY_WEB_ORIGIN;
  if (!origin || !/^https:\/\/[-a-z0-9.]+$/i.test(origin)) {
    return { status: 503, error: 'FAMILY_ORIGIN_NOT_CONFIGURED' };
  }
  const from = request.headers.get('origin');
  if (from && from !== origin) return { status: 403, error: 'FAMILY_ORIGIN_FORBIDDEN' };
  if (!env.FAMILY_STATE) return { status: 503, error: 'FAMILY_STORAGE_UNAVAILABLE' };
  // Explicit bootstrap/intent/approval gate. Creating a Family profile and
  // enrolling a recovery wallet is possible without authorizing Devnet funds.
  if (request.method === 'POST' && CHAIN_WRITE.test(path.slice(WORKFLOW_PREFIX.length)) &&
      env.CRESCO_FAMILY_DEVNET_WRITES !== 'enabled-by-owner') {
    return { status: 423, error: 'FAMILY_DEVNET_NOT_AUTHORIZED' };
  }
  if (request.method === 'POST' && path === WORKFLOW_PREFIX + '/workspaces' &&
      !env.CRESCO_FAMILY_CREATE_TOKEN) {
    return { status: 503, error: 'FAMILY_INVITATION_NOT_CONFIGURED' };
  }
  return null;
}

export async function handleCrescoFamilyOnlyRequest(request, env = {}, services = {}, ctx = {}) {
  // Fail closed even if someone accidentally removes the Wrangler Access flag.
  // OPTIONS is harmless preflight and remains origin-restricted by the route handler.
  if (env.CRESCO_FAMILY_STAGING_REQUIRE_ACCESS !== '1') {
    return response(503, 'FAMILY_ACCESS_NOT_CONFIGURED',
      'Private Family authentication is not configured', request, env);
  }
  if (env.CRESCO_FAMILY_STAGING_REQUIRE_ACCESS === '1' &&
      request.method !== 'OPTIONS' && !ctx.access) {
    return response(403, 'FAMILY_ACCESS_REQUIRED',
      'Cloudflare Access authentication is required', request, env);
  }
  // The separate fictional-credit service never reaches the Devnet workflow router.
  if (new URL(request.url).pathname.startsWith(PRACTICE_PREFIX + '/')) {
    return handleFamilyPracticeRequest(request, env);
  }
  const denied = familyWorkerPolicy(request, env);
  if (denied) return response(denied.status, denied.error, 'This isolated Family service cannot perform the requested action', request, env);
  const path = new URL(request.url).pathname;
  // A public contract for this Worker should explicitly describe Family,
  // not imply that the Capital or legacy Family API is available.
  if (request.method === 'GET' && path === WORKFLOW_PREFIX + '/openapi') {
    const spec = workflowOpenApi();
    spec.info.title = 'Cresco Family — isolated API, Solana Devnet lab';
    spec.info.description = 'Family-only Parent, Teen and second-Parent roles. Independent experimental namespace; no real assets. Chain writes require a separate owner-authorized gate.';
    spec['x-cresco-family-only'] = true;
    spec['x-cresco-devnet-writes-enabled'] = env.CRESCO_FAMILY_DEVNET_WRITES === 'enabled-by-owner';
    return new Response(JSON.stringify(spec), { status: 200, headers: {
      'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
      'access-control-allow-origin': env.CRESCO_FAMILY_WEB_ORIGIN, 'vary': 'Origin'
    } });
  }
  if (request.method === 'POST' && path === WORKFLOW_PREFIX + '/workspaces') {
    let body;
    try { body = await request.clone().json(); } catch {
      return response(400, 'FAMILY_JSON_INVALID', 'Workspace creation requires valid JSON', request, env);
    }
    if (!body || body.useCase !== 'family') {
      return response(403, 'FAMILY_CASE_REQUIRED', 'Only a Family workspace can be created here', request, env);
    }
    if (request.headers.get('x-cresco-create-token') !== env.CRESCO_FAMILY_CREATE_TOKEN) {
      return response(401, 'FAMILY_INVITATION_INVALID', 'A valid Family early-access code is required', request, env);
    }
  }

  // Keep the existing Solana workflow implementation and serialized writes,
  // but inject only Family-specific environment settings. DO state is already
  // isolated by the dedicated Worker / class binding in its Wrangler config.
  const familyEnv = {
    ...env,
    CRESCO_CORS_ORIGIN: env.CRESCO_FAMILY_WEB_ORIGIN,
    CRESCO_CORS_ORIGINS: env.CRESCO_FAMILY_WEB_ORIGIN,
    WORLD_FAIR_CREATE_TOKEN: env.CRESCO_FAMILY_CREATE_TOKEN,
    WORLD_FAIR_MAX_WORKSPACES: env.CRESCO_FAMILY_MAX_WORKSPACES || '15',
  };
  const res = await handleCrescoCloudflareRequest(request, familyEnv, services);
  const headers = new Headers(res.headers);
  headers.set('cache-control', 'no-store');
  if (request.method === 'OPTIONS') {
    // Private early-access creation sends a custom header; the new Family API
    // must advertise it without widening the historic Colosseum CORS policy.
    headers.set('access-control-allow-headers',
      'content-type,idempotency-key,authorization,x-cresco-create-token');
  }
  return new Response(res.body, { status: res.status, headers });
}

export default {
  fetch(request, env, ctx) {
    return handleCrescoFamilyOnlyRequest(request, env, {}, ctx);
  }
};
