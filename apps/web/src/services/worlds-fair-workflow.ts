/**
 * World's Fair operator / principal / risk workflow client (API v0.4).
 *
 * Role tokens are bearer credentials issued once per workspace. They are kept in
 * this browser only (localStorage, per-viewer convenience) and can be shared as
 * links so the operator, the principal and the risk owner use their own device.
 */
import { crescoConfig } from "./cresco-backend";

export type WorkflowRole = "operator" | "principal" | "risk";

export type WorkspacePolicy = {
  maxActionNotionalMicroUsd: number;
  maxPeriodNotionalMicroUsd: number;
  maxActionAmount: number;
  maxPeriodAmount: number;
};

export type UseCase = "family" | "capital";
export type GuardianMode = "server" | "principal-wallet";

/** A transaction the server prepared for the principal wallet (the on-chain guardian) to sign. */
export type GuardianSignatureRequest = {
  opId: string;
  kind: "BOOTSTRAP" | "GRANT" | "LIFECYCLE";
  label: string;
  guardian: string;
  transaction: string;
  expiresAt: string;
  submitTo: string;
};

type GuardianSigner = (request: GuardianSignatureRequest) => Promise<string>;
let guardianSigner: GuardianSigner | null = null;

/** Register how this browser signs guardian transactions (returns the signed transaction, base64). */
export function setGuardianSigner(signer: GuardianSigner | null) {
  guardianSigner = signer;
}

export type Workspace = {
  contractVersion: string;
  id: string;
  name: string;
  useCase?: UseCase;
  guardianMode?: GuardianMode;
  createdAt: string;
  roles: {
    principal: { label: string; wallet: string | null };
    operator: { label: string };
    risk: { label: string };
  };
  policy: WorkspacePolicy;
  requestTtlSeconds: number;
  notifications: { webhookConfigured: boolean };
  chain: {
    status: "NOT_BOOTSTRAPPED" | "READY" | "REVOKED";
    delegate?: string;
    guardian?: string;
    accounts?: Record<string, string>;
    bootstrappedAt?: string;
  };
  truthBoundary: Record<string, string | boolean>;
};

export type CreatedWorkspace = Workspace & {
  tokens: Record<WorkflowRole, string>;
  tokenNotice: string;
};

export type Quote = {
  inputAmount: number;
  slippageBps?: number;
  notionalMicroUsd: number;
  unitPriceMicroUsd?: number;
  estimatedOutput?: number;
  minOutput?: number;
};

export type ExceptionRequest = {
  id: string;
  status:
    | "PENDING"
    | "EXECUTING"
    | "EXECUTED"
    | "REFUSED_BY_PRINCIPAL"
    | "REFUSED_BY_PROGRAM"
    | "STALE"
    | "EXPIRED"
    | "NOT_REQUIRED"
    | "ROLLED_BACK"
    | "UNKNOWN";
  createdAt: string;
  expiresAt: string;
  decidedAt?: string;
  intent: { action: string; inputAmount: number; maxSlippageBps: number; clientReference?: string | null };
  mandateNonce: number;
  requestedNotionalMicroUsd: number | null;
  standingMaxNotionalMicroUsd: number;
  policyDiff: { violatedDimensions?: string[]; perActionNotional?: string } | null;
  refusal?: { code: string; evidence: string };
  grant?: { signature: string; allowance?: string; requestHash?: string; maxNotionalMicroUsd?: number; principalApprovalVerifiedOnChain?: boolean; principalWallet?: string | null } | null;
  execution?: { signature: string; allowanceConsumed: boolean | null; standingAuthorityChanged: boolean | null };
  decision?: { decision: string; role: WorkflowRole; note: string | null; walletProof?: { publicKey: string } | null };
  staleReason?: string;
};

export type IntentResult =
  | { decision: "ALLOW"; boundary: "STANDING"; principalApprovalRequired: false; receipt: { eventId: string; signature: string; explorer: string; quote: Quote; effectObserved: boolean }; idempotentReplay?: boolean }
  | { decision: "PENDING_PRINCIPAL"; boundary: "SOFT"; policyDiff: ExceptionRequest["policyDiff"]; request: ExceptionRequest; refusal: { code: string; evidence: string }; idempotentReplay?: boolean }
  | { decision: "REFUSE"; boundary: string; code: string; exceptionAvailable: false; idempotentReplay?: boolean }
  | { decision: "UNKNOWN"; retryPolicy: string; message: string; idempotentReplay?: boolean };

export type WorkflowEvent = {
  id: string;
  seq: number;
  at: string;
  type: string;
  actor: string;
  requestId?: string | null;
  summary: string;
  data?: Record<string, unknown>;
  signatures: { label: string; signature: string; explorer: string }[];
};

