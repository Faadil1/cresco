// CRESCO operator tools for AI agents (MCP). Transport-free so it can be tested
// without a model: each tool is { name, description, inputSchema, run(args) }.
//
// The agent holds ONLY the operator role token. It can act inside the standing
// mandate and file one exact exception request. It cannot approve, widen its
// limits, pause or revoke: those need the principal (and, in principal-wallet
// mode, the principal's own wallet signature). The CRESCO program on Solana
// enforces the limit, not this file.

const PREFIX = '/api/v0.4/worlds-fair';

export function createCrescoOperatorTools({
  apiUrl,
  workspaceId,
  operatorToken,
  fetchImpl = globalThis.fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  newKey = () => `mcp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}) {
  if (!apiUrl) throw new Error('CRESCO_API_URL is required');
  if (!/^[a-z0-9-]{6,64}$/.test(String(workspaceId ?? ''))) throw new Error('CRESCO_WORKSPACE_ID is required');
  if (!operatorToken) throw new Error('CRESCO_OPERATOR_TOKEN is required');
  const base = `${String(apiUrl).replace(/\/+$/, '')}${PREFIX}/workspaces/${workspaceId}`;

  async function call(method, path, { body, idempotencyKey } = {}) {
    const res = await fetchImpl(`${base}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${operatorToken}`,
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    let json = {};
    try {
      json = await res.json();
    } catch {
      json = {};
    }
    return { status: res.status, body: json };
  }

  const usd = (micro) => (Number.isFinite(Number(micro)) ? `$${(Number(micro) / 1e6).toFixed(2)}` : 'unknown');
  const toBase = (amountUsd) => Math.round(Number(amountUsd) * 1e6);

  function requestSummary(req) {
    if (!req) return null;
    return {
      requestId: req.id,
      status: req.status,
      amount: usd(req.intent?.inputAmount),
      requestedNotional: usd(req.requestedNotionalMicroUsd),
      standingLimit: usd(req.standingMaxNotionalMicroUsd),
      expiresAt: req.expiresAt,
      grantSignature: req.grant?.signature ?? null,
      executionSignature: req.execution?.signature ?? null,
      standingAuthorityChanged: req.execution?.standingAuthorityChanged ?? null
    };
  }

  const tools = [
    {
      name: 'cresco_get_mandate',
      description:
        'Read your standing mandate on Solana: per-action limit, period cap, how much of the period is used, and whether the mandate is ACTIVE. Call this before acting.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      async run() {
        const { status, body } = await call('GET', '/mandate');
        if (status !== 200) return { ok: false, error: body.error ?? `HTTP_${status}` };
        return {
          ok: true,
          status: body.mandate?.status ?? 'UNKNOWN',
          standingLimitPerAction: usd(body.mandate?.maxActionNotionalMicroUsd),
          periodCap: usd(body.mandate?.maxPeriodNotionalMicroUsd),
          periodUsed: usd(body.consumption?.spentNotionalMicroUsd),
          periodEndsAt: body.consumption?.periodEndsAt ?? null,
          observedAt: body.observedAt
        };
      }
    },
    {
      name: 'cresco_submit_intent',
      description: [
        'Swap devUSDC to devUSDT on Solana Devnet under your mandate. Outcomes:',
        'ALLOW: inside your standing limit, executed now (receipt signature returned).',
        'PENDING_PRINCIPAL: above your per-action limit. One exact exception request was filed for the principal. Do NOT split the trade into smaller ones to get around the limit: tell the user and wait with cresco_wait_for_decision.',
        'REFUSE: a hard boundary (paused mandate, period cap, unsupported action). There is no exception path; stop.',
        'UNKNOWN: the outcome is not confirmed. Do not resubmit; report it.'
      ].join(' '),
      inputSchema: {
        type: 'object',
        properties: {
          amountUsd: { type: 'number', exclusiveMinimum: 0, description: 'Amount of devUSDC to swap, in dollars (6 decimals on chain).' },
          maxSlippageBps: { type: 'integer', minimum: 1, maximum: 300, default: 100 },
          reason: { type: 'string', maxLength: 80, description: 'Short reason shown to the principal with any exception request.' }
        },
        required: ['amountUsd'],
        additionalProperties: false
      },
      async run({ amountUsd, maxSlippageBps = 100, reason } = {}) {
        const inputAmount = toBase(amountUsd);
        if (!Number.isSafeInteger(inputAmount) || inputAmount <= 0) return { ok: false, error: 'INTENT_AMOUNT_INVALID' };
        const { status, body } = await call('POST', '/intents', {
          body: { action: 'SWAP_EXACT_IN', inputAmount, maxSlippageBps, ...(reason ? { clientReference: String(reason).slice(0, 80) } : {}) },
          idempotencyKey: newKey()
        });
        if (body.decision === 'ALLOW') {
          return { ok: true, decision: 'ALLOW', executed: true, signature: body.receipt?.signature, explorer: body.receipt?.explorer, notional: usd(body.receipt?.quote?.notionalMicroUsd) };
        }
        if (body.decision === 'PENDING_PRINCIPAL') {
          return {
            ok: true,
            decision: 'PENDING_PRINCIPAL',
            executed: false,
            request: requestSummary(body.request),
            violated: body.policyDiff?.violatedDimensions ?? [],
            next: 'Tell the user an exact exception request is waiting for the principal. Then call cresco_wait_for_decision with this requestId. Do not split the trade.'
          };
        }
        if (body.decision === 'REFUSE') {
          return { ok: true, decision: 'REFUSE', executed: false, boundary: body.boundary, code: body.code, exceptionAvailable: false };
        }
        if (body.decision === 'UNKNOWN') {
          return { ok: true, decision: 'UNKNOWN', executed: null, next: 'Outcome not confirmed. Do not resubmit. Report it; the principal can reconcile.' };
        }
        return { ok: false, error: body.error ?? `HTTP_${status}`, message: body.message ?? null };
      }
    },
    {
      name: 'cresco_get_request',
      description: 'Current status of one exception request (PENDING, EXECUTED, REFUSED_BY_PRINCIPAL, STALE, EXPIRED, ...).',
      inputSchema: { type: 'object', properties: { requestId: { type: 'string' } }, required: ['requestId'], additionalProperties: false },
      async run({ requestId } = {}) {
        const { status, body } = await call('GET', '/requests');
        if (status !== 200) return { ok: false, error: body.error ?? `HTTP_${status}` };
        const req = (body.requests ?? []).find((r) => r.id === requestId);
        return req ? { ok: true, request: requestSummary(req) } : { ok: false, error: 'REQUEST_NOT_FOUND' };
      }
    },
    {
      name: 'cresco_wait_for_decision',
      description: 'Wait (up to timeoutSeconds, max 120) for the principal to decide an exception request. Returns as soon as it leaves PENDING/EXECUTING.',
      inputSchema: {
        type: 'object',
        properties: { requestId: { type: 'string' }, timeoutSeconds: { type: 'integer', minimum: 5, maximum: 120, default: 60 } },
        required: ['requestId'],
        additionalProperties: false
      },
      async run({ requestId, timeoutSeconds = 60 } = {}) {
        const deadline = Date.now() + Math.min(120, Math.max(5, Number(timeoutSeconds))) * 1000;
        let last = null;
        while (Date.now() < deadline) {
          const res = await tools[2].run({ requestId });
          if (!res.ok) return res;
          last = res.request;
          if (!['PENDING', 'EXECUTING'].includes(last.status)) return { ok: true, decided: true, request: last };
          await sleep(3000);
        }
        return { ok: true, decided: false, request: last, next: 'Still waiting for the principal. Ask the user whether to keep waiting.' };
      }
    },
    {
      name: 'cresco_history',
      description: 'Recent workspace events with Solana Explorer receipts (standing executions, exception requests, decisions, lifecycle changes).',
      inputSchema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 50, default: 15 } }, additionalProperties: false },
      async run({ limit = 15 } = {}) {
        const { status, body } = await call('GET', `/history?limit=${Math.min(50, Math.max(1, Number(limit)))}`);
        if (status !== 200) return { ok: false, error: body.error ?? `HTTP_${status}` };
        return {
          ok: true,
          events: (body.events ?? []).map((e) => ({ at: e.at, type: e.type, actor: e.actor, summary: e.summary, receipts: (e.signatures ?? []).map((s) => s.explorer ?? s.signature) }))
        };
      }
    }
  ];
  return tools;
}
