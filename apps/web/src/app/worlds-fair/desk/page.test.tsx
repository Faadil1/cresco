import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { configureCrescoBackend } from "@/services/cresco-backend";
import WorldFairDeskPage from "./page";

vi.mock("@/components/shell", () => ({ Wordmark: () => <span>Cresco</span> }));

const WS = {
  contractVersion: "0.4",
  id: "ws-desk00001",
  name: "Delegated trading desk",
  createdAt: "2026-10-12T12:00:00Z",
  roles: { principal: { label: "Allocator", wallet: null }, operator: { label: "Momentum strategy" }, risk: { label: "Risk owner" } },
  policy: { maxActionNotionalMicroUsd: 500000, maxPeriodNotionalMicroUsd: 10000000, maxActionAmount: 5000000, maxPeriodAmount: 10000000 },
  requestTtlSeconds: 1800,
  notifications: { webhookConfigured: false },
  chain: { status: "READY", accounts: { mandate: "MandatePda" } },
  truthBoundary: {},
};
const PENDING = {
  id: "req-000000000001",
  status: "PENDING",
  createdAt: "2026-10-12T12:01:00Z",
  expiresAt: "2026-10-12T12:31:00Z",
  intent: { action: "SWAP_EXACT_IN", inputAmount: 750000, maxSlippageBps: 100 },
  mandateNonce: 7,
  requestedNotionalMicroUsd: 750000,
  standingMaxNotionalMicroUsd: 500000,
  policyDiff: { violatedDimensions: ["MAX_ACTION_NOTIONAL"] },
  refusal: { code: "PythNotionalExceeded", evidence: "PROGRAM_PREFLIGHT_SIMULATION" },
};
const MANDATE = {
  workspaceId: WS.id,
  accounts: {},
  guardian: "G",
  delegate: "D",
  mandate: { stage: 3, status: "ACTIVE", version: 7, nonce: 7, maxActionNotionalMicroUsd: 500000, maxPeriodNotionalMicroUsd: 10000000 },
  assetRule: { enabled: true, maxActionAmount: 5000000, maxPeriodAmount: 10000000, periodSeconds: 86400, spentThisPeriod: 400000, spentThisPeriodNotionalMicroUsd: 400000 },
  consumption: { periodEndsAt: "2026-10-13T12:00:00Z", periodActive: true, spentAmount: 400000, maxPeriodAmount: 10000000, amountUsedPct: 4, spentNotionalMicroUsd: 400000, maxPeriodNotionalMicroUsd: 10000000, notionalUsedPct: 4 },
  observedAt: "2026-10-12T12:02:00Z",
};

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

function api(overrides: Record<string, (init?: RequestInit) => Response> = {}) {
  const calls: { method: string; path: string; init?: RequestInit }[] = [];
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const u = new URL(url);
    const path = u.pathname.replace("/api/v0.4/worlds-fair", "");
    const method = init?.method ?? "GET";
    calls.push({ method, path, init });
    const key = `${method} ${path}`;
    for (const [pattern, fn] of Object.entries(overrides)) if (key === pattern) return fn(init);
    if (key === "POST /workspaces") return json(201, { ...WS, useCase: JSON.parse(String(init?.body)).useCase ?? "capital", tokens: { operator: "wf_operator_a", principal: "wf_principal_b", risk: "wf_risk_c" }, tokenNotice: "shown once" });
    if (key === `GET /workspaces/${WS.id}`) return json(200, WS);
    if (key === `GET /workspaces/${WS.id}/requests`) return json(200, { requests: [PENDING] });
    if (key === `GET /workspaces/${WS.id}/history`) return json(200, { events: [{ id: "e1", seq: 1, at: "2026-10-12T12:01:00Z", type: "EXCEPTION_REQUESTED", actor: "operator", summary: "Outside standing authority", signatures: [] }] });
    if (key === `GET /workspaces/${WS.id}/mandate`) return json(200, MANDATE);
    if (key === `GET /workspaces/${WS.id}/intents/safety`) return json(200, {
      blocked: false, code: null, eventId: null, idempotencyKey: null,
      lastResolution: null, retryPolicy: "NORMAL", requiresManualReview: false, note: "Clear",
    });
    if (key === `GET /workspaces/${WS.id}/notifications`) return json(200, { role: "principal", pendingDecisions: 1, pending: [PENDING], notifications: [], cursor: 0 });
    return json(404, { error: "NOT_FOUND" });
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
}

