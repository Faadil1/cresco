import { routeCrescoHttp } from './http-api.mjs';
import { handleFamilyApi } from './cloudflare-family-api.mjs';
import { FamilyState } from './cloudflare-family-state.mjs';
import { configuredWorldFairOrcaProviderFromEnv } from './worlds-fair-orca-provider.mjs';
export { FamilyState };

const DEFAULT_CRESCO_ORIGIN = 'https://cresco-lac.vercel.app';
const WORLD_FAIR_LOCK_NAME = 'cresco-worlds-fair-operator-lab-live-lock';

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

function allowedOrigin(request, env = {}) {
  const configured =
    env.CRESCO_CORS_ORIGIN ||
    process.env.CRESCO_CORS_ORIGIN ||
    DEFAULT_CRESCO_ORIGIN;
  const origin = request.headers.get('origin');

  if (!origin) return configured;
  return origin === configured ? origin : configured;
}

function withCors(headers, request, env) {
  const next = new Headers(headers ?? {});
  next.set('access-control-allow-origin', allowedOrigin(request, env));
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

export default {
  async fetch(request, env) {
    return handleCrescoCloudflareRequest(request, env);
  }
};
