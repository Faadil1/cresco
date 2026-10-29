import { test, expect, devices } from "@playwright/test";

const ROOT = "/api/family-practice/v1";
const PRACTICE_ID = "00000000-0000-4000-8000-000000000001";
const TEEN_TOKEN = "pr_" + "a".repeat(64);
const PARENT_TOKEN = "pr_" + "b".repeat(64);
const INVITE = "fictional-research-code-123";
const ID = (n) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");

function stateStore() {
  let current = {
    version: 0, available: 100, saved: 0, requests: [], events: [], closed: false
  };
  let sequence = 0;
  let unavailable = false;
  const observed = [];
  const json = (route, status, body) => route.fulfill({
    status,
    contentType: "application/json",
    headers: {
      "access-control-allow-origin": "http://127.0.0.1:3100",
      "cache-control": "no-store",
      "vary": "Origin"
    },
    body: JSON.stringify(body),
  });
  const snapshot = (role) => ({
    contract: "CRESCO_FAMILY_PRACTICE_1",
    kind: "FICTIONAL_CREDITS_ONLY",
    role, practiceId: PRACTICE_ID,
    version: current.version,
    createdAt: "2026-10-29T00:00:00Z",
    expiresAt: "2026-11-05T00:00:00Z",
    availableCredits: current.available,
    savedCredits: current.saved,
    requests: current.requests.map(x => ({ ...x })),
    events: current.events.map(x => ({ ...x })),
    truthBoundary: {
      realMoney: false, crypto: false, stocks: false, yield: false,
      blockchainWrites: false, guardianIdentityVerified: false,
      thisIsLegalConsent: false
    }
  });
  const handle = async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname.replace(ROOT, "");
    const method = req.method();
    observed.push({ method, path });
    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, headers: {
        "access-control-allow-origin": "http://127.0.0.1:3100",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "authorization,content-type,x-cresco-family-practice-invite,x-practice-action-id",
      } });
    }
    if (method === "POST" && path === "/sessions") {
      if (req.headers()["x-cresco-family-practice-invite"] !== INVITE) {
        return json(route, 401, { error: "PRACTICE_INVITE_INVALID" });
      }
      return json(route, 201, {
        practiceId: PRACTICE_ID, parentToken: PARENT_TOKEN, teenToken: TEEN_TOKEN,
        expiresAfterDays: 7, notice: "Fictional credits only"
      });
    }
    if (!path.startsWith("/sessions/" + PRACTICE_ID)) {
      return json(route, 404, { error: "PRACTICE_NOT_FOUND" });
    }
    const token = req.headers().authorization?.replace("Bearer ", "");
    const role = token === PARENT_TOKEN ? "parent" : token === TEEN_TOKEN ? "teen" : null;
    if (current.closed) return json(route, 404, { error: "PRACTICE_NOT_FOUND" });
    if (!role) return json(route, 403, { error: "ROLE_INVALID" });
    if (unavailable && method === "GET") {
      return json(route, 503, { error: "PRACTICE_READ_UNVERIFIED" });
    }
    const remainder = path.slice(("/sessions/" + PRACTICE_ID).length);
    if (method === "GET" && !remainder) return json(route, 200, snapshot(role));
    if (method !== "POST") return json(route, 405, { error: "METHOD_NOT_ALLOWED" });
    const payload = req.postDataJSON();
    const at = "2026-10-29T19:00:00Z";
    const eventId = ID(++sequence);
    if (remainder === "/save" && role === "teen" && payload.credits === 20) {
      current.available -= 20; current.saved += 20; current.version++;
      current.events.push({ id: eventId, actor: "teen", at, credits: 20, type: "PRACTICE_SAVED" });
      return json(route, 200, snapshot(role));
    }
    if (remainder === "/request" && role === "teen" && payload.topic === "DIVERSIFIED_FUNDS") {
      const requestId = ID(++sequence);
      current.requests.push({
        id: requestId, at, topic: "DIVERSIFIED_FUNDS", status: "PENDING",
        decisionAt: null, reason: null
      });
      current.events.push({ id: requestId, actor: "teen", at, type: "DISCUSSION_REQUESTED" });
      current.version++;
      return json(route, 200, snapshot(role));
    }
    const found = remainder.match(/^\/requests\/(00000000-0000-4000-8000-[0-9]{12})\/decision$/);
    if (found && role === "parent") {
      const target = current.requests.find(x => x.id === found[1]);
      if (!target || target.status !== "PENDING") return json(route, 409, {error:"REQUEST_ALREADY_DECIDED"});
      target.status = payload.decision;
      target.decisionAt = at;
      target.reason = payload.reason;
      current.version++;
      current.events.push({ id: eventId, actor: "parent", at,
        requestId: target.id, reason: payload.reason,
        type: payload.decision === "DECLINE" ? "DISCUSSION_DECLINED" : "DISCUSSION_APPROVED" });
      return json(route, 200, snapshot(role));
    }
    if (remainder === "/close" && role === "parent" && payload.confirm === "END_PRACTICE") {
      current.closed = true;
      return json(route, 200, {
        closed: true, allRoleCodesRevoked: true, fictionalHistoryCleared: true
      });
    }
    return json(route, 403, { error: "ROLE_FORBIDDEN" });
  };
  return { handle, observed, setUnavailable: (value) => { unavailable = value; } };
}

