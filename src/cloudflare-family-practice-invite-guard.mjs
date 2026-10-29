/**
 * Single shared Durable Object for bounded, invitation-only fictional research.
 * No access codes, addresses, ages, emails, children or wallet material stored.
 * Reservations are deliberately consumed even when a later create fails.
 */
const PER_UTC_DAY = 6;
const PER_WINDOW = 20;
const WINDOW_MS = 32 * 24 * 60 * 60 * 1000;
const result = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

export class CrescoFamilyPracticeInviteGuard {
  constructor(ctx) { this.ctx = ctx; }

  async fetch(request) {
    if (typeof this.ctx.blockConcurrencyWhile === 'function') {
      return this.ctx.blockConcurrencyWhile(() => this.handleRequest(request));
    }
    return this.handleRequest(request);
  }

  async handleRequest(request) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/reserve') {
      return result(404, { error: 'INVITE_GUARD_ROUTE_FORBIDDEN' });
    }
    const now = Date.now();
    const today = new Date(now).toISOString().slice(0, 10);
    let state = await this.ctx.storage.get('invite-reservations:v1');
    if (!state || now >= state.startedAt + WINDOW_MS) {
      state = { startedAt: now, day: today, dayUsed: 0, windowUsed: 0 };
    } else if (state.day !== today) {
      state.day = today;
      state.dayUsed = 0;
    }
    if (state.dayUsed >= PER_UTC_DAY || state.windowUsed >= PER_WINDOW) {
      return result(429, { error: 'PRACTICE_RESEARCH_CAP_REACHED' });
    }
    state.dayUsed++;
    state.windowUsed++;
    await this.ctx.storage.setAlarm(state.startedAt + WINDOW_MS);
    await this.ctx.storage.put('invite-reservations:v1', state);
    return result(200, { reserved: true });
  }

  async alarm() {
    const state = await this.ctx.storage.get('invite-reservations:v1');
    if (!state) {
      await this.ctx.storage.deleteAll();
      return;
    }
    const expiry = state.startedAt + WINDOW_MS;
    if (Date.now() < expiry) {
      await this.ctx.storage.setAlarm(expiry);
      return;
    }
    await this.ctx.storage.deleteAll();
  }
}
