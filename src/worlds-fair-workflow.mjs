// CRESCO World's Fair — operator / principal / risk-owner workflow (v0.4).
//
// Product loop (REAL_OPERATOR_PRINCIPAL_WORKFLOW_V1):
//   operator intent -> standing evaluation by the CRESCO program -> ALLOW, or
//   soft-boundary REFUSE + Policy Diff -> durable exception request ->
//   principal/risk decision (REFUSE, or APPROVE = exact one-use grant executed
//   once) -> durable receipt/history -> recovery (stale, expired, rollback,
//   UNKNOWN reconciliation).
//
// This module owns product state only. Authority stays on-chain: every ALLOW,
// refusal, grant and lifecycle change is decided by the CRESCO program through
// the injected chain adapter. Storage and chain are injected so the same core
// runs in the Cloudflare Worker (Durable Object storage), Node and tests.

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { ed25519 } from '@noble/curves/ed25519';
import { PublicKey } from '@solana/web3.js';

export const WORKFLOW_CONTRACT_VERSION = '0.4';
export const WORKFLOW_ROLES = Object.freeze(['operator', 'principal', 'risk']);
const EXPLORER = (sig) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

const DEFAULTS = Object.freeze({
  maxWorkspaces: 25,
  requestTtlSeconds: 30 * 60,
  maxEvents: 500,
  maxIdempotencyKeys: 300,
  walletSignatureMaxAgeSeconds: 5 * 60,
  webhookTimeoutMs: 3000
});

// Devnet safety envelope for principal-chosen policies (protects the shared
// Devnet guardian's funds; values are base units / micro-USD).
export const WORKSPACE_POLICY_BOUNDS = Object.freeze({
  maxActionNotionalMicroUsd: [50_000, 5_000_000],
  maxPeriodNotionalMicroUsd: [50_000, 20_000_000],
  maxActionAmount: [50_000, 5_000_000],
  maxPeriodAmount: [50_000, 20_000_000]
});

export const DEFAULT_WORKSPACE_POLICY = Object.freeze({
  maxActionNotionalMicroUsd: 500_000,
  maxPeriodNotionalMicroUsd: 10_000_000,
  maxActionAmount: 5_000_000,
  maxPeriodAmount: 10_000_000
});

export class WorkflowError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message ?? code);
    this.name = 'WorkflowError';
    this.httpStatus = status;
    this.code = code;
    this.extra = extra;
  }
}

const fail = (status, code, message, extra) => {
  throw new WorkflowError(status, code, message, extra);
};

const sha256 = (value) => createHash('sha256').update(String(value)).digest('hex');

export function createMemoryWorkflowStore() {
  const map = new Map();
  return {
    async get(key) {
      return map.has(key) ? JSON.parse(map.get(key)) : null;
    },
    async put(key, value) {
      map.set(key, JSON.stringify(value));
    }
  };
}

export function validateWorkspacePolicy(input = {}, base = DEFAULT_WORKSPACE_POLICY) {
  const policy = { ...base };
  for (const [key, [min, max]] of Object.entries(WORKSPACE_POLICY_BOUNDS)) {
    if (input[key] === undefined || input[key] === null) continue;
    const value = Number(input[key]);
    if (!Number.isSafeInteger(value) || value < min || value > max) {
      fail(400, 'POLICY_OUT_OF_BOUNDS', `${key} must be an integer in [${min}, ${max}]`, { field: key, min, max });
    }
    policy[key] = value;
  }
  if (policy.maxPeriodNotionalMicroUsd < policy.maxActionNotionalMicroUsd) {
    fail(400, 'POLICY_INCONSISTENT', 'maxPeriodNotionalMicroUsd must be >= maxActionNotionalMicroUsd');
  }
  if (policy.maxPeriodAmount < policy.maxActionAmount) {
    fail(400, 'POLICY_INCONSISTENT', 'maxPeriodAmount must be >= maxActionAmount');
  }
  return policy;
}

function cleanLabel(value, fallback) {
  const text = String(value ?? '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 60);
  return text || fallback;
}

function validateWebhook(url) {
  if (url === undefined || url === null || url === '') return null;
  let parsed;
  try {
    parsed = new URL(String(url));
  } catch {
    fail(400, 'WEBHOOK_INVALID', 'webhookUrl must be an absolute https URL');
  }
  if (parsed.protocol !== 'https:') fail(400, 'WEBHOOK_INVALID', 'webhookUrl must use https');
  const host = parsed.hostname;
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) || host.endsWith('.internal')) {
    fail(400, 'WEBHOOK_INVALID', 'webhookUrl must be a public host');
  }
  return parsed.toString();
}

export function walletBindingMessage({ workspaceId, issuedAt }) {
  return `CRESCO World's Fair principal wallet binding\nworkspace:${workspaceId}\nissuedAt:${issuedAt}`;
}

export function approvalMessage({ workspaceId, request, issuedAt }) {
  return [
    "CRESCO World's Fair exception approval",
    `workspace:${workspaceId}`,
    `request:${request.id}`,
    'decision:APPROVE',
    `pair:devUSDC->devUSDT`,
    `inputAmount:${request.intent.inputAmount}`,
    `maxSlippageBps:${request.intent.maxSlippageBps}`,
    `mandateNonce:${request.mandateNonce}`,
    `issuedAt:${issuedAt}`
  ].join('\n');
}

function decodeSignature(signature) {
  const text = String(signature ?? '');
  if (/^[0-9a-f]{128}$/i.test(text)) return Uint8Array.from(Buffer.from(text, 'hex'));
  try {
    const bytes = Buffer.from(text, 'base64');
    if (bytes.length === 64) return Uint8Array.from(bytes);
  } catch {
    /* fall through */
  }
  return null;
}