// The historic Colosseum web build deliberately does not expose /family-practice.
// This test must run only in the independent Family-only browser workflow.
test.skip(process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY !== "1",
  "Run only in the isolated Family build; Colosseum routes remain frozen.");

test.use({ ...devices["iPhone 13"] });

test("two isolated browser contexts complete a fictional Teen to Parent to Teen loop", async ({ browser }) => {
  const api = stateStore();
  const teenContext = await browser.newContext({ ...devices["iPhone 13"] });
  const parentContext = await browser.newContext({ ...devices["iPhone 13"] });
  try {
    await teenContext.route("**/api/family-practice/v1/**", api.handle);
    await parentContext.route("**/api/family-practice/v1/**", api.handle);
    const teen = await teenContext.newPage();
    const parent = await parentContext.newPage();
    await teen.goto("/family-practice");
    await parent.goto("/family-practice");
    await expect(teen.getByText(/Nothing here is a real deposit/)).toBeVisible();
    await parent.getByLabel("Research invitation code").fill(INVITE);
    await parent.getByRole("button", { name: /Create fictional-credit practice/i }).click();
    await expect(parent.getByTestId("practice-issued-credentials")).toBeVisible();

    const connect = async (page, role, token) => {
      if (role === "parent") {
        await page.getByRole("button", { name: /^Parent$/ }).click();
      }
      await page.getByLabel("Practice ID").fill(PRACTICE_ID);
      await page.getByLabel(role === "parent" ? "Parent access code" : "Teen access code").fill(token);
      await page.getByRole("button", { name: "Open practice role" }).click();
      await expect(page.getByText(/Practice data verified/)).toBeVisible();
    };
    await connect(teen, "teen", TEEN_TOKEN);
    await connect(parent, "parent", PARENT_TOKEN);

    await expect(teen.getByRole("button", { name: /Set aside 20 fictional credits/i })).toBeEnabled();
    await expect(parent.getByRole("button", { name: /Set aside 20 fictional credits/i })).toHaveCount(0);

    await teen.getByRole("button", { name: /Set aside 20 fictional credits/i }).click();
    await expect(teen.getByTestId("practice-server-available")).toHaveText("80");
    await parent.getByRole("button", { name: /Refresh history/i }).click();
    await expect(parent.getByTestId("practice-server-saved")).toHaveText("20");

    await teen.getByRole("button", { name: /Ask to explore diversified funds/i }).click();
    await parent.getByRole("button", { name: /Refresh history/i }).click();
    await expect(parent.getByRole("button", { name: /Approve discussion only/i })).toBeVisible();
    await expect(teen.getByRole("button", { name: /Approve discussion only/i })).toHaveCount(0);
    await parent.getByRole("button", { name: /Approve discussion only/i }).click();
    await teen.getByRole("button", { name: /Refresh history/i }).click();
    await expect(teen.getByText(/Parent agreed to discuss the idea/)).toBeVisible();

    api.setUnavailable(true);
    await teen.getByRole("button", { name: /Refresh history/i }).click();
    await expect(teen.getByText(/Unverified or offline/)).toBeVisible();
    await expect(teen.getByRole("button", { name: /Set aside 20 fictional credits/i })).toBeDisabled();
    api.setUnavailable(false);
    await teen.getByRole("button", { name: /Refresh history/i }).click();
    await expect(teen.getByRole("button", { name: /Set aside 20 fictional credits/i })).toBeEnabled();

    await parent.getByRole("checkbox", { name: /I understand that this fictional exercise/ }).check();
    await parent.getByRole("button", { name: /End practice and erase history/i }).click();
    await expect(parent.getByText(/Practice ended. The service confirmed/)).toBeVisible();
    await teen.getByRole("button", { name: /Refresh history/i }).click();
    await expect(teen.getByText(/Unverified or offline/)).toBeVisible();
    await expect(teen.getByRole("button", { name: /Set aside 20 fictional credits/i })).toBeDisabled();

    expect(api.observed.some(x => x.path.includes("/save") && x.method === "POST")).toBe(true);
    expect(api.observed.some(x => x.path.endsWith("/close") && x.method === "POST")).toBe(true);
    for (const page of [teen, parent]) {
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
      const stored = await page.evaluate(() => ({ ...localStorage }));
      expect(JSON.stringify(stored)).not.toContain(TEEN_TOKEN);
      expect(JSON.stringify(stored)).not.toContain(PARENT_TOKEN);
    }
  } finally {
    await teenContext.close();
    await parentContext.close();
  }
});