beforeEach(() => {
  configureCrescoBackend({ url: "https://api.example.test", execution: "runtime" });
  window.localStorage.clear();
  Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn(async () => undefined) }, configurable: true });
});

afterEach(() => {
  configureCrescoBackend(null);
  vi.unstubAllGlobals();
});

describe("World's Fair desk", () => {
  it("offers the family and delegated-capital presentations of the same mechanism", async () => {
    const calls = api();
    render(<WorldFairDeskPage />);
    expect(await screen.findByRole("radio", { name: /family/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/give a teenager an allowance/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /delegated capital/i }));
    expect(screen.getByText(/give a strategy standing authority/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /family/i }));
    await userEvent.click(screen.getByRole("button", { name: /create workspace/i }));
    await screen.findByText(/hand each role its own link/i);
    const created = calls.find((c) => c.method === "POST" && c.path === "/workspaces");
    expect(JSON.parse(String(created?.init?.body))).toMatchObject({ useCase: "family", principalLabel: "Parent", operatorLabel: "Maya (16)" });
  });

  it("Parent wallet recovery replaces all links and persists only Parent capability", async () => {
    const walletKey = "BoundWallet111";
    Object.defineProperty(window, "phantom", {
      configurable: true,
      value: { solana: {
        connect: vi.fn(async () => ({ publicKey: { toString: () => walletKey } })),
        signMessage: vi.fn(async () => ({ signature: new Uint8Array([1, 2, 3]) })),
      } },
    });
    const calls = api({
      [`POST /workspaces/${WS.id}/principal/recovery/challenge`]: () => json(201, {
        workspaceId: WS.id, challengeId: "prc_test", nonce: "nonce", expiresAt: "2026-10-28T18:00:00Z",
        message: "CRESCO Family principal API access recovery",
      }),
      [`POST /workspaces/${WS.id}/principal/recovery/complete`]: () => json(200, {
        workspaceId: WS.id, onChainAuthorityChanged: false,
        tokens: { principal: "wf_principal_new", operator: "wf_operator_new", risk: "wf_risk_new" },
      }),
      [`GET /workspaces/${WS.id}`]: () => json(200, { ...WS, useCase: "family" }),
    });
    render(<WorldFairDeskPage />);
    await userEvent.type(screen.getByPlaceholderText("ws-..."), WS.id);
    await userEvent.click(screen.getByRole("button", { name: /recover with Parent wallet/i }));
    await screen.findByText(/hand each role its own link/i);
    expect(calls.filter((x) => x.path.endsWith("/principal/recovery/challenge"))).toHaveLength(1);
    const complete = calls.find((x) => x.path.endsWith("/principal/recovery/complete"));
    expect(complete).toBeDefined();
    expect((complete?.init?.headers as Record<string, string>).authorization).toBeUndefined();
    expect(JSON.parse(String(complete?.init?.body))).toMatchObject({
      challengeId: "prc_test", nonce: "nonce", publicKey: walletKey, signature: "AQID",
    });
    const saved = JSON.parse(window.localStorage.getItem("cresco-worlds-fair-desk-v1") ?? "{}");
    expect(saved.tokens).toEqual({ principal: "wf_principal_new" });
    expect(screen.getByText(/ALL previous Family links are invalid/i)).toBeInTheDocument();
    Reflect.deleteProperty(window, "phantom");
  });

  it("narrows an older multi-role Family keychain to the creator's Parent role", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({ workspaceId: WS.id, tokens: { operator: "wf_operator_a", principal: "wf_principal_b" } }));
    api({ [`GET /workspaces/${WS.id}`]: () => json(200, { ...WS, useCase: "family" }) });
    render(<WorldFairDeskPage />);
    expect(await screen.findByRole("tab", { name: /parent/i })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /teen/i })).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("cresco-worlds-fair-desk-v1") ?? "{}").tokens)
      .toEqual({ principal: "wf_principal_b" });
  });

  it("creates a workspace, hands off one link per role and keeps tokens for this viewer", async () => {
    const calls = api();
    render(<WorldFairDeskPage />);
    await userEvent.click(await screen.findByRole("button", { name: /create workspace/i }));
    expect(await screen.findByText(/hand each role its own link/i)).toBeInTheDocument();
    const created = calls.find((c) => c.method === "POST" && c.path === "/workspaces");
    expect(JSON.parse(String(created?.init?.body))).toMatchObject({ policy: { maxActionNotionalMicroUsd: 500000 } });
    const saved = JSON.parse(window.localStorage.getItem("cresco-worlds-fair-desk-v1") ?? "{}");
    expect(saved.tokens).toEqual({ principal: "wf_principal_b" });
    expect(screen.getAllByRole("button", { name: /copy link/i })).toHaveLength(3);
    expect(screen.getByText(/keeps only the Parent role/i)).toBeInTheDocument();
  });

  it("shows the principal the Policy Diff and approves exactly once with the principal token", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({ workspaceId: WS.id, tokens: { principal: "wf_principal_b" } }));
    const calls = api({
      [`POST /workspaces/${WS.id}/requests/${PENDING.id}/decision`]: () => json(200, { request: { ...PENDING, status: "EXECUTED" } }),
    });
    render(<WorldFairDeskPage />);
    const card = await screen.findByTestId(`request-${PENDING.id}`);
    expect(within(card).getByText(/MAX_ACTION_NOTIONAL/)).toBeInTheDocument();
    expect(within(card).getByText(/Requested \$0\.75/)).toBeInTheDocument();
    expect(within(card).getByText(/Standing limit \$0\.50/)).toBeInTheDocument();
    await userEvent.click(within(card).getByRole("button", { name: /approve exactly once/i }));
    await waitFor(() => expect(calls.some((c) => c.method === "POST" && c.path.endsWith("/decision"))).toBe(true));
    const decision = calls.find((c) => c.path.endsWith("/decision"))!;
    expect((decision.init?.headers as Record<string, string>).authorization).toBe("Bearer wf_principal_b");
    expect(JSON.parse(String(decision.init?.body))).toMatchObject({ decision: "APPROVE" });
    expect(await screen.findByRole("progressbar", { name: /Notional/ })).toHaveAttribute("aria-valuenow", "4");
  });

  it("Parent confirms replacing a Teen link, then copies it without storing the new bearer", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({
      workspaceId: WS.id, tokens: { principal: "wf_principal_b" },
    }));
    const calls = api({
      [`GET /workspaces/${WS.id}`]: () => json(200, { ...WS, useCase: "family" }),
      [`POST /workspaces/${WS.id}/roles/operator/rotate`]: () => json(200, {
        workspaceId: WS.id, role: "operator", token: "wf_operator_replacement",
        notice: "Previous link invalid", onChainAuthorityChanged: false,
      }),
    });
    render(<WorldFairDeskPage />);
    await screen.findByRole("button", { name: /replace Teen access/i });
    await userEvent.click(screen.getByRole("button", { name: /replace Teen access/i }));
    expect(calls.filter((c) => c.path.endsWith("/roles/operator/rotate"))).toHaveLength(0);
    expect(screen.getByRole("group", { name: /confirm role replacement/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /confirm link replacement/i }));
    await screen.findByText(/Old Teen link invalidated/i);
    expect(calls.filter((c) => c.path.endsWith("/roles/operator/rotate"))).toHaveLength(1);
    const rotated = calls.find((c) => c.path.endsWith("/roles/operator/rotate"));
    expect((rotated?.init?.headers as Record<string, string>).authorization).toBe("Bearer wf_principal_b");
    expect(JSON.stringify(window.localStorage)).not.toContain("wf_operator_replacement");
    await userEvent.click(screen.getByRole("button", { name: /copy replacement link/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(`#ws=${WS.id}&role=operator&token=wf_operator_replacement`),
    );
    await userEvent.click(screen.getByRole("button", { name: /dismiss link/i }));
    expect(screen.queryByRole("button", { name: /copy replacement link/i })).not.toBeInTheDocument();
  });

  it("includes the viewer role token for every private request and history read", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({
      workspaceId: WS.id, tokens: { principal: "wf_principal_b" },
    }));
    const calls = api();
    render(<WorldFairDeskPage />);
    expect(await screen.findByRole("button", { name: /approve exactly once/i })).toBeInTheDocument();
    await waitFor(() => {
      const reads = calls.filter((c) => c.method === "GET" &&
        (c.path.endsWith("/requests") || c.path.includes("/history?")));
      expect(reads.length).toBeGreaterThanOrEqual(2);
      expect(reads.every((c) =>
        (c.init?.headers as Record<string, string>)?.authorization === "Bearer wf_principal_b"
      )).toBe(true);
    });
  });

  it("operator sees UNKNOWN as unconfirmed, never as success", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({ workspaceId: WS.id, tokens: { operator: "wf_operator_a" } }));
    api({
      [`POST /workspaces/${WS.id}/intents`]: () => json(503, { decision: "UNKNOWN", retryPolicy: "REQUIRES_STATE_RECONCILIATION", message: "The program outcome could not be confirmed." }),
    });
    render(<WorldFairDeskPage />);
    const button = await screen.findByRole("button", { name: /submit intent/i });
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Outcome UNKNOWN/);
    expect(alert).toHaveTextContent(/does not show success/);
  });

  it("refreshes the Parent request inbox when the browser regains focus", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({
      workspaceId: WS.id, tokens: { principal: "wf_principal_b" },
    }));
    let currentRequests: typeof PENDING[] = [];
    api({
      [`GET /workspaces/${WS.id}/requests`]: () => json(200, { requests: currentRequests }),
    });
    render(<WorldFairDeskPage />);
    expect(await screen.findByText(/Nothing waiting\. Requests appear here/i)).toBeInTheDocument();

    currentRequests = [PENDING];
    window.dispatchEvent(new Event("focus"));
    expect(await screen.findByTestId(`request-${PENDING.id}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approve exactly once/i })).toBeEnabled();
  });

  it("shows a changed decision to the Teen after a focus refresh", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({
      workspaceId: WS.id, tokens: { operator: "wf_operator_a" },
    }));
    let currentRequests = [{ ...PENDING }];
    api({
      [`GET /workspaces/${WS.id}/requests`]: () => json(200, { requests: currentRequests }),
    });
    render(<WorldFairDeskPage />);
    expect(await screen.findByTestId(`request-${PENDING.id}`)).toHaveTextContent(/Waiting for Allocator/i);

    currentRequests = [{ ...PENDING, status: "REFUSED_BY_PRINCIPAL" }];
    window.dispatchEvent(new Event("focus"));
    expect(await screen.findByText(/Allocator said no/i)).toBeInTheDocument();
  });

  it("blocks stale Parent decisions when request updates fail and restores them after recovery", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({
      workspaceId: WS.id, tokens: { principal: "wf_principal_b" },
    }));
    let offline = false;
    const calls = api({
      [`GET /workspaces/${WS.id}/requests`]: () =>
        offline ? json(503, { error: "NETWORK_UNAVAILABLE" }) : json(200, { requests: [PENDING] }),
    });
    render(<WorldFairDeskPage />);
    const approval = await screen.findByRole("button", { name: /approve exactly once/i });
    expect(approval).toBeEnabled();

    offline = true;
    window.dispatchEvent(new Event("focus"));
    expect(await screen.findByRole("alert", { name: "" })).toHaveTextContent(/Request updates unavailable/i);
    expect(approval).toBeDisabled();
    await userEvent.click(approval);
    expect(calls.some((c) => c.path.endsWith("/decision"))).toBe(false);

    offline = false;
    window.dispatchEvent(new Event("focus"));
    await waitFor(() => expect(approval).toBeEnabled());
    expect(screen.queryByText(/Request updates unavailable/i)).not.toBeInTheDocument();
  });

  it("persists an UNKNOWN trade hold across reload and resumes only on a signed reconciliation", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({
      workspaceId: WS.id, tokens: { operator: "wf_operator_a" },
    }));
    let blocked = false;
    let resolved = false;
    let lastKey = "";
    const calls = api({
      [`GET /workspaces/${WS.id}/intents/safety`]: () => json(200, {
        blocked, code: blocked ? "INTENT_RECONCILIATION_REQUIRED" : null,
        eventId: "evt-unknown-001", idempotencyKey: lastKey || null,
        lastResolution: resolved ? "EFFECTS_FAILED" : null,
        retryPolicy: blocked ? "NO_NEW_INTENT_UNTIL_VERIFIED_SIGNATURE" : "NORMAL",
        requiresManualReview: blocked, note: blocked ? "Unverified outcome" : "Clear",
      }),
      [`POST /workspaces/${WS.id}/intents`]: (init) => {
        lastKey = (init?.headers as Record<string, string>)["idempotency-key"];
        blocked = true;
        return json(503, {
          decision: "UNKNOWN", eventId: "evt-unknown-001",
          retryPolicy: "REQUIRES_STATE_RECONCILIATION", message: "Outcome unconfirmed",
        });
      },
      [`POST /workspaces/${WS.id}/reconcile`]: () => {
        blocked = false;
        resolved = true;
        return json(200, { reconciled: [{ unknownEventId: "evt-unknown-001", resolution: "EFFECTS_FAILED" }] });
      },
    });
    const view = render(<WorldFairDeskPage />);
    const submit = await screen.findByRole("button", { name: /submit intent/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.click(submit);
    await waitFor(() => expect(submit).toBeDisabled());
    expect(calls.filter((x) => x.method === "POST" && x.path.endsWith("/intents"))).toHaveLength(1);
    expect(window.localStorage.getItem(`cresco-intent-recovery-v1:${WS.id}`)).toContain("evt-unknown-001");
    view.unmount();
    render(<WorldFairDeskPage />);
    const again = await screen.findByRole("button", { name: /submit intent/i });
    await waitFor(() => expect(again).toBeDisabled());
    await userEvent.click(screen.getByRole("button", { name: /reconcile and check mandate/i }));
    await waitFor(() => expect(again).toBeEnabled());
    expect(window.localStorage.getItem(`cresco-intent-recovery-v1:${WS.id}`)).toBeNull();
    expect(calls.filter((x) => x.method === "POST" && x.path.endsWith("/reconcile"))).toHaveLength(1);
  });

  it("keeps an UNKNOWN intent blocked when reconciliation has no signature", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({
      workspaceId: WS.id, tokens: { operator: "wf_operator_a" },
    }));
    let blocked = false;
    let lastKey = "";
    const calls = api({
      [`GET /workspaces/${WS.id}/intents/safety`]: () => json(200, {
        blocked, code: blocked ? "INTENT_RECONCILIATION_REQUIRED" : null,
        eventId: "evt-no-signature", idempotencyKey: lastKey || null, lastResolution: blocked ? "NO_SIGNATURE_RECORDED" : null,
        retryPolicy: blocked ? "NO_NEW_INTENT_UNTIL_VERIFIED_SIGNATURE" : "NORMAL",
        requiresManualReview: blocked, note: "No confirmed signature",
      }),
      [`POST /workspaces/${WS.id}/intents`]: (init) => {
        lastKey = (init?.headers as Record<string, string>)["idempotency-key"];
        blocked = true;
        return json(503, {
          decision: "UNKNOWN", eventId: "evt-no-signature", retryPolicy: "REQUIRES_STATE_RECONCILIATION", message: "Unconfirmed",
        });
      },
      [`POST /workspaces/${WS.id}/reconcile`]: () => json(200, {
        reconciled: [{ unknownEventId: "evt-no-signature", resolution: "NO_SIGNATURE_RECORDED" }],
      }),
    });
    render(<WorldFairDeskPage />);
    const submit = await screen.findByRole("button", { name: /submit intent/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.click(submit);
    await waitFor(() => expect(submit).toBeDisabled());
    await userEvent.click(screen.getByRole("button", { name: /reconcile and check mandate/i }));
    await waitFor(() => expect(screen.getByText(/Still blocked: there is no verified final signature/i)).toBeInTheDocument());
    expect(submit).toBeDisabled();
    expect(calls.filter((x) => x.method === "POST" && x.path.endsWith("/intents"))).toHaveLength(1);
  });

  it("replaces an existing Parent capability when a Teen share link is imported", async () => {
    window.localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({
      workspaceId: WS.id, tokens: { principal: "wf_principal_b" },
    }));
    window.history.replaceState(null, "", `/worlds-fair/desk?case=family#ws=${WS.id}&role=operator&token=wf_operator_a`);
    api({ [`GET /workspaces/${WS.id}`]: () => json(200, { ...WS, useCase: "family" }) });
    render(<WorldFairDeskPage />);
    expect(await screen.findByRole("tab", { name: /teen/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("tab", { name: /parent/i })).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("cresco-worlds-fair-desk-v1") ?? "{}").tokens)
      .toEqual({ operator: "wf_operator_a" });
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?case=family");
  });

  it("imports a role from a share link fragment and scrubs the token from the URL", async () => {
    api();
    window.history.replaceState(null, "", `/worlds-fair/desk#ws=${WS.id}&role=risk&token=wf_risk_c`);
    render(<WorldFairDeskPage />);
    expect(await screen.findByRole("tab", { name: /risk owner/i })).toHaveAttribute("aria-selected", "true");
    expect(window.location.hash).toBe("");
    expect(JSON.parse(window.localStorage.getItem("cresco-worlds-fair-desk-v1") ?? "{}").tokens.risk).toBe("wf_risk_c");
  });
});
