import { test, expect, devices } from "@playwright/test";

// Browser regression for the World's Fair operator/principal desk.
// The v0.4 API is mocked with page.route so the test covers the UI contract
// (success, soft-boundary request, principal decision, UNKNOWN recovery,
// no horizontal overflow) without Devnet writes.

test.use({ ...devices["iPhone 13"] });

const WS_ID = "ws-e2edesk0001";

function mockApi(page, state) {
  return page.route("**/api/v0.4/worlds-fair/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace("/api/v0.4/worlds-fair", "");
    const method = req.method();
    const json = (status, body) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    const ws = {
      id: WS_ID,
      name: "E2E desk",
      createdAt: "2026-10-12T12:00:00Z",
      roles: { principal: { label: "Allocator", wallet: null }, operator: { label: "Strategy" }, risk: { label: "Risk" } },
      policy: { maxActionNotionalMicroUsd: 500000, maxPeriodNotionalMicroUsd: 10000000, maxActionAmount: 5000000, maxPeriodAmount: 10000000 },
      requestTtlSeconds: 1800,
      notifications: { webhookConfigured: false },
      chain: { status: "READY", accounts: { mandate: "MandatePda" } },
      truthBoundary: {},
    };
    if (method === "POST" && path === "/workspaces") return json(201, { ...ws, tokens: { operator: "wf_operator_e2e", principal: "wf_principal_e2e", risk: "wf_risk_e2e" }, tokenNotice: "shown once" });
    if (method === "GET" && path === `/workspaces/${WS_ID}`) return json(200, ws);
    if (method === "GET" && path === `/workspaces/${WS_ID}/requests`) return json(200, { requests: state.requests });
    if (method === "GET" && path === `/workspaces/${WS_ID}/history`) return json(200, { events: state.events });
    if (method === "GET" && path === `/workspaces/${WS_ID}/notifications`) return json(200, { role: "principal", pendingDecisions: state.requests.filter((r) => r.status === "PENDING").length, pending: [], notifications: [], cursor: 0 });
    if (method === "GET" && path === `/workspaces/${WS_ID}/mandate`) {
      return json(200, {
        workspaceId: WS_ID, accounts: {}, guardian: "G", delegate: "D",
        mandate: { stage: 3, status: "ACTIVE", version: 7, nonce: 7, maxActionNotionalMicroUsd: 500000, maxPeriodNotionalMicroUsd: 10000000 },
        assetRule: { enabled: true, maxActionAmount: 5000000, maxPeriodAmount: 10000000, periodSeconds: 86400, spentThisPeriod: 200000, spentThisPeriodNotionalMicroUsd: 200000 },
        consumption: { periodEndsAt: "2026-10-13T12:00:00Z", periodActive: true, spentAmount: 200000, maxPeriodAmount: 10000000, amountUsedPct: 2, spentNotionalMicroUsd: 200000, maxPeriodNotionalMicroUsd: 10000000, notionalUsedPct: 2 },
        observedAt: "2026-10-12T12:02:00Z",
      });
    }
    if (method === "POST" && path === `/workspaces/${WS_ID}/intents`) {
      const body = req.postDataJSON();
      if (state.nextIntentUnknown) {
        state.nextIntentUnknown = false;
        return json(503, { decision: "UNKNOWN", retryPolicy: "REQUIRES_STATE_RECONCILIATION", message: "The program outcome could not be confirmed." });
      }
      if (body.inputAmount > 500000) {
        const request = {
          id: "req-e2e000000001", status: "PENDING", createdAt: "2026-10-12T12:01:00Z", expiresAt: "2026-10-12T12:31:00Z",
          intent: { action: "SWAP_EXACT_IN", inputAmount: body.inputAmount, maxSlippageBps: body.maxSlippageBps },
          mandateNonce: 7, requestedNotionalMicroUsd: body.inputAmount, standingMaxNotionalMicroUsd: 500000,
          policyDiff: { violatedDimensions: ["MAX_ACTION_NOTIONAL"] }, refusal: { code: "PythNotionalExceeded", evidence: "PROGRAM_PREFLIGHT_SIMULATION" },
        };
        state.requests = [request];
        state.events = [{ id: "e2", seq: 2, at: "2026-10-12T12:01:00Z", type: "EXCEPTION_REQUESTED", actor: "operator", summary: "Outside standing authority; exact exception requested", signatures: [] }, ...state.events];
        return json(202, { decision: "PENDING_PRINCIPAL", boundary: "SOFT", policyDiff: request.policyDiff, request, refusal: request.refusal });
      }
      state.events = [{ id: "e1", seq: 1, at: "2026-10-12T12:00:30Z", type: "INTENT_ALLOWED", actor: "operator", summary: "Swap executed inside standing authority", signatures: [{ label: "standing.execute", signature: "s".repeat(64), explorer: "https://explorer.solana.com/tx/sss?cluster=devnet" }] }, ...state.events];
      return json(200, { decision: "ALLOW", boundary: "STANDING", principalApprovalRequired: false, receipt: { eventId: "e1", signature: "s".repeat(64), explorer: "https://explorer.solana.com/tx/sss?cluster=devnet", quote: { inputAmount: body.inputAmount, notionalMicroUsd: body.inputAmount }, effectObserved: true } });
    }
    if (method === "POST" && path.endsWith("/decision")) {
      const executed = { ...state.requests[0], status: "EXECUTED", execution: { signature: "e".repeat(64), allowanceConsumed: true, standingAuthorityChanged: false }, grant: { signature: "g".repeat(64) } };
      state.requests = [executed];
      return json(200, { request: executed });
    }
    return json(404, { error: "NOT_FOUND" });
  });
}

test("operator ALLOW, soft boundary to principal approval, and UNKNOWN shown as unconfirmed", async ({ page }) => {
  const state = { requests: [], events: [], nextIntentUnknown: false };
  await mockApi(page, state);
  await page.goto("/worlds-fair/desk", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /create workspace/i }).click();
  await expect(page.getByText(/hand each role its own link/i)).toBeVisible();
  await page.getByRole("button", { name: /continue to the desk/i }).click();

  await page.getByRole("tab", { name: /operator/i }).click();
  await page.getByLabel(/swap amount/i).fill("0.20");
  await page.getByRole("button", { name: /submit intent/i }).click();
  await expect(page.getByText(/ALLOW · executed inside standing authority/)).toBeVisible();

  await page.getByLabel(/swap amount/i).fill("0.75");
  await page.getByRole("button", { name: /submit intent/i }).click();
  await expect(page.getByText(/exact exception requested/i).first()).toBeVisible();

  await page.getByRole("tab", { name: /principal/i }).click();
  const card = page.getByTestId("request-req-e2e000000001");
  await expect(card.getByText(/MAX_ACTION_NOTIONAL/)).toBeVisible();
  await card.getByRole("button", { name: /approve exactly once/i }).click();
  await page.getByText(/decided requests/i).click();
  await expect(page.getByText(/Executed once · allowance consumed: true · standing authority changed: false/)).toBeVisible();

  state.nextIntentUnknown = true;
  await page.getByRole("tab", { name: /operator/i }).click();
  await page.getByRole("button", { name: /submit intent/i }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Outcome UNKNOWN" })).toContainText("does not show success");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});
