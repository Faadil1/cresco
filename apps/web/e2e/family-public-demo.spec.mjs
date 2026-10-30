import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["iPhone 13"] });

test("public Family gives Child + Parent a complete practice loop without sign-in or backend", async ({ page }) => {
  const outbound = [];
  page.on("request", request => {
    if (["cresco-family-api", "keys-api-stocklana", "api.solana", "rpc.solana", "/api/family-practice", "/api/v0"].some(value => request.url().includes(value))) {
      outbound.push({ method: request.method(), url: request.url() });
    }
  });

  await page.goto("/try");
  await expect(page.getByRole("heading", { name: /a whole family can learn to decide/i })).toBeVisible();
  await expect(page.getByText(/no invitation\. no parent or teen codes/i)).toBeVisible();
  await expect(page.getByTestId("family-public-studio")).toBeVisible();
  await expect(page.getByTestId("practice-available")).toHaveText("100");

  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: /explore/i }).click();
  await page.getByRole("button", { name: /set aside 20 practice credits/i }).click();
  await page.getByRole("button", { name: /practice ORC choice/i }).click();
  await expect(page.getByRole("status")).toHaveText(/independent practice action recorded/i);

  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: /portfolio/i }).click();
  await expect(page.getByTestId("portfolio-available")).toHaveText("70");
  await expect(page.getByText(/PRACTICE ONLY - NOT EXECUTED ONCHAIN/i)).toBeVisible();
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: /explore/i }).click();
  await page.getByRole("button", { name: /practice MKT choice/i }).click();
  await expect(page.getByRole("status")).toHaveText(/outside My Key: blocked/i);

  await page.getByRole("button", { name: /parent view/i }).click();
  await page.getByRole("navigation", { name: "Parent demo navigation" }).getByRole("button", { name: /requests/i }).click();
  await expect(page.getByRole("heading", { name: /25 practice credits · MKT/i })).toBeVisible();
  await page.getByRole("button", { name: /approve once #2/i }).click();
  await expect(page.getByRole("status")).toHaveText(/Key did not widen/i);

  await page.getByRole("button", { name: /child view/i }).click();
  await page.getByRole("button", { name: /practice MKT choice/i }).click();
  await expect(page.getByRole("status")).toHaveText(/exact one-time practice approval used/i);
  await page.getByRole("button", { name: /practice MKT choice/i }).click();
  await expect(page.getByRole("status")).toHaveText(/cannot be replayed/i);
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: /portfolio/i }).click();
  await expect(page.getByTestId("portfolio-available")).toHaveText("45");

  expect(outbound).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain("family-public-practice");
});

test("Parent and Child have independent interactive learning paths with the same family check-in", async ({ page }) => {
  await page.goto("/try");
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByRole("button", { name: /lesson 1 · 3 min save for a goal/i }).click();
  await page.getByRole("button", { name: /choose a goal and a time horizon/i }).click();
  await page.getByRole("button", { name: "Complete lesson" }).click();
  await expect(page.getByRole("progressbar", { name: "child learning progress" })).toHaveAttribute("aria-valuenow", "1");

  await page.getByRole("button", { name: /parent view/i }).click();
  await page.getByRole("navigation", { name: "Parent demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await expect(page.getByRole("progressbar", { name: "parent learning progress" })).toHaveAttribute("aria-valuenow", "0");
  await page.getByRole("button", { name: /lesson 1 · 3 min money & family conversations/i }).click();
  await page.getByRole("button", { name: /talk about goals and what money is for/i }).click();
  await page.getByRole("button", { name: "Complete lesson" }).click();
  await expect(page.getByRole("progressbar", { name: "parent learning progress" })).toHaveAttribute("aria-valuenow", "1");
  await page.getByRole("navigation", { name: "Parent demo navigation" }).getByRole("button", { name: /learn together/i }).click();
  await page.getByRole("button", { name: /mark our discussion complete/i }).click();
  await expect(page.getByRole("status")).toHaveText(/no financial permission changed/i);

  await page.getByRole("button", { name: /child view/i }).click();
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await expect(page.getByRole("progressbar", { name: "child learning progress" })).toHaveAttribute("aria-valuenow", "1");
  await page.reload();
  await expect(page.getByTestId("practice-available")).toHaveText("100");
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await expect(page.getByRole("progressbar", { name: "child learning progress" })).toHaveAttribute("aria-valuenow", "0");
});

test("visitor enters both profiles and historical routes remain unavailable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /try cresco - no sign-in/i }).click();
  await expect(page).toHaveURL(/\/try$/);
  await expect(page.getByTestId("family-public-studio")).toBeVisible();
  await page.getByRole("button", { name: /parent view/i }).click();
  await expect(page.getByRole("heading", { name: /guide with confidence/i })).toBeVisible();
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
    "/_next/image?url=%2Ficon.svg&w=256&q=75",
  ]) {
    const response = await request.get(path);
    expect(response.status(), `Historical route must be closed: ${path}`).toBe(404);
  }
});
