// HTTP surface for the World's Fair operator / principal workflow (v0.4).
// Thin: parse, route, map WorkflowError to HTTP. All product rules live in
// worlds-fair-workflow.mjs; all authority lives in the CRESCO program.

import {
  approvalMessage,
  walletBindingMessage,
  WorkflowError,
  WORKFLOW_CONTRACT_VERSION,
  WORKSPACE_POLICY_BOUNDS
} from './worlds-fair-workflow.mjs';

export const WORKFLOW_PREFIX = '/api/v0.4/worlds-fair';
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

const MUTATING = /^\/workspaces\/[a-z0-9-]+\/(bootstrap|intents|requests\/[a-z0-9-]+\/decision|mandate\/status|mandate\/policy|asset-rule|vault\/topup|principal\/wallet|reconcile)$/;

export function isWorkflowPath(path) {
  return typeof path === 'string' && path.startsWith(WORKFLOW_PREFIX);
}

// Workspace id for per-workspace write serialization (Durable Object lease).
export function workflowWriteScope(method, path) {
  if (method !== 'POST' || !isWorkflowPath(path)) return null;
  const rest = path.slice(WORKFLOW_PREFIX.length);
  // Creation updates the shared workspace index: serialize it too (cap race).
  if (rest === '/workspaces') return '__index';
  if (!MUTATING.test(rest)) return null;
  return rest.split('/')[2];
}

function header(headers, name) {
  if (!headers) return null;
  if (typeof headers.get === 'function') return headers.get(name);
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
  const value = key ? headers[key] : null;
  return Array.isArray(value) ? value[0] : value ?? null;
}

export function workflowOpenApi() {
  const bearer = [{ roleToken: [] }];
  const op = (summary, roles, extra = {}) => ({ summary, 'x-cresco-roles': roles, ...(roles.length ? { security: bearer } : {}), ...extra });
  return {
    openapi: '3.1.0',
    info: {
      title: "CRESCO World's Fair — delegated capital authority API",
      version: WORKFLOW_CONTRACT_VERSION,
      description:
        'A delegated strategy (operator) acts autonomously inside a standing on-chain Mandate. ' +
        'Actions outside the soft boundary become exact exception requests that a principal or risk owner ' +
        'approves once or refuses. Solana Devnet only; the CRESCO program is the authority.'
    },
    servers: [{ url: '/' }],
    components: {
      securitySchemes: { roleToken: { type: 'http', scheme: 'bearer', description: 'Role token returned once at workspace creation (operator, principal or risk).' } },
      schemas: {
        Intent: {
          type: 'object',
          required: ['inputAmount'],
          properties: {
            action: { const: 'SWAP_EXACT_IN' },
            inputAmount: { type: 'integer', minimum: 1, description: 'devUSDC base units (6 decimals)' },
            maxSlippageBps: { type: 'integer', minimum: 1, maximum: 300, default: 100 },
            idempotencyKey: { type: 'string', pattern: '^[A-Za-z0-9._:-]{8,80}$' },
            clientReference: { type: 'string', maxLength: 80 }
          }
        },
        Decision: {
          type: 'object',
          required: ['decision'],
          properties: {
            decision: { enum: ['APPROVE', 'REFUSE'] },
            note: { type: 'string', maxLength: 280 },
            issuedAt: { type: 'string', format: 'date-time', description: 'Required with walletSignature' },
            walletSignature: { type: 'string', description: 'base64/hex ed25519 signature of the approval message, required when a principal wallet is bound' }
          }
        },
        PolicyBounds: { type: 'object', example: WORKSPACE_POLICY_BOUNDS }
      }
    },
    paths: {
      [`${WORKFLOW_PREFIX}/workspaces`]: { post: op('Create a workspace (returns role tokens once)', []) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}`]: { get: op('Public workspace view', []) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/whoami`]: { get: op('Resolve the role of a token', ['operator', 'principal', 'risk']) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/bootstrap`]: { post: op('Create or reuse the on-chain mandate, asset rule and vaults (idempotent)', ['principal']) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/intents`]: {
        post: op('Submit a SWAP_EXACT_IN intent', ['operator'], {
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Intent' } } } },
          responses: {
            200: { description: 'ALLOW (executed) or REFUSE (hard boundary, no exception path)' },
            202: { description: 'PENDING_PRINCIPAL: soft boundary, Policy Diff and exception request created' },
            409: { description: 'BUSY or WORKSPACE_NOT_BOOTSTRAPPED' },
            503: { description: 'UNKNOWN: reconcile before resubmitting' }
          }
        })
      },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/requests`]: { get: op('List exception requests (?status=PENDING)', []) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/requests/{requestId}/decision`]: {
        post: op('Approve (exact one-use grant, executed once) or refuse', ['principal', 'risk'], {
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Decision' } } } }
        })
      },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/requests/{requestId}/approval-message`]: { get: op('Exact message a bound principal wallet must sign (?issuedAt=)', []) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/mandate`]: { get: op('On-chain mandate, asset rule and period consumption', []) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/mandate/status`]: { post: op('Pause, resume or revoke (confirm:"REVOKE")', ['principal']) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/mandate/policy`]: { post: op('Revise standing notional limits', ['principal']) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/asset-rule`]: { post: op('Update amount limits / enable flag (resets period counters)', ['principal', 'risk']) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/vault/topup`]: { post: op('Restore Devnet trade-vault and delegate funding (idempotent)', ['principal']) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/history`]: { get: op('Durable event history with explorer receipts (?limit=)', []) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/notifications`]: { get: op('Role-specific notifications (?since=cursor)', ['operator', 'principal', 'risk']) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/principal/wallet`]: { post: op('Bind a principal wallet (signed binding message)', ['principal']) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/principal/wallet-message`]: { get: op('Exact wallet binding message (?issuedAt=)', []) },
      [`${WORKFLOW_PREFIX}/workspaces/{id}/reconcile`]: { post: op('Resolve UNKNOWN outcomes from transaction signatures', ['operator', 'principal', 'risk']) }
    }
  };
}

