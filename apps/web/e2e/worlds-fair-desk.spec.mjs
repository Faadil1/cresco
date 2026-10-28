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
      useCase: state.useCase ?? "capital",
      createdAt: "2026-10-12T12:00:00Z",
      roles: state.useCase === "family"
        ? { principal: { label: "Parent", wallet: null }, operator: { label: "Teen" }, risk: { label: "Second parent" } }
        : { principal: { label: "Allocator", wallet: null }, operator: { label: "Strategy" }, risk: { label: "Risk" } },
      policy: { maxActionNotionalMicroUsd: 500000, maxPeriodNotionalMicroUsd: 10000000, maxActionAmount: 5000000, maxPeriodAmount: 10000000 },
      requestTtlSeconds: 1800,
      notifications: { webhookConfigured: false },
      chain: { status: "READY", accounts: { mandate: "MandatePda" } },
      truthBoundary: {},
    };
    if (method === "POST" && path === `/workspaces/${WS_ID}/roles/operator/rotate`) {
      if (req.headers()["authorization"] !== "Bearer wf_principal_e2e") return json(403, { error: "ROLE_FORBIDDEN" });
      state.revokedOperator = true;
      state.rotations = (state.rotations ?? 0) + 1;
      return json(200, { workspaceId: WS_ID, role: "operator", token: "wf_operator_replaced", onChainAuthorityChanged: false });
    }
    if (state.revokedOperator && req.headers()["authorization"] === "Bearer wf_operator_e2e") {
      return json(401, { error: "AUTH_INVALID", message: "Old role link invalidated" });
    }
    if (method === "POST" && path === `/workspaces/${WS_ID}/principal/recovery/challenge`) {
      return json(201, {
        workspaceId: WS_ID, challengeId: "prc_e2e", nonce: "nonce_e2e",
        expiresAt: "2026-10-28T18:00:00.000Z",
        message: "CRESCO Family principal API access recovery",
      });
    }
    if (method === "POST" && path === `/workspaces/${WS_ID}/principal/recovery/complete`) {
      const input = req.postDataJSON();
      if (input.challengeId !== "prc_e2e" || input.nonce !== "nonce_e2e" ||
          input.publicKey !== "E2EWallet111" || input.signature !== "AQID") {
        return json(401, { error: "PARENT_RECOVERY_SIGNATURE_INVALID" });
      }
      state.recovered = true;
      return json(200, {
        workspaceId: WS_ID, onChainAuthorityChanged: false,
        tokens: { principal: "wf_principal_new_e2e", operator: "wf_operator_new_e2e", risk: "wf_risk_new_e2e" },
      });
    }
    if (method === "POST" && path === "/workspaces") return json(201, { ...ws, tokens: { operator: "wf_operator_e2e", principal: "wf_principal_e2e", risk: "wf_risk_e2e" }, tokenNotice: "shown once" });
    if (method === "GET" && path === `/workspaces/${WS_ID}`) return json(200, ws);
    if (method === "GET" && path === `/workspaces/${WS_ID}/intents/safety`) {
      return json(200, {
        blocked: Boolean(state.intentHeld),
        code: state.intentHeld ? "INTENT_RECONCILIATION_REQUIRED" : null,
        eventId: state.intentHeld ? "evt-e2e-unknown" : null,
        idempotencyKey: state.lastIntentKey ?? null,
        lastResolution: state.intentHeld ? "NO_SIGNATURE_RECORDED" : null,
        retryPolicy: state.intentHeld ? "NO_NEW_INTENT_UNTIL_VERIFIED_SIGNATURE" : "NORMAL",
        requiresManualReview: Boolean(state.intentHeld),
        note: state.intentHeld ? "Unverified trade outcome" : "No unresolved trades",
      });
    }
    if (method === "POST" && path === `/workspaces/${WS_ID}/reconcile`) {
      return json(200, { reconciled: state.intentHeld
        ? [{ unknownEventId: "evt-e2e-unknown", resolution: "NO_SIGNATURE_RECORDED" }]
        : [] });
    }
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
      state.intentSubmits = (state.intentSubmits ?? 0) + 1;
      state.lastIntentKey = req.headers()["idempotency-key"];
      if (state.intentHeld) return json(409, {
        error: "INTENT_RECONCILIATION_REQUIRED", message: "Prior trade is unverified",
      });
      const body = req.postDataJSON();
      if (state.nextIntentUnknown) {
        state.nextIntentUnknown = false;
        state.intentHeld = true;
        return json(503, {
          decision: "UNKNOWN", eventId: "evt-e2e-unknown",
          retryPolicy: "REQUIRES_STATE_RECONCILIATION",
          message: "The program outcome could not be confirmed.",
        });
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
  const state = { requests: [], events: [], nextIntentUnknown: false, intentHeld: false, intentSubmits: 0 };
  await mockApi(page, state);
  await page.goto("/worlds-fair/desk", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /create workspace/i }).click();
  await expect(page.getByText(/hand each role its own link/i)).toBeVisible();
  await page.getByRole("button", { name: /continue to the desk/i }).click();

  await page.getByRole("tab", { name: /operator/i }).click();
  await page.getByLabel(/swap amount/i).fill("0.20");
  await page.getByRole("button", { name: /submit intent/i }).click();
  await expect(page.getByText(/Done alone · inside the standing limit/)).toBeVisible();

  await page.getByLabel(/swap amount/i).fill("0.75");
  await page.getByRole("button", { name: /submit intent/i }).click();
  await expect(page.getByText(/Above the limit · asked .* once/i).first()).toBeVisible();

  await page.getByRole("tab", { name: /principal/i }).click();
  const card = page.getByTestId("request-req-e2e000000001");
  await expect(card.getByText("Requested $0.75")).toBeVisible();
  await card.getByText(/on-chain details/i).click();
  await expect(card.getByText(/MAX_ACTION_NOTIONAL/)).toBeVisible();
  await card.getByRole("button", { name: /approve exactly once/i }).click();
  await page.getByText(/decided requests/i).click();
  await expect(page.getByText(/Executed once\. Standing authority changed: no\./).first()).toBeVisible();

  state.nextIntentUnknown = true;
  await page.getByRole("tab", { name: /operator/i }).click();
  await page.getByRole("button", { name: /submit intent/i }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Outcome UNKNOWN" })).toContainText("does not show success");
  await expect(page.getByRole("button", { name: /submit intent/i })).toBeDisabled();
  expect(state.intentSubmits).toBe(3);
  await page.getByRole("button", { name: /reconcile and check mandate/i }).click();
  await expect(page.getByText(/Still blocked: there is no verified final signature/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /submit intent/i })).toBeDisabled();
  expect(state.intentSubmits).toBe(3);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test("separate Teen and Parent browsers observe a request and a decision without manual reload", async ({ browser }) => {
  const state = { useCase: "family", requests: [], events: [], nextIntentUnknown: false };
  const teenContext = await browser.newContext({ ...devices["iPhone 13"] });
  const parentContext = await browser.newContext({ ...devices["iPhone 13"] });
  try {
    const teen = await teenContext.newPage();
    const parent = await parentContext.newPage();
    await teen.addInitScript(({ id }) => {
      localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({ workspaceId: id, tokens: { operator: "wf_operator_e2e" } }));
    }, { id: WS_ID });
    await parent.addInitScript(({ id }) => {
      localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({ workspaceId: id, tokens: { principal: "wf_principal_e2e" } }));
    }, { id: WS_ID });
    await mockApi(teen, state);
    await mockApi(parent, state);
    await teen.goto("/worlds-fair/desk?case=family");
    await parent.goto("/worlds-fair/desk?case=family");

    await expect(teen.getByRole("tab", { name: /^Teen$/i })).toBeVisible();
    await expect(teen.getByRole("tab", { name: /^Parent$/i })).toHaveCount(0);
    await expect(parent.getByRole("tab", { name: /^Parent$/i })).toBeVisible();
    await expect(parent.getByRole("tab", { name: /^Teen$/i })).toHaveCount(0);
    await expect(parent.getByText(/Nothing waiting\. Requests appear here/i)).toBeVisible();

    await teen.getByLabel(/amount to invest/i).fill("0.75");
    await teen.getByRole("button", { name: /submit intent/i }).click();
    await expect(teen.getByText(/Above the limit/i).first()).toBeVisible();

    await parent.evaluate(() => window.dispatchEvent(new Event("focus")));
    const approval = parent.getByTestId("request-req-e2e000000001");
    await expect(approval.getByRole("button", { name: /approve exactly once/i })).toBeEnabled();
    await approval.getByRole("button", { name: /approve exactly once/i }).click();
    await expect(parent.getByText(/decided requests/i)).toBeVisible();

    await teen.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(teen.getByTestId("request-req-e2e000000001")).toContainText(/executed once/i);
    expect(await teen.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  } finally {
    await teenContext.close();
    await parentContext.close();
  }
});