export function verifyWalletSignature({ publicKey, message, signature }) {
  let key;
  try {
    key = new PublicKey(String(publicKey)).toBytes();
  } catch {
    return false;
  }
  const sig = decodeSignature(signature);
  if (!sig) return false;
  try {
    return ed25519.verify(sig, new TextEncoder().encode(message), key);
  } catch {
    return false;
  }
}

function checkIssuedAt(issuedAt, nowMs, maxAgeSeconds) {
  const t = Date.parse(String(issuedAt ?? ''));
  if (!Number.isFinite(t)) fail(400, 'WALLET_SIGNATURE_ISSUED_AT_INVALID', 'issuedAt must be an ISO timestamp');
  if (Math.abs(nowMs - t) > maxAgeSeconds * 1000) {
    fail(401, 'WALLET_SIGNATURE_EXPIRED', `Signed message must be issued within ${maxAgeSeconds}s`);
  }
}

function explorerList(entries) {
  return entries
    .filter((e) => e && e.signature)
    .map((e) => ({ label: e.label, signature: e.signature, explorer: EXPLORER(e.signature) }));
}

export function createWorldFairWorkflow({
  store,
  chainFactory,
  clock = () => Date.now(),
  fetchImpl = typeof fetch === 'function' ? fetch : null,
  options = {}
}) {
  if (!store) throw new Error('WORKFLOW_STORE_REQUIRED');
  const cfg = { ...DEFAULTS, ...options };
  const nowIso = () => new Date(clock()).toISOString();

  const keys = {
    index: 'wf:index',
    ws: (id) => `wf:ws:${id}`,
    events: (id) => `wf:ws:${id}:events`,
    requests: (id) => `wf:ws:${id}:requests`,
    idem: (id) => `wf:ws:${id}:idem`
  };

  function chainFor(ws) {
    if (!chainFactory) fail(503, 'CHAIN_RUNTIME_UNAVAILABLE', 'Server Devnet runtime secrets are not configured', {
      requiredServerSecrets: ['DEVNET_KEYPAIR_JSON', 'PYTH_PRO_API_KEY', 'SOLANA_DEVNET_RPC_URL']
    });
    return chainFactory({ workspaceId: ws.id, policy: ws.policy });
  }

  async function loadWorkspace(id) {
    if (!/^[a-z0-9-]{6,64}$/.test(String(id ?? ''))) fail(404, 'WORKSPACE_NOT_FOUND', 'Unknown workspace');
    const ws = await store.get(keys.ws(id));
    if (!ws) fail(404, 'WORKSPACE_NOT_FOUND', 'Unknown workspace');
    return ws;
  }

  async function saveWorkspace(ws) {
    ws.updatedAt = nowIso();
    await store.put(keys.ws(ws.id), ws);
  }

  function authorize(ws, token, allowed) {
    const raw = String(token ?? '').replace(/^Bearer\s+/i, '').trim();
    if (!raw) fail(401, 'AUTH_REQUIRED', 'A role token is required (Authorization: Bearer <token>)');
    const hash = sha256(raw);
    const role = WORKFLOW_ROLES.find((r) => ws.tokens[r] === hash);
    if (!role) fail(401, 'AUTH_INVALID', 'Token is not valid for this workspace');
    if (!allowed.includes(role)) fail(403, 'ROLE_FORBIDDEN', `This action requires role: ${allowed.join(' or ')}`, { role });
    return role;
  }

  async function appendEvent(ws, event) {
    const list = (await store.get(keys.events(ws.id))) ?? [];
    const full = {
      id: `evt_${String(list.length + 1).padStart(5, '0')}_${randomBytes(3).toString('hex')}`,
      seq: (list.at(-1)?.seq ?? 0) + 1,
      at: nowIso(),
      ...event,
      signatures: explorerList(event.signatures ?? [])
    };
    list.push(full);
    await store.put(keys.events(ws.id), list.slice(-cfg.maxEvents));
    await deliverWebhook(ws, full);
    return full;
  }

  async function deliverWebhook(ws, event) {
    if (!ws.webhookUrl || !fetchImpl) return;
    if (!['EXCEPTION_REQUESTED', 'OUTCOME_UNKNOWN', 'EXCEPTION_EXECUTED', 'MANDATE_STATUS_CHANGED'].includes(event.type)) return;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), cfg.webhookTimeoutMs) : null;
    try {
      await fetchImpl(ws.webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-cresco-event': event.type },
        body: JSON.stringify({ workspaceId: ws.id, event }),
        signal: controller?.signal
      });
    } catch {
      // Notification transport is best-effort UX, never authority or outcome.
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function loadRequests(ws) {
    return (await store.get(keys.requests(ws.id))) ?? {};
  }

  async function saveRequests(ws, requests) {
    await store.put(keys.requests(ws.id), requests);
  }

  async function sweepExpired(ws, requests) {
    const nowMs = clock();
    let changed = false;
    for (const req of Object.values(requests)) {
      // A decision interrupted mid-flight (isolate eviction, timeout) must not
      // stay EXECUTING forever: it becomes UNKNOWN and goes to reconciliation.
      if (req.status === 'EXECUTING' && nowMs - Date.parse(req.executingSince ?? req.createdAt) > 10 * 60 * 1000) {
        req.status = 'UNKNOWN';
        req.decidedAt = nowIso();
        changed = true;
        await appendEvent(ws, { type: 'OUTCOME_UNKNOWN', actor: 'system', requestId: req.id, summary: `Approval of ${req.id} was interrupted; reconcile before any retry`, data: { operation: 'APPROVE_INTERRUPTED' } });
        continue;
      }
      if (req.status === 'PENDING' && Date.parse(req.expiresAt) <= nowMs) {
        req.status = 'EXPIRED';
        req.decidedAt = nowIso();
        changed = true;
        await appendEvent(ws, { type: 'EXCEPTION_EXPIRED', actor: 'system', requestId: req.id, summary: `Request ${req.id} expired without a decision` });
      }
    }
    if (changed) await saveRequests(ws, requests);
    return requests;
  }

  async function invalidatePending(ws, reason, newNonce) {
    const requests = await loadRequests(ws);
    let count = 0;
    for (const req of Object.values(requests)) {
      if (req.status === 'PENDING') {
        req.status = 'STALE';
        req.decidedAt = nowIso();
        req.staleReason = reason;
        count += 1;
        await appendEvent(ws, {
          type: 'EXCEPTION_STALE',
          actor: 'system',
          requestId: req.id,
          summary: `Request ${req.id} is stale: mandate changed (${reason})`,
          data: { requestNonce: req.mandateNonce, currentNonce: newNonce ?? null }
        });
      }
    }
    if (count) await saveRequests(ws, requests);
    return count;
  }

  function requireReady(ws) {
    if (ws.chain?.status !== 'READY') fail(409, 'WORKSPACE_NOT_BOOTSTRAPPED', 'Bootstrap the workspace mandate first');
  }

  function publicWorkspace(ws) {
    return {
      contractVersion: WORKFLOW_CONTRACT_VERSION,
      id: ws.id,
      name: ws.name,
      createdAt: ws.createdAt,
      roles: {
        principal: { label: ws.principal.label, wallet: ws.principal.wallet?.publicKey ?? null },
        operator: { label: ws.operator.label },
        risk: { label: ws.risk.label }
      },
      policy: ws.policy,
      requestTtlSeconds: ws.requestTtlSeconds,
      notifications: { webhookConfigured: Boolean(ws.webhookUrl) },
      chain: ws.chain,
      truthBoundary: {
        network: 'solana-devnet',
        mainnet: false,
        onChainGuardian: 'SERVER_HELD_DEVNET_KEY',
        principalApproval: ws.principal.wallet ? 'WALLET_SIGNED_MESSAGE_THEN_SERVER_EXECUTED' : 'ROLE_TOKEN_THEN_SERVER_EXECUTED',
        operatorSigner: 'SERVER_DERIVED_WORKSPACE_DELEGATE',
        productionCustody: false,
        customerValidation: false
      }
    };
  }

  async function createWorkspace(body = {}) {
    const index = (await store.get(keys.index)) ?? { ids: [] };
    if (index.ids.length >= cfg.maxWorkspaces) {
      fail(429, 'WORKSPACE_CAPACITY_REACHED', 'The Devnet lab has reached its workspace capacity', { max: cfg.maxWorkspaces });
    }
    const policy = validateWorkspacePolicy(body.policy ?? {});
    const ttl = body.requestTtlSeconds === undefined ? cfg.requestTtlSeconds : Number(body.requestTtlSeconds);
    if (!Number.isSafeInteger(ttl) || ttl < 60 || ttl > 24 * 3600) fail(400, 'REQUEST_TTL_INVALID', 'requestTtlSeconds must be in [60, 86400]');
    const id = `ws-${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const tokens = Object.fromEntries(WORKFLOW_ROLES.map((r) => [r, `wf_${r}_${randomBytes(24).toString('base64url')}`]));
    const ws = {
      id,
      name: cleanLabel(body.name, 'Delegated trading desk'),
      createdAt: nowIso(),
      policy,
      requestTtlSeconds: ttl,
      principal: { label: cleanLabel(body.principalLabel, 'Principal / allocator'), wallet: null },
      operator: { label: cleanLabel(body.operatorLabel, 'Delegated strategy') },
      risk: { label: cleanLabel(body.riskLabel, 'Risk owner') },
      tokens: Object.fromEntries(Object.entries(tokens).map(([r, t]) => [r, sha256(t)])),
      webhookUrl: validateWebhook(body.webhookUrl),
      chain: { status: 'NOT_BOOTSTRAPPED' }
    };
    await saveWorkspace(ws);
    index.ids.push(id);
    await store.put(keys.index, index);
    await appendEvent(ws, { type: 'WORKSPACE_CREATED', actor: 'principal', summary: `Workspace "${ws.name}" created`, data: { policy } });
    return {
      status: 201,
      body: {
        ...publicWorkspace(ws),
        tokens,
        tokenNotice: 'Role tokens are shown once. Share each one only with the person holding that role.'
      }
    };
  }

  async function getWorkspace(id) {
    const ws = await loadWorkspace(id);
    return { status: 200, body: publicWorkspace(ws) };
  }

  async function whoami(id, token) {
    const ws = await loadWorkspace(id);
    const role = authorize(ws, token, WORKFLOW_ROLES);
    return { status: 200, body: { workspaceId: ws.id, role } };
  }

  async function bootstrap(id, token) {
    const ws = await loadWorkspace(id);
    authorize(ws, token, ['principal']);
    const chain = chainFor(ws);
    let result;
    try {
      result = await chain.bootstrapWorkspace();
    } catch (error) {
      if (error?.worldFairBusy) fail(409, 'BUSY', 'Another write is in progress for this mandate', { retryAfterMs: 5000 });
      await appendEvent(ws, { type: 'OUTCOME_UNKNOWN', actor: 'principal', summary: 'Mandate bootstrap did not confirm; it is safe to retry (idempotent)', data: { operation: 'BOOTSTRAP', message: String(error?.message ?? error).slice(0, 300) } });
      fail(503, 'BOOTSTRAP_UNCONFIRMED', 'Bootstrap did not complete. Retrying is safe: existing accounts are reused.', { retryPolicy: 'SAFE_RETRY_IDEMPOTENT' });
    }
    ws.chain = { status: 'READY', delegate: result.delegate, guardian: result.guardian, accounts: result.accounts, bootstrappedAt: nowIso() };
    await saveWorkspace(ws);
    const sigs = Object.entries(result.bootstrap ?? {})
      .filter(([, v]) => typeof v === 'string')
      .map(([label, signature]) => ({ label, signature }));
    await appendEvent(ws, { type: 'MANDATE_BOOTSTRAPPED', actor: 'principal', summary: 'Standing mandate is live on Devnet', data: { mandate: result.mandate, assetRule: result.assetRule }, signatures: sigs });
    return { status: 200, body: { ...publicWorkspace(ws), mandate: result.mandate, assetRule: result.assetRule } };
  }

  function intentInput(body) {
    const inputAmount = Number(body?.inputAmount);
    if (!Number.isSafeInteger(inputAmount) || inputAmount <= 0) fail(400, 'INTENT_AMOUNT_INVALID', 'inputAmount must be a positive integer (devUSDC base units, 6 decimals)');
    const maxSlippageBps = body?.maxSlippageBps === undefined ? 100 : Number(body.maxSlippageBps);
    if (!Number.isSafeInteger(maxSlippageBps) || maxSlippageBps < 1 || maxSlippageBps > 300) fail(400, 'INTENT_SLIPPAGE_INVALID', 'maxSlippageBps must be an integer in [1, 300]');
    const action = body?.action ?? 'SWAP_EXACT_IN';
    if (action !== 'SWAP_EXACT_IN') fail(400, 'ACTION_UNSUPPORTED', 'Only SWAP_EXACT_IN devUSDC->devUSDT is supported in v1', { boundary: 'HARD' });
    const idempotencyKey = body?.idempotencyKey === undefined ? null : String(body.idempotencyKey).slice(0, 80);
    if (idempotencyKey !== null && !/^[A-Za-z0-9._:-]{8,80}$/.test(idempotencyKey)) fail(400, 'IDEMPOTENCY_KEY_INVALID', 'idempotencyKey must be 8-80 chars [A-Za-z0-9._:-]');
    const clientReference = body?.clientReference ? String(body.clientReference).slice(0, 80) : null;
    return { action, inputAmount, maxSlippageBps, idempotencyKey, clientReference };
  }

  async function submitIntent(id, token, body) {
    const ws = await loadWorkspace(id);
    authorize(ws, token, ['operator']);
    requireReady(ws);
    const intent = intentInput(body);

    const idem = (await store.get(keys.idem(ws.id))) ?? {};
    if (intent.idempotencyKey && idem[intent.idempotencyKey]) {
      const prior = idem[intent.idempotencyKey];
      return { status: prior.status, body: { ...prior.body, idempotentReplay: true } };
    }
    const remember = async (response) => {
      if (intent.idempotencyKey) {
        idem[intent.idempotencyKey] = response;
        const entries = Object.entries(idem).slice(-cfg.maxIdempotencyKeys);
        await store.put(keys.idem(ws.id), Object.fromEntries(entries));
      }
      return response;
    };

    const chain = chainFor(ws);
    let result;
    try {
      result = await chain.executeIntent({ inputAmount: intent.inputAmount, slippageBps: intent.maxSlippageBps });
    } catch (error) {
      if (error?.worldFairBusy) fail(409, 'BUSY', 'Another write is in progress for this mandate', { retryAfterMs: 5000 });
      const event = await appendEvent(ws, {
        type: 'OUTCOME_UNKNOWN',
        actor: 'operator',
        summary: 'Intent outcome not confirmed; do not resubmit blindly',
        data: { operation: 'INTENT', intent, message: String(error?.message ?? error).slice(0, 300) }
      });
      return remember({
        status: 503,
        body: {
          contractVersion: WORKFLOW_CONTRACT_VERSION,
          decision: 'UNKNOWN',
          retryPolicy: 'REQUIRES_STATE_RECONCILIATION',
          message: 'The program outcome could not be confirmed. Call /reconcile and read /mandate before resubmitting with a new idempotencyKey.',
          eventId: event.id
        }
      });
    }

    if (result.decision === 'ALLOW') {
      const event = await appendEvent(ws, {
        type: 'INTENT_ALLOWED',
        actor: 'operator',
        summary: `Swap of ${intent.inputAmount} devUSDC base units executed inside standing authority`,
        data: { intent, quote: result.quote, standingMaxNotionalMicroUsd: result.standingMaxNotionalMicroUsd, effectObserved: result.effectObserved, assetRuleAfter: result.assetRuleAfter },
        signatures: [{ label: 'standing.execute', signature: result.signature }]
      });
      return remember({
        status: 200,
        body: {
          contractVersion: WORKFLOW_CONTRACT_VERSION,
          decision: 'ALLOW',
          boundary: 'STANDING',
          principalApprovalRequired: false,
          receipt: { eventId: event.id, signature: result.signature, explorer: EXPLORER(result.signature), quote: result.quote, effectObserved: result.effectObserved }
        }
      });
    }

    if (result.decision === 'REFUSE' && result.boundary === 'SOFT') {
      const requests = await loadRequests(ws);
      const rid = `req-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
      const req = {
        id: rid,
        status: 'PENDING',
        createdAt: nowIso(),
        expiresAt: new Date(clock() + ws.requestTtlSeconds * 1000).toISOString(),
        intent,
        mandateNonce: Number(result.mandateBefore?.nonce),
        requestedNotionalMicroUsd: result.quote?.notionalMicroUsd ?? null,
        standingMaxNotionalMicroUsd: result.standingMaxNotionalMicroUsd,
        policyDiff: result.policyDiff,
        refusal: { code: result.code, evidence: result.refusalEvidence },
        quoteAtRequest: result.quote
      };
      requests[rid] = req;
      await saveRequests(ws, requests);
      const event = await appendEvent(ws, {
        type: 'EXCEPTION_REQUESTED',
        actor: 'operator',
        requestId: rid,
        summary: `Outside standing authority (${(result.policyDiff?.violatedDimensions ?? []).join(', ') || 'MAX_ACTION_NOTIONAL'}); exact exception requested`,
        data: { intent, policyDiff: result.policyDiff, requestedNotionalMicroUsd: req.requestedNotionalMicroUsd, standingMaxNotionalMicroUsd: req.standingMaxNotionalMicroUsd }
      });
      return remember({
        status: 202,
        body: {
          contractVersion: WORKFLOW_CONTRACT_VERSION,
          decision: 'PENDING_PRINCIPAL',
          boundary: 'SOFT',
          refusal: req.refusal,
          policyDiff: req.policyDiff,
          request: req,
          eventId: event.id
        }
      });
    }

    const event = await appendEvent(ws, {
      type: 'INTENT_REFUSED',
      actor: 'operator',
      summary: `Refused by the CRESCO program (${result.code}); ${result.boundary === 'HARD' ? 'no exception path' : 'see boundary'}`,
      data: { intent, boundary: result.boundary, code: result.code, quote: result.quote ?? null }
    });
    return remember({
      status: 200,
      body: {
        contractVersion: WORKFLOW_CONTRACT_VERSION,
        decision: 'REFUSE',
        boundary: result.boundary,
        code: result.code,
        exceptionAvailable: false,
        refusalEvidence: result.refusalEvidence ?? null,
        eventId: event.id
      }
    });
  }

  async function listRequests(id, query = {}) {
    const ws = await loadWorkspace(id);
    const requests = await sweepExpired(ws, await loadRequests(ws));
    let list = Object.values(requests).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (query.status) list = list.filter((r) => r.status === String(query.status).toUpperCase());
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, requests: list } };
  }

  async function decide(id, rid, token, body = {}) {
    const ws = await loadWorkspace(id);
    const role = authorize(ws, token, ['principal', 'risk']);
    const requests = await sweepExpired(ws, await loadRequests(ws));
    const req = requests[rid];
    if (!req) fail(404, 'REQUEST_NOT_FOUND', 'Unknown exception request');
    if (req.status !== 'PENDING') {
      fail(409, 'REQUEST_ALREADY_DECIDED', `Request is ${req.status}; an exception can only be decided once`, { requestStatus: req.status });
    }
    const decision = String(body.decision ?? '').toUpperCase();
    if (!['APPROVE', 'REFUSE'].includes(decision)) fail(400, 'DECISION_INVALID', 'decision must be APPROVE or REFUSE');
    const note = body.note ? String(body.note).slice(0, 280) : null;

    if (decision === 'REFUSE') {
      req.status = 'REFUSED_BY_PRINCIPAL';
      req.decidedAt = nowIso();
      req.decision = { decision, role, note };
      await saveRequests(ws, requests);
      const event = await appendEvent(ws, { type: 'EXCEPTION_REFUSED', actor: role, requestId: rid, summary: `Exception refused by ${role}${note ? `: ${note}` : ''}` });
      return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, request: req, eventId: event.id } };
    }

    let walletProof = null;
    if (role === 'principal' && ws.principal.wallet) {
      checkIssuedAt(body.issuedAt, clock(), cfg.walletSignatureMaxAgeSeconds);
      const message = approvalMessage({ workspaceId: ws.id, request: req, issuedAt: body.issuedAt });
      if (!verifyWalletSignature({ publicKey: ws.principal.wallet.publicKey, message, signature: body.walletSignature })) {
        fail(401, 'WALLET_SIGNATURE_INVALID', 'Approval must be signed by the bound principal wallet', { expectedMessage: message });
      }
      walletProof = { publicKey: ws.principal.wallet.publicKey, issuedAt: body.issuedAt, signature: String(body.walletSignature).slice(0, 200) };
    }

    const chain = chainFor(ws);
    req.status = 'EXECUTING';
    req.executingSince = nowIso();
    req.decision = { decision, role, note, walletProof };
    await saveRequests(ws, requests);

    let result;
    try {
      result = await chain.approveAndExecuteException({
        inputAmount: req.intent.inputAmount,
        slippageBps: req.intent.maxSlippageBps,
        expectedNonce: req.mandateNonce
      });
    } catch (error) {
      if (error?.worldFairBusy) {
        req.status = 'PENDING';
        await saveRequests(ws, requests);
        fail(409, 'BUSY', 'Another write is in progress for this mandate', { retryAfterMs: 5000 });
      }
      req.status = 'UNKNOWN';
      req.decidedAt = nowIso();
      req.grant = error?.worldFairGrant ?? null;
      await saveRequests(ws, requests);
      const event = await appendEvent(ws, {
        type: 'OUTCOME_UNKNOWN',
        actor: role,
        requestId: rid,
        summary: 'Approval outcome not confirmed; reconcile before any retry',
        data: { operation: 'APPROVE', message: String(error?.message ?? error).slice(0, 300) },
        signatures: req.grant ? [{ label: 'exception.grant', signature: req.grant.signature }] : []
      });
      return { status: 503, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, request: req, retryPolicy: 'REQUIRES_STATE_RECONCILIATION', eventId: event.id } };
    }

    req.decidedAt = nowIso();
    req.chainResult = { status: result.status, code: result.code ?? null, boundary: result.boundary ?? null, quote: result.quote ?? null };
    let event;
    if (result.status === 'EXECUTED') {
      req.status = 'EXECUTED';
      req.grant = result.grant;
      req.execution = {
        signature: result.executionSignature,
        allowanceConsumed: result.allowanceConsumed,
        standingMandateVersionBefore: result.standingMandateVersionBefore,
        standingMandateVersionAfter: result.standingMandateVersionAfter,
        standingAuthorityChanged: result.standingAuthorityChanged
      };
      event = await appendEvent(ws, {
        type: 'EXCEPTION_EXECUTED',
        actor: role,
        requestId: rid,
        summary: 'Exact one-use exception granted and executed once; standing mandate unchanged',
        data: { grant: result.grant, execution: req.execution, quote: result.quote, walletProof: walletProof ? { publicKey: walletProof.publicKey } : null },
        signatures: [
          { label: 'exception.grant', signature: result.grant.signature },
          { label: 'exception.execute', signature: result.executionSignature }
        ]
      });
    } else if (result.status === 'STALE') {
      req.status = 'STALE';
      req.staleReason = 'MANDATE_NONCE_CHANGED';
      event = await appendEvent(ws, { type: 'EXCEPTION_STALE', actor: role, requestId: rid, summary: 'Mandate changed since the request; the exception was not granted', data: { requestNonce: result.requestNonce ?? req.mandateNonce, currentNonce: result.currentNonce ?? null } });
    } else if (result.status === 'NOT_REQUIRED') {
      req.status = 'NOT_REQUIRED';
      event = await appendEvent(ws, { type: 'EXCEPTION_NOT_REQUIRED', actor: role, requestId: rid, summary: 'The action now fits standing authority; resubmit it as a normal intent', data: { quote: result.quote } });
    } else if (result.status === 'ROLLED_BACK') {
      req.status = 'ROLLED_BACK';
      req.grant = result.grant;
      event = await appendEvent(ws, {
        type: 'EXCEPTION_ROLLED_BACK',
        actor: role,
        requestId: rid,
        summary: 'Venue execution failed; transaction rolled back, allowance not consumed, counters unchanged',
        data: { code: result.code, allowanceConsumed: false },
        signatures: [{ label: 'exception.grant', signature: result.grant?.signature }]
      });
    } else {
      req.status = 'REFUSED_BY_PROGRAM';
      req.grant = result.grant ?? null;
      event = await appendEvent(ws, {
        type: 'EXCEPTION_REFUSED_BY_PROGRAM',
        actor: role,
        requestId: rid,
        summary: `The CRESCO program refused the exception (${result.code})`,
        data: { code: result.code, boundary: result.boundary },
        signatures: result.grant ? [{ label: 'exception.grant', signature: result.grant.signature }] : []
      });
    }
    await saveRequests(ws, requests);
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, request: req, eventId: event.id } };
  }

  async function currentNonce(chain) {
    const view = await chain.readMandate();
    if (!view?.mandate) fail(409, 'WORKSPACE_NOT_BOOTSTRAPPED', 'Mandate not found on-chain');
    return view.mandate.nonce;
  }

  async function lifecycleWrite(ws, role, operation, label, eventType, summary, data = {}) {
    let result;
    try {
      result = await operation();
    } catch (error) {
      if (error?.worldFairBusy) fail(409, 'BUSY', 'Another write is in progress for this mandate', { retryAfterMs: 5000 });
      await appendEvent(ws, { type: 'OUTCOME_UNKNOWN', actor: role, summary: `${label} not confirmed; read /mandate before retrying`, data: { operation: label, message: String(error?.message ?? error).slice(0, 300) } });
      fail(503, 'WRITE_UNCONFIRMED', `${label} did not confirm`, { retryPolicy: 'REQUIRES_STATE_RECONCILIATION' });
    }
    if (result.status !== 'CONFIRMED') {
      await appendEvent(ws, { type: 'LIFECYCLE_REFUSED', actor: role, summary: `${label} refused by the CRESCO program (${result.code})`, data: { code: result.code } });
      fail(409, 'PROGRAM_REFUSED', `${label} refused by the program: ${result.code}`, { code: result.code });
    }
    const newNonce = result.mandate?.nonce ?? result.mandate?.mandate?.nonce ?? null;
    const event = await appendEvent(ws, { type: eventType, actor: role, summary, data: { ...data, mandate: result.mandate }, signatures: [{ label, signature: result.signature }] });
    const staled = await invalidatePending(ws, label, newNonce);
    return { event, result, staled };
  }

  async function setStatus(id, token, body = {}) {
    const ws = await loadWorkspace(id);
    const role = authorize(ws, token, ['principal']);
    requireReady(ws);
    const status = String(body.status ?? '').toUpperCase();
    if (!['ACTIVE', 'PAUSED', 'REVOKED'].includes(status)) fail(400, 'STATUS_INVALID', 'status must be ACTIVE, PAUSED or REVOKED');
    if (status === 'REVOKED' && body.confirm !== 'REVOKE') fail(400, 'REVOKE_CONFIRMATION_REQUIRED', 'Revocation is permanent: send confirm:"REVOKE"');
    const chain = chainFor(ws);
    const nonce = await currentNonce(chain);
    const { event, result, staled } = await lifecycleWrite(
      ws, role,
      () => chain.setMandateStatus({ status, expectedNonce: nonce }),
      `mandate.${status.toLowerCase()}`,
      'MANDATE_STATUS_CHANGED',
      `Mandate ${status === 'ACTIVE' ? 'resumed' : status.toLowerCase()} by principal; pending exceptions invalidated`,
      { status }
    );
    if (status === 'REVOKED') {
      ws.chain.status = 'REVOKED';
      await saveWorkspace(ws);
    }
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, mandate: result.mandate, staleRequests: staled, eventId: event.id } };
  }

  async function revisePolicy(id, token, body = {}) {
    const ws = await loadWorkspace(id);
    const role = authorize(ws, token, ['principal']);
    requireReady(ws);
    const next = validateWorkspacePolicy(
      { maxActionNotionalMicroUsd: body.maxActionNotionalMicroUsd, maxPeriodNotionalMicroUsd: body.maxPeriodNotionalMicroUsd },
      ws.policy
    );
    const chain = chainFor(ws);
    const nonce = await currentNonce(chain);
    const { event, result, staled } = await lifecycleWrite(
      ws, role,
      () => chain.revisePolicy({ values: { maxActionNotionalMicroUsd: next.maxActionNotionalMicroUsd, maxPeriodNotionalMicroUsd: next.maxPeriodNotionalMicroUsd }, expectedNonce: nonce }),
      'mandate.policy',
      'POLICY_REVISED',
      'Standing notional limits revised by principal; pending exceptions invalidated',
      { before: { maxActionNotionalMicroUsd: ws.policy.maxActionNotionalMicroUsd, maxPeriodNotionalMicroUsd: ws.policy.maxPeriodNotionalMicroUsd }, after: { maxActionNotionalMicroUsd: next.maxActionNotionalMicroUsd, maxPeriodNotionalMicroUsd: next.maxPeriodNotionalMicroUsd } }
    );
    ws.policy = next;
    await saveWorkspace(ws);
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, policy: ws.policy, mandate: result.mandate, staleRequests: staled, eventId: event.id } };
  }

  async function updateAssetRule(id, token, body = {}) {
    const ws = await loadWorkspace(id);
    const role = authorize(ws, token, ['principal', 'risk']);
    requireReady(ws);
    const next = validateWorkspacePolicy({ maxActionAmount: body.maxActionAmount, maxPeriodAmount: body.maxPeriodAmount }, ws.policy);
    const enabled = body.enabled === undefined ? true : Boolean(body.enabled);
    const chain = chainFor(ws);
    const nonce = await currentNonce(chain);
    const { event, result, staled } = await lifecycleWrite(
      ws, role,
      () => chain.updateRule({ values: { maxActionAmount: next.maxActionAmount, maxPeriodAmount: next.maxPeriodAmount, enabled }, expectedNonce: nonce }),
      'assetRule.update',
      'ASSET_RULE_UPDATED',
      `Asset rule updated by ${role}${enabled ? '' : ' (disabled)'}; period counters reset, pending exceptions invalidated`,
      { enabled, maxActionAmount: next.maxActionAmount, maxPeriodAmount: next.maxPeriodAmount }
    );
    ws.policy = next;
    await saveWorkspace(ws);
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, policy: ws.policy, mandate: result.mandate, staleRequests: staled, eventId: event.id } };
  }

  async function mandate(id) {
    const ws = await loadWorkspace(id);
    requireReady(ws);
    let view;
    try {
      view = await chainFor(ws).readMandate();
    } catch (error) {
      if (error instanceof WorkflowError) throw error;
      fail(503, 'MANDATE_READ_UNAVAILABLE', 'On-chain mandate read failed; safe to retry', { retryPolicy: 'SAFE_RETRY_READ' });
    }
    const rule = view.assetRule;
    const m = view.mandate;
    const nowSec = Math.floor(clock() / 1000);
    const periodEndsAt = rule ? Number(rule.periodStartedAt) + Number(rule.periodSeconds) : null;
    const periodActive = rule ? nowSec < periodEndsAt : false;
    const consumption = rule && m
      ? {
          periodEndsAt: periodEndsAt ? new Date(periodEndsAt * 1000).toISOString() : null,
          periodActive,
          spentAmount: periodActive ? rule.spentThisPeriod : 0,
          maxPeriodAmount: rule.maxPeriodAmount,
          amountUsedPct: rule.maxPeriodAmount ? Math.round((100 * (periodActive ? rule.spentThisPeriod : 0)) / rule.maxPeriodAmount) : null,
          spentNotionalMicroUsd: periodActive ? rule.spentThisPeriodNotionalMicroUsd : 0,
          maxPeriodNotionalMicroUsd: m.maxPeriodNotionalMicroUsd,
          notionalUsedPct: m.maxPeriodNotionalMicroUsd ? Math.round((100 * (periodActive ? rule.spentThisPeriodNotionalMicroUsd : 0)) / m.maxPeriodNotionalMicroUsd) : null
        }
      : null;
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, workspaceId: ws.id, ...view, consumption, observedAt: nowIso() } };
  }

  async function history(id, query = {}) {
    const ws = await loadWorkspace(id);
    const limit = Math.min(Math.max(Number(query.limit ?? 100) || 100, 1), cfg.maxEvents);
    const list = (await store.get(keys.events(ws.id))) ?? [];
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, events: list.slice(-limit).reverse() } };
  }

  const ROLE_EVENTS = {
    principal: ['EXCEPTION_REQUESTED', 'OUTCOME_UNKNOWN', 'EXCEPTION_EXPIRED', 'INTENT_REFUSED'],
    risk: ['EXCEPTION_REQUESTED', 'OUTCOME_UNKNOWN', 'ASSET_RULE_UPDATED', 'POLICY_REVISED', 'MANDATE_STATUS_CHANGED'],
    operator: ['EXCEPTION_EXECUTED', 'EXCEPTION_REFUSED', 'EXCEPTION_STALE', 'EXCEPTION_EXPIRED', 'EXCEPTION_NOT_REQUIRED', 'EXCEPTION_ROLLED_BACK', 'EXCEPTION_REFUSED_BY_PROGRAM', 'MANDATE_STATUS_CHANGED', 'POLICY_REVISED', 'ASSET_RULE_UPDATED']
  };

  async function notifications(id, token, query = {}) {
    const ws = await loadWorkspace(id);
    const role = authorize(ws, token, WORKFLOW_ROLES);
    await sweepExpired(ws, await loadRequests(ws));
    const since = Number(query.since ?? 0) || 0;
    const list = ((await store.get(keys.events(ws.id))) ?? []).filter((e) => e.seq > since && ROLE_EVENTS[role].includes(e.type));
    const pending = role === 'operator' ? [] : Object.values(await loadRequests(ws)).filter((r) => r.status === 'PENDING');
    return {
      status: 200,
      body: {
        contractVersion: WORKFLOW_CONTRACT_VERSION,
        role,
        pendingDecisions: pending.length,
        pending,
        notifications: list,
        cursor: list.at(-1)?.seq ?? since,
        transport: { poll: true, webhook: Boolean(ws.webhookUrl), authorityEffect: 'NONE' }
      }
    };
  }

  async function bindWallet(id, token, body = {}) {
    const ws = await loadWorkspace(id);
    authorize(ws, token, ['principal']);
    checkIssuedAt(body.issuedAt, clock(), cfg.walletSignatureMaxAgeSeconds);
    const message = walletBindingMessage({ workspaceId: ws.id, issuedAt: body.issuedAt });
    if (!verifyWalletSignature({ publicKey: body.publicKey, message, signature: body.signature })) {
      fail(401, 'WALLET_SIGNATURE_INVALID', 'The wallet signature does not match the binding message', { expectedMessage: message });
    }
    ws.principal.wallet = { publicKey: new PublicKey(String(body.publicKey)).toBase58(), boundAt: nowIso() };
    await saveWorkspace(ws);
    const event = await appendEvent(ws, { type: 'WALLET_BOUND', actor: 'principal', summary: `Principal wallet ${ws.principal.wallet.publicKey} bound; approvals now require its signature` });
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, wallet: ws.principal.wallet, eventId: event.id } };
  }

  async function topUpVault(id, token) {
    const ws = await loadWorkspace(id);
    const role = authorize(ws, token, ['principal']);
    requireReady(ws);
    let result;
    try {
      result = await chainFor(ws).bootstrapWorkspace();
    } catch (error) {
      if (error?.worldFairBusy) fail(409, 'BUSY', 'Another write is in progress for this mandate', { retryAfterMs: 5000 });
      fail(503, 'TOPUP_UNCONFIRMED', 'Vault top-up did not confirm; retry is safe', { retryPolicy: 'SAFE_RETRY_IDEMPOTENT' });
    }
    const sigs = Object.entries(result.bootstrap ?? {})
      .filter(([, v]) => typeof v === 'string')
      .map(([label, signature]) => ({ label, signature }));
    const event = await appendEvent(ws, { type: 'VAULT_TOPPED_UP', actor: role, summary: sigs.length ? 'Trade vault and delegate funding restored' : 'Vault already funded; nothing to do', signatures: sigs });
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, eventId: event.id, effects: sigs.length } };
  }

  async function reconcile(id, token) {
    const ws = await loadWorkspace(id);
    const role = authorize(ws, token, WORKFLOW_ROLES);
    const chain = chainFor(ws);
    const events = (await store.get(keys.events(ws.id))) ?? [];
    const reconciled = new Set(events.filter((e) => e.type === 'OUTCOME_RECONCILED').map((e) => e.data?.unknownEventId));
    const unknown = events.filter((e) => e.type === 'OUTCOME_UNKNOWN' && !reconciled.has(e.id));
    const requests = await loadRequests(ws);
    const results = [];
    for (const e of unknown) {
      const checks = [];
      for (const s of e.signatures ?? []) {
        try {
          checks.push({ signature: s.signature, label: s.label, ...(await chain.signatureStatus(s.signature)) });
        } catch {
          checks.push({ signature: s.signature, label: s.label, status: 'UNAVAILABLE' });
        }
      }
      const req = e.requestId ? requests[e.requestId] : null;
      let resolution = checks.length ? (checks.every((c) => c.status === 'CONFIRMED') ? 'EFFECTS_CONFIRMED' : checks.some((c) => c.status === 'FAILED') ? 'EFFECTS_FAILED' : 'STILL_UNKNOWN') : 'NO_SIGNATURE_RECORDED';
      if (req && req.status === 'UNKNOWN' && resolution === 'EFFECTS_FAILED') {
        req.status = 'REFUSED_BY_PROGRAM';
      }
      if (resolution === 'STILL_UNKNOWN' || checks.some((c) => c.status === 'UNAVAILABLE')) {
        results.push({ unknownEventId: e.id, resolution: 'STILL_UNKNOWN', checks });
        continue;
      }
      await appendEvent(ws, {
        type: 'OUTCOME_RECONCILED',
        actor: role,
        requestId: e.requestId ?? null,
        summary: resolution === 'NO_SIGNATURE_RECORDED'
          ? 'No transaction was recorded for this outcome; compare /mandate counters before resubmitting'
          : `Reconciled: ${resolution}`,
        data: { unknownEventId: e.id, resolution, checks }
      });
      results.push({ unknownEventId: e.id, resolution, checks });
    }
    await saveRequests(ws, requests);
    let mandateView = null;
    try {
      mandateView = (await chain.readMandate()).assetRule ?? null;
    } catch {
      mandateView = null;
    }
    return { status: 200, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, reconciled: results, assetRule: mandateView } };
  }

  return {
    createWorkspace,
    getWorkspace,
    whoami,
    bootstrap,
    submitIntent,
    listRequests,
    decide,
    setStatus,
    revisePolicy,
    updateAssetRule,
    mandate,
    history,
    notifications,
    bindWallet,
    topUpVault,
    reconcile
  };
}
