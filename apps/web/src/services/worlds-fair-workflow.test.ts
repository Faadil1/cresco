import { afterEach, describe, expect, it, vi } from "vitest";

import { configureCrescoBackend } from "./cresco-backend";
import {
  devUsdc,
  parseShareFragment,
  shareLink,
  toBase,
  usd,
  workflowApi,
  WorkflowApiError,
} from "./worlds-fair-workflow";

afterEach(() => {
  configureCrescoBackend(null);
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
    await expect(workflowApi.history("ws-abcdef12")).rejects.toMatchObject({ code: "NETWORK_UNAVAILABLE" });
  });

  it("refuses to call an unconfigured API", async () => {
    configureCrescoBackend({ url: "", execution: "demo" });
    await expect(workflowApi.getWorkspace("ws-abcdef12")).rejects.toMatchObject({ code: "API_NOT_CONFIGURED" });
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
