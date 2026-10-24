import { routeCrescoHttp } from './http-api.mjs';
import { handleFamilyApi } from './cloudflare-family-api.mjs';
import { FamilyState } from './cloudflare-family-state.mjs';
import {
  configuredWorldFairOrcaProviderFromEnv,
  configuredWorldFairWorkspaceChainFactoryFromEnv
} from './worlds-fair-orca-provider.mjs';
import { createWorldFairWorkflow } from './worlds-fair-workflow.mjs';
import { isWorkflowPath, workflowWriteScope } from './worlds-fair-workflow-http.mjs';

// Optional lab limits from Worker vars: WORLD_FAIR_CREATE_TOKEN gates workspace
// creation; WORLD_FAIR_MAX_WORKSPACES raises or lowers the capacity (default 25,
// bounded to 1..200 because every workspace spends lab Devnet funds).
export function worldFairWorkflowOptionsFromEnv(env = {}) {
  const options = {};
  if (String(env.WORLD_FAIR_WORKSPACE_CREATION_DISABLED ?? '').toLowerCase() === 'true') options.creationDisabled = true;
  if (env.WORLD_FAIR_CREATE_TOKEN) options.createToken = env.WORLD_FAIR_CREATE_TOKEN;
  const max = Number(env.WORLD_FAIR_MAX_WORKSPACES);
  if (Number.isSafeInteger(max) && max >= 1 && max <= 200) options.maxWorkspaces = max;
  return options;
}
export { FamilyState };

const DEFAULT_CRESCO_ORIGINS = Object.freeze([
  'https://cresco-lac.vercel.app',
  'https://cresco.faadil-casecraft.workers.dev'
]);
const WORLD_FAIR_LOCK_NAME = 'cresco-worlds-fair-operator-lab-live-lock';
const WORLD_FAIR_WORKFLOW_STORE = 'cresco-worlds-fair-workflow-store';

function workflowStub(env = {}) {
  if (!env.FAMILY_STATE) return null;
  return env.FAMILY_STATE.get(env.FAMILY_STATE.idFromName(WORLD_FAIR_WORKFLOW_STORE));
}