export type MandateView = {
  workspaceId: string;
  accounts: Record<string, string>;
  guardian: string;
  delegate: string;
  mandate: {
    stage: number;
    status: "ACTIVE" | "PAUSED" | "REVOKED" | "UNKNOWN";
    version: number;
    nonce: number;
    maxActionNotionalMicroUsd: number;
    maxPeriodNotionalMicroUsd: number;
  } | null;
  assetRule: {
    enabled: boolean;
    maxActionAmount: number;
    maxPeriodAmount: number;
    periodSeconds: number;
    spentThisPeriod: number;
    spentThisPeriodNotionalMicroUsd: number;
  } | null;
  consumption: {
    periodEndsAt: string | null;
    periodActive: boolean;
    spentAmount: number;
    maxPeriodAmount: number;
    amountUsedPct: number | null;
    spentNotionalMicroUsd: number;
    maxPeriodNotionalMicroUsd: number;
    notionalUsedPct: number | null;
  } | null;
  observedAt: string;
};

export type NotificationsView = {
  role: WorkflowRole;
  pendingDecisions: number;
  pending: ExceptionRequest[];
  notifications: WorkflowEvent[];
  cursor: number;
};

export class WorkflowApiError extends Error {
  status: number;
  code: string;
  body: Record<string, unknown>;
  constructor(status: number, code: string, message: string, body: Record<string, unknown>) {
    super(message);
    this.name = "WorkflowApiError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

const PREFIX = "/api/v0.4/worlds-fair";

async function call<T>(method: "GET" | "POST", path: string, opts: { token?: string | null; body?: unknown; idempotencyKey?: string; timeoutMs?: number } = {}): Promise<{ status: number; body: T }> {
  const { url } = crescoConfig();
  if (!url) throw new WorkflowApiError(0, "API_NOT_CONFIGURED", "No CRESCO API URL is configured for this build.", {});
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), opts.timeoutMs ?? 120_000) : null;
  let res: Response;
  try {
    res = await fetch(`${url}${PREFIX}${path}`, {
      method,
      headers: {
        ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
        ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
        ...(opts.idempotencyKey ? { "idempotency-key": opts.idempotencyKey } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller?.signal,
    });
  } catch (error) {
    throw new WorkflowApiError(0, "NETWORK_UNAVAILABLE", "The CRESCO API could not be reached. Nothing is claimed; check the outcome before retrying.", { cause: String(error) });
  } finally {
    if (timer) clearTimeout(timer);
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  // Principal-wallet guardian: the server cannot sign. Ask the wallet, then
  // submit the signed transaction; the answer is the finished operation.
  const guardianRequest = res.status === 202 ? (body.needsGuardianSignature as GuardianSignatureRequest | undefined) : undefined;
  if (guardianRequest) {
    if (!guardianSigner) throw new WorkflowApiError(202, "GUARDIAN_SIGNER_UNAVAILABLE", "This action needs the guardian wallet signature, but no wallet signer is available here.", body);
    const signedTransaction = await guardianSigner(guardianRequest);
    return call<T>("POST", guardianRequest.submitTo, { token: opts.token, body: { opId: guardianRequest.opId, signedTransaction } });
  }
  // 202 (pending principal) and 503 UNKNOWN intents are decisions, not transport errors.
  if (res.ok || (res.status === 503 && body.decision === "UNKNOWN") || (res.status === 503 && body.request)) {
    return { status: res.status, body: body as T };
  }
  throw new WorkflowApiError(res.status, String(body.error ?? `HTTP_${res.status}`), String(body.message ?? body.error ?? `Request failed (${res.status})`), body);
}

export function newIdempotencyKey(prefix = "intent") {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 18);
  return `${prefix}-${random}`;
}

export const workflowApi = {
  createWorkspace: (input: { useCase?: UseCase; guardianMode?: GuardianMode; name?: string; principalLabel?: string; operatorLabel?: string; riskLabel?: string; policy?: Partial<WorkspacePolicy>; webhookUrl?: string }) =>
    call<CreatedWorkspace>("POST", "/workspaces", { body: input }).then((r) => r.body),
  getWorkspace: (id: string) => call<Workspace>("GET", `/workspaces/${id}`).then((r) => r.body),
  whoami: (id: string, token: string) => call<{ workspaceId: string; role: WorkflowRole }>("GET", `/workspaces/${id}/whoami`, { token }).then((r) => r.body),
  bootstrap: (id: string, token: string) => call<Workspace>("POST", `/workspaces/${id}/bootstrap`, { token, body: {} }).then((r) => r.body),
  submitIntent: (id: string, token: string, input: { inputAmount: number; maxSlippageBps: number; clientReference?: string }, idempotencyKey: string) =>
    call<IntentResult>("POST", `/workspaces/${id}/intents`, { token, body: { action: "SWAP_EXACT_IN", ...input }, idempotencyKey }),
  listRequests: (id: string, status?: string) =>
    call<{ requests: ExceptionRequest[] }>("GET", `/workspaces/${id}/requests${status ? `?status=${status}` : ""}`).then((r) => r.body.requests),
  approvalMessage: (id: string, requestId: string, issuedAt: string) =>
    call<{ message: string; issuedAt: string }>("GET", `/workspaces/${id}/requests/${requestId}/approval-message?issuedAt=${encodeURIComponent(issuedAt)}`).then((r) => r.body),
  decide: (id: string, requestId: string, token: string, input: { decision: "APPROVE" | "REFUSE"; note?: string; issuedAt?: string; walletSignature?: string }) =>
    call<{ request: ExceptionRequest; retryPolicy?: string }>("POST", `/workspaces/${id}/requests/${requestId}/decision`, { token, body: input }),
  mandate: (id: string) => call<MandateView>("GET", `/workspaces/${id}/mandate`).then((r) => r.body),
  setStatus: (id: string, token: string, status: "ACTIVE" | "PAUSED" | "REVOKED", confirm?: string) =>
    call<{ staleRequests: number }>("POST", `/workspaces/${id}/mandate/status`, { token, body: { status, ...(confirm ? { confirm } : {}) } }).then((r) => r.body),
  revisePolicy: (id: string, token: string, input: { maxActionNotionalMicroUsd?: number; maxPeriodNotionalMicroUsd?: number }) =>
    call<{ policy: WorkspacePolicy; staleRequests: number }>("POST", `/workspaces/${id}/mandate/policy`, { token, body: input }).then((r) => r.body),
  updateAssetRule: (id: string, token: string, input: { maxActionAmount?: number; maxPeriodAmount?: number; enabled?: boolean }) =>
    call<{ policy: WorkspacePolicy; staleRequests: number }>("POST", `/workspaces/${id}/asset-rule`, { token, body: input }).then((r) => r.body),
  topUpVault: (id: string, token: string) => call<{ effects: number }>("POST", `/workspaces/${id}/vault/topup`, { token, body: {} }).then((r) => r.body),
  history: (id: string, limit = 100) => call<{ events: WorkflowEvent[] }>("GET", `/workspaces/${id}/history?limit=${limit}`).then((r) => r.body.events),
  notifications: (id: string, token: string, since = 0) => call<NotificationsView>("GET", `/workspaces/${id}/notifications?since=${since}`, { token }).then((r) => r.body),
  walletMessage: (id: string, issuedAt: string) =>
    call<{ message: string; issuedAt: string }>("GET", `/workspaces/${id}/principal/wallet-message?issuedAt=${encodeURIComponent(issuedAt)}`).then((r) => r.body),
  bindWallet: (id: string, token: string, input: { publicKey: string; signature: string; issuedAt: string }) =>
    call<{ wallet: { publicKey: string } }>("POST", `/workspaces/${id}/principal/wallet`, { token, body: input }).then((r) => r.body),
  reconcile: (id: string, token: string) =>
    call<{ reconciled: { unknownEventId: string; resolution: string }[] }>("POST", `/workspaces/${id}/reconcile`, { token, body: {} }).then((r) => r.body),
};

// --- Local role-token keychain (per viewer) --------------------------------

const KEYCHAIN = "cresco-worlds-fair-desk-v1";

export type DeskKeychain = { workspaceId: string | null; tokens: Partial<Record<WorkflowRole, string>> };

export function loadKeychain(): DeskKeychain {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEYCHAIN) : null;
    if (!raw) return { workspaceId: null, tokens: {} };
    const parsed = JSON.parse(raw) as DeskKeychain;
    return { workspaceId: parsed.workspaceId ?? null, tokens: parsed.tokens ?? {} };
  } catch {
    return { workspaceId: null, tokens: {} };
  }
}

