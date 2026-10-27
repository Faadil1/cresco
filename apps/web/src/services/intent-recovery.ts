/**
 * Local, non-authoritative recovery latch for ambiguous Devnet intents.
 * The server's durable intent hold is authoritative; this browser latch also
 * protects the ambiguous case where the response never reaches the browser.
 * It never stores role tokens, wallet keys, or any real-money information.
 */
export type IntentAttemptHold = {
  workspaceId: string;
  idempotencyKey: string;
  inputAmount: number;
  maxSlippageBps: number;
  eventId: string | null;
  createdAt: string;
};

export type IntentSafetyView = {
  blocked: boolean;
  code: string | null;
  eventId: string | null;
  idempotencyKey: string | null;
  lastResolution: string | null;
  retryPolicy: string;
  requiresManualReview: boolean;
  note: string;
};

const PREFIX = "cresco-intent-recovery-v1:";

const keyFor = (workspaceId: string) => PREFIX + workspaceId;

export function loadIntentAttempt(workspaceId: string): IntentAttemptHold | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(workspaceId));
    if (!raw) return null;
    const value = JSON.parse(raw) as IntentAttemptHold;
    if (value.workspaceId !== workspaceId || typeof value.idempotencyKey !== "string" ||
      !value.idempotencyKey || !Number.isSafeInteger(value.inputAmount) || !Number.isSafeInteger(value.maxSlippageBps)) {
      throw new Error("Invalid persisted intent record");
    }
    return value;
  } catch {
    // If local data is corrupt/unavailable, the server still enforces its own
    // durable hold. The submit path also requires a successful storage write.
    return null;
  }
}

export function saveIntentAttempt(attempt: IntentAttemptHold): void {
  if (typeof window === "undefined") throw new Error("A browser is required to submit a trade.");
  // Fail closed if local storage is blocked: an ambiguous network write must
  // survive a reload before we allow the capital path to start.
  try {
    window.localStorage.setItem(keyFor(attempt.workspaceId), JSON.stringify(attempt));
  } catch {
    throw new Error("Cannot preserve this trade's recovery record in this browser. No new trade was sent.");
  }
}

export function clearIntentAttempt(workspaceId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(keyFor(workspaceId));
}

export function mayReleaseIntentAttempt(hold: IntentAttemptHold, safety: IntentSafetyView): boolean {
  // A no-signature reconciliation, even if labeled reviewed, must never
  // release a local write whose result could still be unknown.
  return safety.blocked === false &&
    safety.idempotencyKey === hold.idempotencyKey &&
    Boolean(safety.eventId) &&
    (hold.eventId === null || hold.eventId === safety.eventId) &&
    ["EFFECTS_CONFIRMED", "EFFECTS_FAILED"].includes(safety.lastResolution ?? "");
}
