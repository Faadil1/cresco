/**
 * Separate, invitation-only *imaginary-credit* practice API.
 * Does not share or persist Colosseum/Devnet wallet or role tokens.
 */
import { crescoConfig } from "./cresco-backend";

export type PracticeRole = "parent" | "teen";
export type PracticeDecision = "APPROVE_DISCUSSION" | "DECLINE";
export type PracticeReason = "LEARN_TOGETHER" | "NOT_RIGHT_NOW" | "NEEDS_MORE_INFORMATION";
export type PracticeEvent = {
  id: string;
  at: string;
  actor: PracticeRole;
  type: string;
  credits?: number;
  requestId?: string;
  reason?: PracticeReason;
};
export type PracticeRequest = {
  id: string;
  at: string;
  topic: "DIVERSIFIED_FUNDS";
  status: "PENDING" | PracticeDecision;
  reason: PracticeReason | null;
  decisionAt: string | null;
};
export type PracticeSnapshot = {
  contract: "CRESCO_FAMILY_PRACTICE_1";
  kind: "FICTIONAL_CREDITS_ONLY";
  role: PracticeRole;
  practiceId: string;
  version: number;
  createdAt: string;
  expiresAt: string;
  availableCredits: number;
  savedCredits: number;
  requests: PracticeRequest[];
  events: PracticeEvent[];
  truthBoundary: {
    realMoney: false;
    crypto: false;
    stocks: false;
    yield: false;
    blockchainWrites: false;
    guardianIdentityVerified: false;
    thisIsLegalConsent: false;
  };
};
export type PracticeInvitation = {
  practiceId: string;
  parentToken: string;
  teenToken: string;
  expiresAfterDays: number;
  notice: string;
};
export type PracticeCredentials = { practiceId: string; role: PracticeRole; token: string };

const PREFIX = "/api/family-practice/v1";
export class PracticeApiError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
  }
}

function practiceApiBase(): string {
  if (process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY !== "1") {
    throw new PracticeApiError(0, "FAMILY_ONLY_REQUIRED");
  }
  const url = crescoConfig().url;
  if (!url) throw new PracticeApiError(0, "FAMILY_API_NOT_CONFIGURED");
  const endpoint = new URL(url);
  // Prevent accidental historic API fallback even if build env is wrong.
  if (endpoint.hostname === "keys-api-stocklana.faadil-casecraft.workers.dev" ||
      endpoint.hostname === "cresco-api-stocklana.faadil-casecraft.workers.dev" ||
      endpoint.hostname === "cresco.faadil-casecraft.workers.dev") {
    throw new PracticeApiError(0, "HISTORIC_API_FORBIDDEN");
  }
  if (endpoint.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(endpoint.hostname)) {
    throw new PracticeApiError(0, "FAMILY_API_MUST_USE_HTTPS");
  }
  return url;
}

async function call<T>(
  path: string, options: { method?: "GET" | "POST"; body?: unknown; token?: string; invite?: string; actionId?: string } = {}
): Promise<T> {
  const base = practiceApiBase();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  let response: Response;
  try {
    response = await fetch(base + PREFIX + path, {
      method: options.method || "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.token ? { authorization: "Bearer " + options.token } : {}),
        ...(options.invite ? { "x-cresco-family-practice-invite": options.invite } : {}),
        ...(options.actionId ? { "x-practice-action-id": options.actionId } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new PracticeApiError(0, "PRACTICE_CONNECTION_UNVERIFIED");
  } finally {
    clearTimeout(timer);
  }
  let data: unknown;
  try { data = await response.json(); } catch {
    throw new PracticeApiError(response.status, "PRACTICE_RESPONSE_INVALID");
  }
  if (!response.ok) {
    const code = data && typeof data === "object" && "error" in data
      ? String((data as { error: unknown }).error) : "PRACTICE_REQUEST_FAILED";
    throw new PracticeApiError(response.status, code);
  }
  return data as T;
}

export function createPracticeSession(invite: string): Promise<PracticeInvitation> {
  return call("/sessions", { method: "POST", body: {}, invite });
}
export function loadPracticeState(c: PracticeCredentials): Promise<PracticeSnapshot> {
  return call("/sessions/" + encodeURIComponent(c.practiceId), { token: c.token });
}
export function savePracticeCredits(c: PracticeCredentials): Promise<PracticeSnapshot> {
  return call("/sessions/" + encodeURIComponent(c.practiceId) + "/save", {
    method: "POST", token: c.token, body: { credits: 20 }, actionId: crypto.randomUUID()
  });
}
export function requestPracticeDiscussion(c: PracticeCredentials): Promise<PracticeSnapshot> {
  return call("/sessions/" + encodeURIComponent(c.practiceId) + "/request", {
    method: "POST", token: c.token, body: { topic: "DIVERSIFIED_FUNDS" }, actionId: crypto.randomUUID()
  });
}
export function decidePracticeDiscussion(
  c: PracticeCredentials, requestId: string, decision: PracticeDecision, reason: PracticeReason
): Promise<PracticeSnapshot> {
  return call("/sessions/" + encodeURIComponent(c.practiceId) + "/requests/" + encodeURIComponent(requestId) + "/decision", {
    method: "POST", token: c.token, body: { decision, reason }, actionId: crypto.randomUUID()
  });
}

/** Parent role only. Permanently ends this fictional exercise and revokes both role codes. */
export function closePracticeSession(c: PracticeCredentials): Promise<{
  closed: true; allRoleCodesRevoked: true; fictionalHistoryCleared: true;
}> {
  if (c.role !== "parent") throw new PracticeApiError(403, "PARENT_ONLY");
  return call("/sessions/" + encodeURIComponent(c.practiceId) + "/close", {
    method: "POST", token: c.token, body: { confirm: "END_PRACTICE" }
  });
}
