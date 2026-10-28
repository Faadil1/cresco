import { afterEach, describe, expect, it, vi } from "vitest";

import { configureCrescoBackend } from "./cresco-backend";
import {
  devUsdc,
  parseShareFragment,
  setGuardianSigner,
  shareLink,
  toBase,
  usd,
  workflowApi,
  WorkflowApiError,
} from "./worlds-fair-workflow";

afterEach(() => {
  configureCrescoBackend(null);
  setGuardianSigner(null);
  vi.unstubAllGlobals();
});

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("World's Fair workflow client", () => {
  it("sends the role token and idempotency key and returns 202 pending decisions as data", async () => {
    configureCrescoBackend({ url: "https://api.example.test", execution: "runtime" });
    const fetchMock = vi.fn(async () => json(202, { decision: "PENDING_PRINCIPAL", request: { id: "req-1" } }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await workflowApi.submitIntent("ws-abcdef12", "wf_operator_x", { inputAmount: 750000, maxSlippageBps: 100 }, "intent-key-0001");
    expect(res.status).toBe(202);
    expect(res.body.decision).toBe("PENDING_PRINCIPAL");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.test/api/v0.4/worlds-fair/workspaces/ws-abcdef12/intents");
    const headers = init.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer wf_operator_x");
    expect(headers["idempotency-key"]).toBe("intent-key-0001");
    expect(JSON.parse(String(init.body))).toMatchObject({ action: "SWAP_EXACT_IN", inputAmount: 750000 });
  });

  it("treats 503 UNKNOWN as a decision to display, never as success", async () => {
    configureCrescoBackend({ url: "https://api.example.test", execution: "runtime" });
    vi.stubGlobal("fetch", vi.fn(async () => json(503, { decision: "UNKNOWN", retryPolicy: "REQUIRES_STATE_RECONCILIATION", message: "reconcile" })));
    const res = await workflowApi.submitIntent("ws-abcdef12", "t", { inputAmount: 1, maxSlippageBps: 100 }, "intent-key-0002");
    expect(res.status).toBe(503);
    expect(res.body.decision).toBe("UNKNOWN");
  });

  it("raises typed errors for BUSY, auth and network failures", async () => {
    configureCrescoBackend({ url: "https://api.example.test", execution: "runtime" });
    vi.stubGlobal("fetch", vi.fn(async () => json(409, { error: "BUSY", message: "busy", retryAfterMs: 5000 })));
    await expect(workflowApi.bootstrap("ws-abcdef12", "t")).rejects.toMatchObject({ code: "BUSY", status: 409 });
    vi.stubGlobal("fetch", vi.fn(async () => json(403, { error: "ROLE_FORBIDDEN", message: "nope" })));
    await expect(workflowApi.decide("ws-abcdef12", "req-1", "t", { decision: "APPROVE" })).rejects.toBeInstanceOf(WorkflowApiError);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    await expect(workflowApi.history("ws-abcdef12", "wf_operator_x")).rejects.toMatchObject({ code: "NETWORK_UNAVAILABLE" });
  });

  it("adds the exact workspace role token to all private metadata, mandate and wallet-binding reads", async () => {
    configureCrescoBackend({ url: "https://api.example.test", execution: "runtime" });
    const fetchMock = vi.fn(async () => json(200, { id: "ws-abcdef12", message: "bind" }));
    vi.stubGlobal("fetch", fetchMock);
    await workflowApi.getWorkspace("ws-abcdef12", "wf_operator_only");
    await workflowApi.mandate("ws-abcdef12", "wf_operator_only");
    await workflowApi.walletMessage("ws-abcdef12", "wf_principal_only", "2026-10-28T12:00:00.000Z");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const urls = [
      "/workspaces/ws-abcdef12",
      "/workspaces/ws-abcdef12/mandate",
      "/workspaces/ws-abcdef12/principal/wallet-message?issuedAt=",
    ];
    fetchMock.mock.calls.forEach((call, i) => {
      const [url, init] = call as unknown as [string, RequestInit];
      expect(url).toContain(urls[i]);
      expect((init.headers as Record<string, string>).authorization).toBe(
        i < 2 ? "Bearer wf_operator_only" : "Bearer wf_principal_only",
      );
    });
  });

  it("principal-wallet guardian: a 202 signature request is signed by the wallet and submitted", async () => {
    configureCrescoBackend({ url: "https://api.example.test", execution: "runtime" });
    const request = { opId: "gop_1", kind: "LIFECYCLE", label: "set_mandate_status", guardian: "Wallet111", transaction: "dHg=", expiresAt: "2026-10-12T12:01:30Z", submitTo: "/workspaces/ws-abcdef12/guardian/submit" };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json(202, { needsGuardianSignature: request }))
      .mockResolvedValueOnce(json(200, { staleRequests: 0 }));
    vi.stubGlobal("fetch", fetchMock);
    // No signer: never pretend the action happened.
    await expect(workflowApi.setStatus("ws-abcdef12", "wf_principal_x", "PAUSED")).rejects.toMatchObject({ code: "GUARDIAN_SIGNER_UNAVAILABLE" });

    fetchMock.mockReset();
    fetchMock.mockResolvedValueOnce(json(202, { needsGuardianSignature: request })).mockResolvedValueOnce(json(200, { staleRequests: 2 }));
    const signer = vi.fn(async () => "c2lnbmVk");
    setGuardianSigner(signer);
    const res = await workflowApi.setStatus("ws-abcdef12", "wf_principal_x", "PAUSED");
    expect(res.staleRequests).toBe(2);
    expect(signer).toHaveBeenCalledWith(request);
    const [url, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.test/api/v0.4/worlds-fair/workspaces/ws-abcdef12/guardian/submit");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer wf_principal_x");
    expect(JSON.parse(String(init.body))).toEqual({ opId: "gop_1", signedTransaction: "c2lnbmVk" });
  });

  it("refuses to call an unconfigured API", async () => {
    configureCrescoBackend({ url: "", execution: "demo" });
    await expect(workflowApi.getWorkspace("ws-abcdef12", "wf_operator_x")).rejects.toMatchObject({ code: "API_NOT_CONFIGURED" });
  });

  it("round-trips share links and rejects malformed fragments", () => {
    const link = shareLink("https://cresco.example", "ws-abcdef12", "principal", "wf_principal_abc+/=");
    const parsed = parseShareFragment(new URL(link).hash);
    expect(parsed).toEqual({ workspaceId: "ws-abcdef12", role: "principal", token: "wf_principal_abc+/=" });
    expect(parseShareFragment("#ws=ws-abcdef12&role=admin&token=x")).toBeNull();
    expect(parseShareFragment("#ws=../x&role=operator&token=x")).toBeNull();
  });

  it("formats Devnet units without em dashes", () => {
    expect(usd(750000)).toBe("$0.75");
    expect(devUsdc(1500000)).toBe("1.5 devUSDC");
    expect(usd(null)).toBe("n/a");
    expect(toBase("0.2")).toBe(200000);
  });
});
