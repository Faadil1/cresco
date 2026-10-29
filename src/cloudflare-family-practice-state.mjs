/**
 * Isolated, persistent *fictional-credit* practice state.
 * Distinct Cloudflare Durable Object class/namespace from the Family Devnet lab.
 * No Solana, wallet, deposits, tokens, child data, investing or financial authority.
 */
const credits = 100;
const lifetimeMs = 7 * 24 * 60 * 60 * 1000;
const maxEvents = 50;
const validReason = new Set(['LEARN_TOGETHER', 'NOT_RIGHT_NOW', 'NEEDS_MORE_INFORMATION']);
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

export async function practiceTokenHash(token) {
  const bytes = new TextEncoder().encode('cresco-family-practice-v1:' + token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function publicState(s, role) {
  return {
    contract: 'CRESCO_FAMILY_PRACTICE_1',
    kind: 'FICTIONAL_CREDITS_ONLY',
    role,
    practiceId: s.id,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    version: s.version,
    availableCredits: s.available,
    savedCredits: s.saved,
    requests: s.requests.map((r) => ({ ...r })),
    events: s.events.slice(-maxEvents),
    truthBoundary: {
      realMoney: false, crypto: false, stocks: false, yield: false,
      blockchainWrites: false, guardianIdentityVerified: false,
      thisIsLegalConsent: false
    }
  };
}

export class CrescoFamilyPracticeState {
  constructor(ctx) { this.ctx = ctx; }

  async fetch(request) {
    // Serialize each read-modify-write against concurrent device actions.
    // DOs are single-threaded, but async storage I/O can still interleave.
    if (typeof this.ctx.blockConcurrencyWhile === 'function') {
      return this.ctx.blockConcurrencyWhile(() => this.handleRequest(request));
    }
    return this.handleRequest(request);
  }

  async handleRequest(request) {
    if (request.method !== 'POST' && request.method !== 'GET') {
      return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
    }
    const path = new URL(request.url).pathname;
    let s = await this.ctx.storage.get('practice:v1');
    if (request.method === 'POST' && path === '/initialize') {
      if (s) return json({ error: 'PRACTICE_ALREADY_EXISTS' }, 409);
      const body = await request.json().catch(() => null);
      if (!body || !/^[0-9a-f-]{36}$/.test(body.id ?? '') ||
        !/^[0-9a-f]{64}$/.test(body.teenHash ?? '') ||
        !/^[0-9a-f]{64}$/.test(body.parentHash ?? '') ||
        body.teenHash === body.parentHash) {
        return json({ error: 'PRACTICE_INITIALIZATION_INVALID' }, 400);
      }
      const created = new Date().toISOString();
      s = {
        id: body.id, createdAt: created,
        expiresAt: new Date(Date.now() + lifetimeMs).toISOString(),
        teenHash: body.teenHash, parentHash: body.parentHash,
        available: credits, saved: 0, version: 0,
        requests: [], events: [], seenActions: {}
      };
      await this.ctx.storage.put('practice:v1', s);
      return json({ created: true, practiceId: s.id }, 201);
    }
    if (!s) return json({ error: 'PRACTICE_NOT_FOUND' }, 404);
    if (Date.now() >= Date.parse(s.expiresAt)) return json({ error: 'PRACTICE_EXPIRED' }, 410);
    const bearer = request.headers.get('authorization') || '';
    if (!/^Bearer pr_[a-f0-9]{64}$/.test(bearer)) return json({ error: 'ROLE_REQUIRED' }, 401);
    const hash = await practiceTokenHash(bearer.slice(7));
    const role = hash === s.teenHash ? 'teen' : hash === s.parentHash ? 'parent' : null;
    if (!role) return json({ error: 'ROLE_INVALID' }, 403);
    if (request.method === 'GET' && path === '/state') return json(publicState(s, role));

    const key = request.headers.get('x-practice-action-id') || '';
    if (request.method !== 'POST' || !/^[0-9a-f-]{36}$/.test(key)) {
      return json({ error: 'PRACTICE_ACTION_ID_REQUIRED' }, 400);
    }
    // Safe replay returns the previous result. A key must not be repurposed.
    let body;
    try { body = await request.json(); } catch { return json({ error: 'JSON_INVALID' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'JSON_INVALID' }, 400);
    const fingerprint = JSON.stringify({ path, body, role });
    const prior = s.seenActions[key];
    if (prior) {
      return prior.fingerprint === fingerprint
        ? json(publicState(s, role))
        : json({ error: 'IDEMPOTENCY_CONFLICT' }, 409);
    }
    if (Object.keys(s.seenActions).length >= 80) {
      return json({ error: 'PRACTICE_ACTION_CAP_REACHED' }, 429);
    }

    const at = new Date().toISOString();
    if (path === '/save') {
      if (role !== 'teen') return json({ error: 'TEEN_ONLY' }, 403);
      if (Object.keys(body).length !== 1 || body.credits !== 20) {
        return json({ error: 'ONLY_TWENTY_FICTIONAL_CREDITS' }, 400);
      }
      if (s.available < 20) return json({ error: 'INSUFFICIENT_PRACTICE_CREDITS' }, 409);
      s.available -= 20;
      s.saved += 20;
      s.events.push({ id: key, at, actor: 'teen', type: 'PRACTICE_SAVED', credits: 20 });
    } else if (path === '/request') {
      if (role !== 'teen') return json({ error: 'TEEN_ONLY' }, 403);
      if (Object.keys(body).length !== 1 || body.topic !== 'DIVERSIFIED_FUNDS') {
        return json({ error: 'PRACTICE_TOPIC_NOT_ALLOWED' }, 400);
      }
      if (s.requests.some((r) => r.status === 'PENDING')) {
        return json({ error: 'REQUEST_ALREADY_PENDING' }, 409);
      }
      if (s.requests.length >= 10) return json({ error: 'PRACTICE_REQUEST_CAP_REACHED' }, 429);
      s.requests.push({
        id: key, at, topic: 'DIVERSIFIED_FUNDS', status: 'PENDING',
        decisionAt: null, reason: null
      });
      s.events.push({ id: key, at, actor: 'teen', type: 'DISCUSSION_REQUESTED' });
    } else if (path.startsWith('/requests/') && path.endsWith('/decision')) {
      if (role !== 'parent') return json({ error: 'PARENT_ONLY' }, 403);
      const match = path.match(/^\/requests\/([0-9a-f-]{36})\/decision$/);
      if (!match || !['APPROVE_DISCUSSION', 'DECLINE'].includes(body.decision) ||
        !validReason.has(body.reason) || Object.keys(body).length !== 2) {
        return json({ error: 'PRACTICE_DECISION_INVALID' }, 400);
      }
      const target = s.requests.find((r) => r.id === match[1]);
      if (!target) return json({ error: 'REQUEST_NOT_FOUND' }, 404);
      if (target.status !== 'PENDING') return json({ error: 'REQUEST_ALREADY_DECIDED' }, 409);
      target.status = body.decision;
      target.reason = body.reason;
      target.decisionAt = at;
      s.events.push({
        id: key, at, actor: 'parent',
        type: body.decision === 'DECLINE' ? 'DISCUSSION_DECLINED' : 'DISCUSSION_APPROVED',
        requestId: target.id, reason: body.reason
      });
    } else {
      return json({ error: 'PRACTICE_ROUTE_NOT_FOUND' }, 404);
    }
    s.version += 1;
    s.events = s.events.slice(-maxEvents);
    s.seenActions[key] = { fingerprint };
    await this.ctx.storage.put('practice:v1', s);
    return json(publicState(s, role));
  }
}
