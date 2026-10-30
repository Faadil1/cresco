import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["iPhone 13"] });

test("public Cresco demo works immediately, on one phone, without accounts or API calls", async ({ page }) => {
  const outbound = [];
  page.on("request", (request) => {
    if (/cresco-family-api|keys-api-stocklana|api\.solana|rpc\.solana|\/api\/family-practice/.test(request.url())) {
      outbound.push({ method: request.method(), url: request.url() });
    }
  });
  await page.goto("/try");
  await expect(page.getByRole("heading", { name: /experience cresco in one minute/i })).toBeVisible();
  await expect(page.getByText(/no invitation\. no parent or teen codes/i)).toBeVisible();
  await expect(page.getByTestId("practice-available")).toHaveText("100");
  await page.getByRole("button", { name: /set aside 20 practice credits/i }).click();
  await expect(page.getByTestId("practice-available")).toHaveText("80");
  await expect(page.getByTestId("practice-saved")).toHaveText("20");
  await page.getByRole("button", { name: /ask to explore a diversified fund/i }).click();
  await expect(page.getByRole("status")).toHaveText(/waiting for a Parent decision/i);
  await page.getByRole("button", { name: /approve practice discussion/i }).click();
  await expect(page.getByRole("status")).toHaveText(/nothing was purchased/i);
  await page.getByRole("button", { name: /reset practice/i }).click();
  await page.getByRole("button", { name: /ask to explore a diversified fund/i }).click();
  await page.getByRole("button", { name: /decline practice discussion/i }).click();
  await expect(page.getByRole("status")).toHaveText(/parent declined/i);
  await page.reload();
  await expect(page.getByTestId("practice-available")).toHaveText("100");
  await expect(page.getByTestId("practice-saved")).toHaveText("0");
  expect(outbound).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth >
    document.documentElement.clientWidth + 1)).toBe(false);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain("pr_");
});

test("visitor gets demo from landing and cannot navigate to invited or Devnet routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /try cresco - no sign-in/i }).click();
  await expect(page).toHaveURL(/\/try$/);
  await expect(page.getByTestId("family-agency-preview")).toBeVisible();
  await page.goto("/family-practice");
  await expect(page.locator("body")).toContainText("This deployment is Family-only.");
  await page.goto("/worlds-fair/desk?case=family");
  await expect(page.locator("body")).toContainText("This deployment is Family-only.");
});

test("public Family Worker refuses historical API and finance routes on direct GET", async ({ request }) => {
  for (const path of [
    "/api/v0.4/worlds-fair/openapi",
    "/api/v0.4/worlds-fair/workspaces/example",
    "/worlds-fair/desk/capital",
    "/family-practice",
  ]) {
    const response = await request.get(path);
    expect(response.status(), `Historical route must be closed: ${path}`).toBe(404);
  }
});