export function saveKeychain(next: DeskKeychain) {
  try {
    window.localStorage.setItem(KEYCHAIN, JSON.stringify(next));
  } catch {
    // Storage unavailable: tokens stay in memory for this tab only.
  }
}

/** Parse a share link fragment: #ws=<id>&role=<role>&token=<token> */
export function parseShareFragment(hash: string): { workspaceId: string; role: WorkflowRole; token: string } | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const workspaceId = params.get("ws");
  const role = params.get("role") as WorkflowRole | null;
  const token = params.get("token");
  if (!workspaceId || !token || !role || !["operator", "principal", "risk"].includes(role)) return null;
  if (!/^[a-z0-9-]{6,64}$/.test(workspaceId)) return null;
  return { workspaceId, role, token };
}

export function shareLink(origin: string, workspaceId: string, role: WorkflowRole, token: string) {
  return `${origin}/worlds-fair/desk#ws=${workspaceId}&role=${role}&token=${encodeURIComponent(token)}`;
}

// --- Formatting -------------------------------------------------------------

export const usd = (micro: number | null | undefined) =>
  micro == null ? "n/a" : `$${(micro / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
export const devUsdc = (base: number | null | undefined) =>
  base == null ? "n/a" : `${(base / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 6 })} devUSDC`;
export const toBase = (amount: string) => Math.round(Number(amount) * 1_000_000);
