/**
 * Strict fictional-practice API for the NEW Family-only Worker.
 * No access to legacy Colosseum routes, Family Devnet tokens or money APIs.
 */
import { practiceTokenHash } from './cloudflare-family-practice-state.mjs';

export const PRACTICE_PREFIX = '/api/family-practice/v1';
const originPattern = /^https:\/\/[-a-z0-9.]+$/i;
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const sessionRoute = new RegExp('^' + PRACTICE_PREFIX + '/sessions/(' + UUID + ')(/.*)?$');
const allowedMethods = new Set(['GET', 'POST', 'OPTIONS']);
const serialize = (body, status, request, env) => {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store', 'vary': 'Origin',
    'x-content-type-options': 'nosniff'
  });
  const o = request.headers.get('origin');
  if (o && o === env.CRESCO_FAMILY_WEB_ORIGIN) headers.set('access-control-allow-origin', o);
  return new Response(JSON.stringify(body), { status, headers });
};
const failure = (code, status, request, env) =>
  serialize({ error: code, realFinancialAction: false }, status, request, env);

function newSecret() {
  return 'pr_' + Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, '0')).join('');
}

function validBinding(env) {
  return env.FAMILY_PRACTICE_STATE &&
    typeof env.FAMILY_PRACTICE_STATE.idFromName === 'function' &&
    typeof env.FAMILY_PRACTICE_STATE.get === 'function';
}

export async function handleFamilyPracticeRequest(request, env) {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith(PRACTICE_PREFIX + '/')) return failure('NOT_FOUND', 404, request, env);
  if (!allowedMethods.has(request.method)) return failure('METHOD_NOT_ALLOWED', 405, request, env);
  if (!originPattern.test(env.CRESCO_FAMILY_WEB_ORIGIN || '')) {
    return failure('PRACTICE_ORIGIN_UNCONFIGURED', 503, request, env);
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== env.CRESCO_FAMILY_WEB_ORIGIN) {
    return failure('PRACTICE_ORIGIN_FORBIDDEN', 403, request, env);
  }
  if (!validBinding(env)) return failure('PRACTICE_STORAGE_UNAVAILABLE', 503, request, env);

  if (request.method === 'OPTIONS') {
    const headers = new Headers({
      'cache-control': 'no-store', 'vary': 'Origin',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization,x-cresco-family-practice-invite,x-practice-action-id',
      'access-control-max-age': '0'
    });
    if (origin === env.CRESCO_FAMILY_WEB_ORIGIN) headers.set('access-control-allow-origin', origin);
    return new Response(null, { status: 204, headers });
  }
  if (request.method === 'POST' && pathname === PRACTICE_PREFIX + '/sessions') {
    if (!env.CRESCO_FAMILY_PRACTICE_INVITE_TOKEN || typeof env.CRESCO_FAMILY_PRACTICE_INVITE_TOKEN !== 'string') {
      return failure('PRACTICE_INVITE_UNCONFIGURED', 503, request, env);
    }
    const invite = request.headers.get('x-cresco-family-practice-invite');
    // Compare digests rather than simple variable-length token strings.
    if (!invite || invite.length < 16 || invite.length > 256 ||
      await practiceTokenHash(invite) !== await practiceTokenHash(env.CRESCO_FAMILY_PRACTICE_INVITE_TOKEN)) {
      return failure('PRACTICE_INVITE_INVALID', 401, request, env);
    }
    const id = crypto.randomUUID();
    const teenToken = newSecret();
    const parentToken = newSecret();
    const stub = env.FAMILY_PRACTICE_STATE.get(env.FAMILY_PRACTICE_STATE.idFromName('practice:' + id));
    try {
      const result = await stub.fetch('https://practice.internal/initialize', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id, teenHash: await practiceTokenHash(teenToken),
          parentHash: await practiceTokenHash(parentToken)
        })
      });
      if (result.status !== 201) return failure('PRACTICE_CREATE_UNAVAILABLE', 503, request, env);
      return serialize({
        practiceId: id, parentToken, teenToken, expiresAfterDays: 7,
        notice: 'Fictional credits only. Each role must use its own access code. Neither code proves legal guardianship.'
      }, 201, request, env);
    } catch {
      return failure('PRACTICE_CREATE_UNAVAILABLE', 503, request, env);
    }
  }

  const match = pathname.match(sessionRoute);
  if (!match) return failure('PRACTICE_ROUTE_NOT_FOUND', 404, request, env);
  const subpath = match[2] || '';
  const legalRead = request.method === 'GET' && subpath === '';
  const legalWrite = request.method === 'POST' &&
    (subpath === '/save' || subpath === '/request' ||
      new RegExp('^/requests/' + UUID + '/decision$').test(subpath));
  if (!legalRead && !legalWrite) return failure('PRACTICE_ROUTE_NOT_FOUND', 404, request, env);
  if (legalWrite) {
    const length = Number(request.headers.get('content-length') || '0');
    if (length > 512) return failure('PRACTICE_BODY_TOO_LARGE', 413, request, env);
  }
  if (!/^Bearer pr_[a-f0-9]{64}$/.test(request.headers.get('authorization') || '')) {
    return failure('PRACTICE_ROLE_REQUIRED', 401, request, env);
  }
  const stub = env.FAMILY_PRACTICE_STATE.get(
    env.FAMILY_PRACTICE_STATE.idFromName('practice:' + match[1])
  );
  let body;
  if (legalWrite) {
    body = await request.text();
    if (body.length > 512) return failure('PRACTICE_BODY_TOO_LARGE', 413, request, env);
  }
  try {
    const result = await stub.fetch('https://practice.internal' + (legalRead ? '/state' : subpath), {
      method: request.method,
      headers: {
        'authorization': request.headers.get('authorization'),
        ...(legalWrite ? {
          'content-type': 'application/json',
          'x-practice-action-id': request.headers.get('x-practice-action-id') || ''
        } : {})
      },
      ...(legalWrite ? { body } : {})
    });
    const response = new Response(result.body, {
      status: result.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
        'vary': 'Origin', 'x-content-type-options': 'nosniff' }
    });
    if (origin === env.CRESCO_FAMILY_WEB_ORIGIN) response.headers.set('access-control-allow-origin', origin);
    return response;
  } catch {
    return failure('PRACTICE_READ_UNVERIFIED', 503, request, env);
  }
}