async function workflowDoCall(stub, path, payload) {
  const response = await stub.fetch('https://worlds-fair-workflow.internal' + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

export function durableWorkflowStore(stub) {
  return {
    async get(key) {
      const result = await workflowDoCall(stub, '/wf-kv/get', { key });
      if (result.status !== 200) throw new Error('WORKFLOW_STORE_READ_FAILED');
      return result.body?.value ?? null;
    },
    async put(key, value) {
      const result = await workflowDoCall(stub, '/wf-kv/put', { key, value });
      if (result.status !== 200) throw new Error('WORKFLOW_STORE_WRITE_FAILED');
    }
  };
}

function worldFairLockStub(env = {}) {
  if (!env.FAMILY_STATE) return null;
  const id = env.FAMILY_STATE.idFromName(WORLD_FAIR_LOCK_NAME);
  return env.FAMILY_STATE.get(id);
}

async function worldFairLockCall(env, path, requestId) {
  const stub = worldFairLockStub(env);
  if (!stub) return null;
  const response = await stub.fetch(
    'https://worlds-fair-lock.internal' + path,
    {
      method: path === '/worlds-fair-lock' ? 'GET' : 'POST',
      headers: { 'content-type': 'application/json' },
      body:
        path === '/worlds-fair-lock'
          ? undefined
          : JSON.stringify({ requestId })
    }
  );
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

function configuredCorsOrigins(env = {}) {
  const configured =
    env.CRESCO_CORS_ORIGINS ||
    (typeof process !== 'undefined' ? process.env?.CRESCO_CORS_ORIGINS : null) ||
    env.CRESCO_CORS_ORIGIN ||
    (typeof process !== 'undefined' ? process.env?.CRESCO_CORS_ORIGIN : null) ||
    DEFAULT_CRESCO_ORIGINS.join(',');

  return [...new Set(
    String(configured)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  )];
}

function allowedOrigin(request, env = {}) {
  const configured = configuredCorsOrigins(env);
  const origin = request.headers.get('origin');

  if (!origin) return configured[0] ?? DEFAULT_CRESCO_ORIGINS[0];
  return configured.includes(origin) ? origin : null;
}

function withCors(headers, request, env) {
  const next = new Headers(headers ?? {});
  const origin = allowedOrigin(request, env);
  if (origin) {
    next.set('access-control-allow-origin', origin);
  } else {
    next.delete('access-control-allow-origin');
  }
  next.set('access-control-allow-methods', 'GET,POST,OPTIONS');
  next.set(
    'access-control-allow-headers',
    'content-type,idempotency-key,authorization'
  );
  next.set('vary', 'Origin');
  return next;
}

async function readJsonBody(request) {
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) return null;

  const text = await request.text();
  if (!text) return null;
  return JSON.parse(text);
}

export async function handleCrescoCloudflareRequest(request, env = {}, services = {}) {
  const url = new URL(request.url);
  const path = url.pathname === '/' ? '/health' : url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: withCors({}, request, env)
    });
  }

  try {
    const familyResponse = await handleFamilyApi(request, env);
    if (familyResponse) {
      return new Response(await familyResponse.text(), {
        status: familyResponse.status,
        headers: withCors(familyResponse.headers, request, env)
      });
    }

    const body = await readJsonBody(request);

    if (isWorkflowPath(path)) {
      return await handleWorkflowRequest({ request, env, services, path, body });
    }

    const isWorldFairRun =
      request.method === 'POST' &&
      path === '/api/v0.3/worlds-fair/run';

    let worldFairLeaseId = null;
    if (isWorldFairRun) {
      if (!env.FAMILY_STATE) {
        return new Response(
          JSON.stringify({
            contractVersion: '0.3',
            type: 'WORLD_FAIR_OPERATOR_LAB_RUN',
            status: 'UNKNOWN',
            error: 'WORLD_FAIR_SERIALIZATION_UNAVAILABLE',
            receipt: null
          }),
          {
            status: 503,
            headers: withCors(
              { 'content-type': 'application/json; charset=utf-8' },
              request,
              env
            )
          }
        );
      }

      worldFairLeaseId = crypto.randomUUID();
      const lease = await worldFairLockCall(
        env,
        '/worlds-fair-lock/acquire',
        worldFairLeaseId
      );

      if (!lease || lease.status !== 200 || lease.body?.acquired !== true) {
        worldFairLeaseId = null;
        const retryAfterMs = Number(lease?.body?.retryAfterMs || 5000);
        return new Response(
          JSON.stringify({
            contractVersion: '0.3',
            type: 'WORLD_FAIR_OPERATOR_LAB_RUN',
            status: 'BUSY',
            error: 'WORLD_FAIR_LIVE_RUN_IN_PROGRESS',
            retryAfterMs,
            receipt: null
          }),
          {
            status: 409,
            headers: withCors(
              {
                'content-type': 'application/json; charset=utf-8',
                'retry-after': String(Math.max(1, Math.ceil(retryAfterMs / 1000)))
              },
              request,
              env
            )
          }
        );
      }
    }

    try {
      const routeServices = { ...services };
      if (
        path.startsWith('/api/v0.3/worlds-fair/') &&
        !routeServices.worldFairExecutionProvider
      ) {
        routeServices.worldFairExecutionProvider =
          configuredWorldFairOrcaProviderFromEnv(env);
      }

      const result = await routeCrescoHttp({
        method: request.method,
        path,
        body,
        services: routeServices
      });

      return new Response(
        result.body == null ? null : JSON.stringify(result.body),
        {
          status: result.status,
          headers: withCors(result.headers, request, env)
        }
      );
    } finally {
      if (worldFairLeaseId) {
        await worldFairLockCall(
          env,
          '/worlds-fair-lock/release',
          worldFairLeaseId
        ).catch(() => null);
      }
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'BAD_REQUEST',
        message: error?.message ?? 'Invalid request'
      }),
      {
        status: 400,
        headers: withCors(
          { 'content-type': 'application/json; charset=utf-8' },
          request,
          env
        )
      }
    );
  }
}

async function handleWorkflowRequest({ request, env, services, path, body }) {
  const stub = workflowStub(env);
  const workflow =
    services.worldFairWorkflow ??
    (stub
      ? createWorldFairWorkflow({
          store: durableWorkflowStore(stub),
          chainFactory:
            services.worldFairWorkspaceChainFactory ??
            configuredWorldFairWorkspaceChainFactoryFromEnv(env),
          options: worldFairWorkflowOptionsFromEnv(env)
        })
      : null);

  const scope = workflowWriteScope(request.method, path);
  const leaseRequestId = scope && stub ? crypto.randomUUID() : null;
  if (leaseRequestId) {
    const lease = await workflowDoCall(stub, '/lease/acquire', { name: 'wf:' + scope, requestId: leaseRequestId, ttlMs: 300000 });
    if (lease.status !== 200 || lease.body?.acquired !== true) {
      const retryAfterMs = Number(lease.body?.retryAfterMs || 5000);
      return new Response(
        JSON.stringify({ contractVersion: '0.4', error: 'BUSY', message: 'Another write is in progress for this workspace', retryAfterMs }),
        { status: 409, headers: withCors({ 'content-type': 'application/json; charset=utf-8', 'retry-after': String(Math.ceil(retryAfterMs / 1000)) }, request, env) }
      );
    }
  }

  try {
    const url = new URL(request.url);
    const result = await routeCrescoHttp({
      method: request.method,
      path,
      body,
      headers: request.headers,
      query: Object.fromEntries(url.searchParams),
      services: { ...services, worldFairWorkflow: workflow }
    });
    const headers = withCors(result.headers, request, env);
    headers.set('cache-control', 'no-store');
    return new Response(result.body == null ? null : JSON.stringify(result.body), { status: result.status, headers });
  } finally {
    if (leaseRequestId) {
      await workflowDoCall(stub, '/lease/release', { name: 'wf:' + scope, requestId: leaseRequestId }).catch(() => null);
    }
  }
}

export default {
  async fetch(request, env) {
    return handleCrescoCloudflareRequest(request, env);
  }
};
