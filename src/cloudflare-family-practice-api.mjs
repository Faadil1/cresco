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
function validQuotaBinding(env) {
  return env.FAMILY_PRACTICE_INVITE_GUARD &&
    typeof env.FAMILY_PRACTICE_INVITE_GUARD.idFromName === 'function' &&
    typeof env.FAMILY_PRACTICE_INVITE_GUARD.get === 'function';
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
    // One global persistent quota: concurrent valid invitations cannot bypass the cap.
    // A reserved slot is consumed even if creating the practice later fails.
    if (!validQuotaBinding(env)) return failure('PRACTICE_QUOTA_UNAVAILABLE', 503, request, env);
    try {
      const guard = env.FAMILY_PRACTICE_INVITE_GUARD.get(
        env.FAMILY_PRACTICE_INVITE_GUARD.idFromName('practice-invites-global-v1'));
      const reservation = await guard.fetch('https://practice.internal/reserve', { method: 'POST' });
      if (reservation.status === 429) return failure('PRACTICE_RESEARCH_CAP_REACHED', 429, request, env);
      if (reservation.status !== 200) return failure('PRACTICE_QUOTA_UNAVAILABLE', 503, request, env);
    } catch {
      return failure('PRACTICE_QUOTA_UNAVAILABLE', 503, request, env);
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
    (subpath === '/save' || subpath === '/request' || subpath === '/close' ||
      subpath === '/teen/rotate' || subpath === '/emergency-close' ||
      new RegExp('^/requests/' + UUID + '/decision' + String.fromCharCode(36)).test(subpath));
  if (!legalRead && !legalWrite) return failure('PRACTICE_ROUTE_NOT_FOUND', 404, request, env);
  if (legalWrite) {
    const length = Number(request.headers.get('content-length') || '0');
    if (length > 512) return failure('PRACTICE_BODY_TOO_LARGE', 413, request, env);
  }
  // Emergency close is an operator-only destructive action. It is intentionally
  // separate from Parent identity and requires a distinct Worker secret.
  if (request.method === 'POST' && subpath === '/emergency-close') {
    // This operation is for a trusted operator CLI, never a web browser.
    if (origin) return failure('PRACTICE_OPERATOR_BROWSER_FORBIDDEN', 403, request, env);
    const expected = env.CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN;
    const supplied = request.headers.get('x-cresco-family-practice-operator');
    if (!expected || typeof expected !== 'string' || expected.length < 32) {
      return failure('PRACTICE_OPERATOR_UNCONFIGURED', 503, request, env);
    }
    if (!supplied || supplied.length < 32 || supplied.length > 256 ||
      await practiceTokenHash(supplied) !== await practiceTokenHash(expected)) {
      return failure('PRACTICE_OPERATOR_UNAUTHORIZED', 401, request, env);
    }
    const stub = env.FAMILY_PRACTICE_STATE.get(
      env.FAMILY_PRACTICE_STATE.idFromName('practice:' + match[1]));
    try {
      const closed = await stub.fetch('https://practice.internal/emergency-close', { method: 'POST' });
      if (closed.status === 404) return failure('PRACTICE_NOT_FOUND', 404, request, env);
      if (closed.status !== 200) return failure('PRACTICE_EMERGENCY_UNVERIFIED', 503, request, env);
      return serialize({ closed: true, allRoleCodesRevoked: true,
        fictionalHistoryCleared: true, initiatedBy: 'operator' }, 200, request, env);
    } catch { return failure('PRACTICE_EMERGENCY_UNVERIFIED', 503, request, env); }
  }
  if (!/^Bearer pr_[a-f0-9]{64}$/.test(request.headers.get('authorization') || '')) {
    return failure('PRACTICE_ROLE_REQUIRED', 401, request, env);
  }
  const stub = env.FAMILY_PRACTICE_STATE.get(
    env.FAMILY_PRACTICE_STATE.idFromName('practice:' + match[1])
  );
  let body;
  let newTeenToken = null;
  if (legalWrite && subpath === '/teen/rotate') {
    // Generate at the edge, store only a hash in the practice DO.
    newTeenToken = newSecret();
    body = JSON.stringify({ newHash: await practiceTokenHash(newTeenToken) });
  } else if (legalWrite) {
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
    if (newTeenToken) {
      if (result.status !== 200) return response;
      const outcome = await response.clone().json().catch(() => null);
      if (!outcome?.rotated) return failure('PRACTICE_ROTATION_UNVERIFIED', 503, request, env);
      return serialize({ rotated: true, teenToken: newTeenToken,
        notice: 'Previous Teen role code is revoked. Store this new code privately; it is shown once.' }, 200, request, env);
    }
    return response;
  } catch {
    return failure('PRACTICE_READ_UNVERIFIED', 503, request, env);
  }
}