export async function routeWorldFairWorkflow({ method, path, body, headers, query = {}, workflow }) {
  const rest = path.slice(WORKFLOW_PREFIX.length) || '/';
  const token = header(headers, 'authorization');
  const ok = (result) => ({ status: result.status, headers: JSON_HEADERS, body: result.body });

  try {
    if (method === 'GET' && rest === '/openapi') {
      return { status: 200, headers: JSON_HEADERS, body: workflowOpenApi() };
    }
    if (!workflow) {
      return { status: 503, headers: JSON_HEADERS, body: { contractVersion: WORKFLOW_CONTRACT_VERSION, error: 'WORKFLOW_STORE_UNAVAILABLE' } };
    }
    if (method === 'POST' && rest === '/workspaces') return ok(await workflow.createWorkspace(body ?? {}, header(headers, 'x-cresco-create-token')));

    const m = rest.match(/^\/workspaces\/([a-z0-9-]+)(\/.*)?$/);
    if (!m) return { status: 404, headers: JSON_HEADERS, body: { error: 'NOT_FOUND' } };
    const [, id, sub = ''] = m;

    if (method === 'GET' && sub === '') return ok(await workflow.getWorkspace(id));
    if (method === 'GET' && sub === '/whoami') return ok(await workflow.whoami(id, token));
    if (method === 'POST' && sub === '/bootstrap') return ok(await workflow.bootstrap(id, token));
    if (method === 'POST' && sub === '/intents') {
      const idem = header(headers, 'idempotency-key');
      return ok(await workflow.submitIntent(id, token, { ...(body ?? {}), ...(idem && !body?.idempotencyKey ? { idempotencyKey: idem } : {}) }));
    }
    if (method === 'GET' && sub === '/requests') return ok(await workflow.listRequests(id, query));
    let r = sub.match(/^\/requests\/([a-z0-9-]+)\/decision$/);
    if (method === 'POST' && r) return ok(await workflow.decide(id, r[1], token, body ?? {}));
    r = sub.match(/^\/requests\/([a-z0-9-]+)\/approval-message$/);
    if (method === 'GET' && r) {
      const list = (await workflow.listRequests(id)).body.requests;
      const req = list.find((x) => x.id === r[1]);
      if (!req) return { status: 404, headers: JSON_HEADERS, body: { error: 'REQUEST_NOT_FOUND' } };
      const issuedAt = String(query.issuedAt ?? new Date().toISOString());
      return { status: 200, headers: JSON_HEADERS, body: { issuedAt, message: approvalMessage({ workspaceId: id, request: req, issuedAt }) } };
    }
    if (method === 'GET' && sub === '/principal/wallet-message') {
      const issuedAt = String(query.issuedAt ?? new Date().toISOString());
      await workflow.getWorkspace(id);
      return { status: 200, headers: JSON_HEADERS, body: { issuedAt, message: walletBindingMessage({ workspaceId: id, issuedAt }) } };
    }
    if (method === 'GET' && sub === '/mandate') return ok(await workflow.mandate(id));
    if (method === 'POST' && sub === '/mandate/status') return ok(await workflow.setStatus(id, token, body ?? {}));
    if (method === 'POST' && sub === '/mandate/policy') return ok(await workflow.revisePolicy(id, token, body ?? {}));
    if (method === 'POST' && sub === '/asset-rule') return ok(await workflow.updateAssetRule(id, token, body ?? {}));
    if (method === 'POST' && sub === '/vault/topup') return ok(await workflow.topUpVault(id, token));
    if (method === 'GET' && sub === '/history') return ok(await workflow.history(id, query));
    if (method === 'GET' && sub === '/notifications') return ok(await workflow.notifications(id, token, query));
    if (method === 'POST' && sub === '/principal/wallet') return ok(await workflow.bindWallet(id, token, body ?? {}));
    if (method === 'POST' && sub === '/reconcile') return ok(await workflow.reconcile(id, token));
    return { status: 404, headers: JSON_HEADERS, body: { error: 'NOT_FOUND' } };
  } catch (error) {
    if (error instanceof WorkflowError) {
      const extraHeaders = error.extra?.retryAfterMs ? { 'retry-after': String(Math.ceil(error.extra.retryAfterMs / 1000)) } : {};
      return {
        status: error.httpStatus,
        headers: { ...JSON_HEADERS, ...extraHeaders },
        body: { contractVersion: WORKFLOW_CONTRACT_VERSION, error: error.code, message: error.message, ...error.extra }
      };
    }
    return {
      status: 500,
      headers: JSON_HEADERS,
      body: { contractVersion: WORKFLOW_CONTRACT_VERSION, error: 'WORKFLOW_INTERNAL_ERROR', message: 'Unexpected error; no outcome is claimed', retryPolicy: 'REQUIRES_STATE_RECONCILIATION' }
    };
  }
}
