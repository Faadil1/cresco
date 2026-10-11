import { routeCrescoHttp } from './http-api.mjs';
import { handleFamilyApi } from './cloudflare-family-api.mjs';
import { FamilyState } from './cloudflare-family-state.mjs';
import { configuredWorldFairOrcaProviderFromEnv } from './worlds-fair-orca-provider.mjs';
export { FamilyState };

const DEFAULT_CRESCO_ORIGINS = Object.freeze([
  'https://cresco-lac.vercel.app',
  'https://cresco.faadil-casecraft.workers.dev'
]);
const WORLD_FAIR_LOCK_NAME = 'cresco-worlds-fair-operator-lab-live-lock';
const WORLD_FAIR_WORKFLOW_NAME =
  'cresco-worlds-fair-operator-principal-workflow-v1';

function worldFairLockStub(env = {}) {
  if (!env.FAMILY_STATE) return null;
  const id = env.FAMILY_STATE.idFromName(WORLD_FAIR_LOCK_NAME);
  return env.FAMILY_STATE.get(id);
}

async function worldFairLockCall(env, path, requestId, outcomeStatus = null) {
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
          : JSON.stringify({ requestId, outcomeStatus })
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

function worldFairWorkflowStub(env = {}) {
  if (!env.FAMILY_STATE) return null;
  const id = env.FAMILY_STATE.idFromName(WORLD_FAIR_WORKFLOW_NAME);
  return env.FAMILY_STATE.get(id);
}

async function worldFairWorkflowStoreCall(
  env,
  path,
  method = 'GET',
  body = null
) {
  const stub = worldFairWorkflowStub(env);
  if (!stub) {
    const error = new Error('WORLD_FAIR_WORKFLOW_STORE_UNAVAILABLE');
    error.code = 'WORLD_FAIR_WORKFLOW_STORE_UNAVAILABLE';
    error.httpStatus = 503;
    throw error;
  }

  const response = await stub.fetch(
    'https://worlds-fair-workflow.internal' + path,
    {
      method,
      headers: { 'content-type': 'application/json' },
      body: body == null ? undefined : JSON.stringify(body)
    }
  );

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(
      payload?.error ?? 'WORLD_FAIR_WORKFLOW_STORE_FAILURE'
    );
    error.code =
      payload?.error ?? 'WORLD_FAIR_WORKFLOW_STORE_FAILURE';
    error.httpStatus = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}

function configuredWorldFairWorkflowStore(env = {}) {
  if (!env.FAMILY_STATE) return null;

  return {
    list() {
      return worldFairWorkflowStoreCall(
        env,
        '/worlds-fair-workflow/intents'
      ).then((body) => body?.intents ?? []);
    },
    get(id) {
      return worldFairWorkflowStoreCall(
        env,
        `/worlds-fair-workflow/intents/${encodeURIComponent(id)}`
      ).catch((error) => {
        if (error?.httpStatus === 404) return null;
        throw error;
      });
    },
    create(record) {
      return worldFairWorkflowStoreCall(
        env,
        '/worlds-fair-workflow/intents',
        'POST',
        { record }
      );
    },
    update(id, record, expectedRevision) {
      return worldFairWorkflowStoreCall(
        env,
        `/worlds-fair-workflow/intents/${encodeURIComponent(id)}`,
        'PUT',
        { record, expectedRevision }
      );
    }
  };
}

function resolveWorldFairActor(request, env = {}) {
  const operatorToken = String(
    env.WORLD_FAIR_OPERATOR_ACCESS_TOKEN ?? ''
  );
  const principalToken = String(
    env.WORLD_FAIR_PRINCIPAL_ACCESS_TOKEN ?? ''
  );
  const configured =
    operatorToken.length >= 16 && principalToken.length >= 16;

  if (!configured) {
    return { configured: false, role: null };
  }

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ')
    ? header.slice('Bearer '.length).trim()
    : '';

  if (token && token === operatorToken) {
    return { configured: true, role: 'operator' };
  }
  if (token && token === principalToken) {
    return { configured: true, role: 'principal' };
  }

  return { configured: true, role: null };
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
    const isWorldFairWorkflow =
      path.startsWith('/api/v0.3/worlds-fair/workflow');
    const worldFairActorAuth = isWorldFairWorkflow
      ? resolveWorldFairActor(request, env)
      : null;

    if (isWorldFairWorkflow && !worldFairActorAuth?.configured) {
      return new Response(
        JSON.stringify({
          contractVersion: '0.3',
          type: 'WORLD_FAIR_WORKFLOW_AUTH',
          status: 'BLOCKED',
          error: 'WORLD_FAIR_ROLE_AUTH_UNAVAILABLE',
          requiredServerSecrets: [
            'WORLD_FAIR_OPERATOR_ACCESS_TOKEN',
            'WORLD_FAIR_PRINCIPAL_ACCESS_TOKEN'
          ]
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

    if (isWorldFairWorkflow && !worldFairActorAuth?.role) {
      return new Response(
        JSON.stringify({
          contractVersion: '0.3',
          type: 'WORLD_FAIR_WORKFLOW_AUTH',
          status: 'REFUSED',
          error: 'WORLD_FAIR_ROLE_UNAUTHORIZED'
        }),
        {
          status: 401,
          headers: withCors(
            { 'content-type': 'application/json; charset=utf-8' },
            request,
            env
          )
        }
      );
    }

    if (request.method === 'GET' &&
        path === '/api/v0.3/worlds-fair/run-status') {
      const snapshot = await worldFairLockCall(
        env, '/worlds-fair-lock', null
      ).catch(() => null);
      const ok = snapshot?.status === 200;
      return new Response(JSON.stringify({
        contractVersion: '0.3',
        type: 'WORLD_FAIR_RUN_STATUS',
        ...(ok ? snapshot.body : {
          status: 'UNKNOWN', recoveryRequired: true
        })
      }), {
        status: ok ? 200 : 503,
        headers: withCors({
          'content-type': 'application/json; charset=utf-8'
        }, request, env)
      });
    }

    const isWorldFairRun =
      request.method === 'POST' &&
      path === '/api/v0.3/worlds-fair/run';
    const isWorldFairWorkflowMutation =
      isWorldFairWorkflow &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    const requiresWorldFairLease =
      isWorldFairRun || isWorldFairWorkflowMutation;

    let worldFairLeaseId = null;
    if (requiresWorldFairLease) {
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
        if (!lease || lease.body?.recoveryRequired === true ||
            lease.status !== 409) {
          return new Response(JSON.stringify({
            contractVersion: '0.3',
            type: 'WORLD_FAIR_OPERATOR_LAB_RUN',
            status: 'UNKNOWN',
            error: 'WORLD_FAIR_STATE_RECONCILIATION_REQUIRED',
            reasonCode: lease?.body?.reasonCode || 'LOCK_STATE_UNKNOWN',
            recoveryRequired: true,
            receipt: null
          }), {
            status: 503,
            headers: withCors({
              'content-type': 'application/json; charset=utf-8'
            }, request, env)
          });
        }
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

    let worldFairOutcomeStatus = 'UNKNOWN';
    try {
      const routeServices = { ...services };
      if (
        path.startsWith('/api/v0.3/worlds-fair/') &&
        !routeServices.worldFairExecutionProvider
      ) {
        routeServices.worldFairExecutionProvider =
          configuredWorldFairOrcaProviderFromEnv(env);
      }

      if (isWorldFairWorkflow) {
        routeServices.worldFairWorkflowStore ??=
          configuredWorldFairWorkflowStore(env);
        routeServices.worldFairActor = {
          role: worldFairActorAuth.role
        };
        routeServices.worldFairActorAuthConfigured =
          worldFairActorAuth.configured;
      }

      const result = await routeCrescoHttp({
        method: request.method,
        path,
        body,
        services: routeServices
      });

      if (isWorldFairRun) {
        if (result.status === 200 && result.body?.status === 'PASS') {
          worldFairOutcomeStatus = 'PASS';
        } else if (result.status === 400 && result.body?.status === 'REFUSED') {
          worldFairOutcomeStatus = 'REFUSED';
        }
      }
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
          worldFairLeaseId,
          worldFairOutcomeStatus
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