test("Family creator keeps only Parent authority, importing Teen replaces it", async ({ page }) => {
  const state = { useCase: "family", requests: [], events: [], nextIntentUnknown: false };
  await mockApi(page, state);
  await page.goto("/worlds-fair/desk?case=family");
  await page.getByRole("button", { name: /create workspace/i }).click();
  await expect(page.getByText(/keeps only the Parent role/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /copy link/i })).toHaveCount(3);
  await page.getByRole("button", { name: /continue to the desk/i }).click();
  await expect(page.getByRole("tab", { name: /^Parent$/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /^Teen$/i })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("cresco-worlds-fair-desk-v1")).tokens))
    .toEqual({ principal: "wf_principal_e2e" });

  await page.goto(`/worlds-fair/desk?case=family#ws=${WS_ID}&role=operator&token=wf_operator_e2e`);
  await expect(page.getByRole("tab", { name: /^Teen$/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /^Parent$/i })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("cresco-worlds-fair-desk-v1")).tokens))
    .toEqual({ operator: "wf_operator_e2e" });
  expect(new URL(page.url()).hash).toBe("");
});

test("Parent replaces a Teen link: old Teen browser is denied, new role link restores access", async ({ browser }) => {
  const state = { useCase: "family", requests: [], events: [], revokedOperator: false, rotations: 0 };
  const parentContext = await browser.newContext({ ...devices["iPhone 13"] });
  const oldTeenContext = await browser.newContext({ ...devices["iPhone 13"] });
  const newTeenContext = await browser.newContext({ ...devices["iPhone 13"] });
  try {
    const parent = await parentContext.newPage();
    const oldTeen = await oldTeenContext.newPage();
    const newTeen = await newTeenContext.newPage();
    await parent.addInitScript(({ id }) => {
      localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({ workspaceId: id, tokens: { principal: "wf_principal_e2e" } }));
    }, { id: WS_ID });
    await oldTeen.addInitScript(({ id }) => {
      localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({ workspaceId: id, tokens: { operator: "wf_operator_e2e" } }));
    }, { id: WS_ID });
    await newTeen.addInitScript(({ id }) => {
      localStorage.setItem("cresco-worlds-fair-desk-v1", JSON.stringify({ workspaceId: id, tokens: { operator: "wf_operator_replaced" } }));
    }, { id: WS_ID });
    await mockApi(parent, state);
    await mockApi(oldTeen, state);
    await mockApi(newTeen, state);

    await oldTeen.goto("/worlds-fair/desk?case=family");
    await expect(oldTeen.getByRole("tab", { name: /^Teen$/i })).toBeVisible();
    await parent.goto("/worlds-fair/desk?case=family");
    await expect(parent.getByRole("button", { name: /replace Teen access/i })).toBeVisible();
    await parent.getByRole("button", { name: /replace Teen access/i }).click();
    expect(state.rotations).toBe(0);
    await parent.getByRole("button", { name: /confirm link replacement/i }).click();
    await expect(parent.getByRole("button", { name: /copy replacement link/i })).toBeVisible();
    expect(state.rotations).toBe(1);

    await oldTeen.reload();
    await expect(oldTeen.getByRole("alert").filter({ hasText: "Old role link invalidated" })).toBeVisible();
    await expect(oldTeen.getByRole("button", { name: /submit intent/i })).toHaveCount(0);

    await newTeen.goto("/worlds-fair/desk?case=family");
    await expect(newTeen.getByRole("tab", { name: /^Teen$/i })).toBeVisible();
    await expect(newTeen.getByRole("tab", { name: /^Parent$/i })).toHaveCount(0);
  } finally {
    await parentContext.close();
    await oldTeenContext.close();
    await newTeenContext.close();
  }
});

test("Family Parent wallet lost-link recovery rekeys all role links, persists only Parent (mock wallet/API)", async ({ page }) => {
  const state = { useCase: "family", requests: [], events: [], recovered: false };
  await page.addInitScript(() => {
    Object.defineProperty(window, "phantom", {
      configurable: true,
      value: { solana: {
        connect: async () => ({ publicKey: { toString: () => "E2EWallet111" } }),
        signMessage: async () => ({ signature: new Uint8Array([1, 2, 3]) }),
      } },
    });
  });
  await mockApi(page, state);
  await page.goto("/worlds-fair/desk?case=family");
  await page.getByPlaceholder("ws-...").fill(WS_ID);
  await page.getByRole("button", { name: /recover with parent wallet/i }).click();
  await expect(page.getByText(/hand each role its own link/i)).toBeVisible();
  expect(state.recovered).toBe(true);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("cresco-worlds-fair-desk-v1")).tokens))
    .toEqual({ principal: "wf_principal_new_e2e" });
  await expect(page.getByText(/ALL previous Family links are invalid/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /copy link/i })).toHaveCount(3);
});
