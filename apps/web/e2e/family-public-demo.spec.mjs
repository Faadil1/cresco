import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["iPhone 13"] });

test("public Family gives Child + Parent a complete practice loop without sign-in or backend", async ({ page }, testInfo) => {
  const outbound = [];
  page.on("request", request => {
    if (["cresco-family-api", "keys-api-stocklana", "api.solana", "rpc.solana", "/api/family-practice", "/api/v0"].some(value => request.url().includes(value))) {
      outbound.push({ method: request.method(), url: request.url() });
    }
  });

  await page.goto("/try");
  await expect(page.getByRole("heading", { name: /a whole family can learn to decide/i })).toBeVisible();
  await expect(page.getByText(/two simulated perspectives\. pretend credits only/i)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Child demo navigation" })).toBeInViewport();
  await expect(page.getByTestId("family-public-studio")).toBeVisible();
  await expect(page.getByTestId("practice-available")).toHaveText("100");
  await testInfo.attach("family-child-mobile.png", { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });

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
  await testInfo.attach("family-parent-request-mobile.png", { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });
  await page.getByRole("button", { name: /approve once #2/i }).click();
  await expect(page.getByRole("status")).toHaveText(/Key did not widen/i);

  await page.getByRole("button", { name: /child view/i }).click();
  await page.getByRole("button", { name: /practice MKT choice/i }).click();
  await expect(page.getByRole("status")).toHaveText(/exact one-time practice approval used/i);
  await page.getByRole("button", { name: /practice MKT choice/i }).click();
  await expect(page.getByRole("status")).toHaveText(/cannot be replayed/i);
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: /portfolio/i }).click();
  await expect(page.getByTestId("portfolio-available")).toHaveText("45");
  await page.getByRole("button", { name: "Hypothetical downturn" }).click();
  await expect(page.getByTestId("scenario-hypothetical")).toHaveText("29.50");
  await expect(page.getByTestId("scenario-delta")).toHaveText("-5.50");
  await expect(page.getByTestId("portfolio-available")).toHaveText("45");
  await page.getByRole("button", { name: "Original sample prices" }).click();
  await expect(page.getByTestId("scenario-hypothetical")).toHaveText("35.00");

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
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: "Together" }).click();
  await page.getByRole("button", { name: /save first for the near-term bike goal/i }).click();
  await expect(page.getByTestId("together-child-answer")).toHaveText(/save first for the near-term bike goal/i);

  await page.getByRole("button", { name: /parent view/i }).click();
  await page.getByRole("navigation", { name: "Parent demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await expect(page.getByRole("progressbar", { name: "parent learning progress" })).toHaveAttribute("aria-valuenow", "0");
  await page.getByRole("button", { name: /lesson 1 · 3 min money & family conversations/i }).click();
  await page.getByRole("button", { name: /talk about goals and what money is for/i }).click();
  await page.getByRole("button", { name: "Complete lesson" }).click();
  await expect(page.getByRole("progressbar", { name: "parent learning progress" })).toHaveAttribute("aria-valuenow", "1");
  await page.getByRole("navigation", { name: "Parent demo navigation" }).getByRole("button", { name: /learn together/i }).click();
  await expect(page.getByTestId("together-child-answer")).toHaveText(/save first for the near-term bike goal/i);
  await page.getByRole("button", { name: /discuss risk before changing any limits/i }).click();
  await expect(page.getByTestId("together-parent-answer")).toHaveText(/discuss risk before changing any limits/i);
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

test("restores a sourced and illustrated original Cresco Child lesson behind the Family-only route", async ({ page }) => {
  await page.goto("/try");
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByRole("button", { name: /lesson 4.*what is a stock/i }).click();
  await expect(page.getByRole("heading", { name: "What Is a Stock?" })).toBeVisible();
  await expect(page.getByText(/Educational reference:/i).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Original Cresco lesson concepts" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Investor.gov/i }).first()).toHaveAttribute("href", /investor.gov/);
  await expect(page.getByText(/source checked 2026-09-25/i).first()).toBeVisible();
  await page.getByRole("button", { name: /a part owner/i }).click();
  await page.getByRole("button", { name: "Complete lesson" }).click();
  await expect(page.getByRole("progressbar", { name: "child learning progress" })).toHaveAttribute("aria-valuenow", "1");
  await page.reload();
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await expect(page.getByRole("progressbar", { name: "child learning progress" })).toHaveAttribute("aria-valuenow", "0");
});


test.describe("desktop Family UX audit evidence", () => {
  // The project already runs WebKit. Overriding defaultBrowserType inside
  // describe() prevents Playwright from collecting ANY tests on Windows.
  // Use only context-level desktop emulation options here.
  test.use({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    userAgent: devices["Desktop Safari"].userAgent,
  });

  test("shows a personalized Child goal in the Parent dashboard with distinct desktop learning paths", async ({ page }, testInfo) => {
    await page.goto("/try");
    await expect(page.getByTestId("guided-next-step")).toBeVisible();
    await page.getByRole("button", { name: /gaming setup.*80 pretend credits/i }).click();
    await expect(page.getByRole("progressbar", { name: "Fictional saving goal progress" })).toHaveAttribute("aria-valuemax", "80");
    await page.getByRole("button", { name: /set aside 20/i }).click();
    await expect(page.getByTestId("practice-saved")).toHaveText("20");
    await testInfo.attach("family-child-desktop.png", { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });

    await page.getByRole("button", { name: /parent view/i }).click();
    await expect(page.getByRole("heading", { name: "Guide with confidence." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gaming setup" })).toBeVisible();
    await expect(page.getByText(/20 of 80 credits set aside/i)).toBeVisible();
    await page.getByRole("navigation", { name: "Parent demo navigation" })
      .getByRole("button", { name: "Learn", exact: true }).click();
    await expect(page.getByText("Parent Learning Path")).toBeVisible();
    await testInfo.attach("family-parent-learning-desktop.png", { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });

    await page.getByRole("button", { name: /child view/i }).click();
    await page.getByRole("navigation", { name: "Child demo navigation" })
      .getByRole("button", { name: "Home" }).click();
    await expect(page.getByText(/20 of 80 pretend credits saved for gaming setup/i)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1)).toBe(false);
    await page.reload();
    await expect(page.getByText(/Saving goal · New bike/i)).toBeVisible();
    await expect(page.getByTestId("practice-saved")).toHaveText("0");
  });
});

test("learning actions lead to relevant Parent and Child practice screens on mobile", async ({ page }) => {
  await page.goto("/try");
  await expect(page.getByText(/Swipe to see more tabs · These roles are simulated/i)).toBeVisible();
  await page.getByRole("navigation", { name: "Child demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByRole("button", { name: /lesson 1 · 3 min save for a goal/i }).click();
  await page.getByRole("button", { name: "Practice this in Child view" }).click();
  await expect(page.getByRole("heading", { name: /hey, future explorer/i })).toBeVisible();

  await page.getByRole("button", { name: /parent view/i }).click();
  await page.getByRole("navigation", { name: "Parent demo navigation" }).getByRole("button", { name: "Learn", exact: true }).click();
  await page.getByRole("button", { name: /lesson 2 · 4 min understand my key/i }).click();
  await page.getByRole("button", { name: "Apply this in Parent view" }).click();
  await expect(page.getByRole("heading", { name: /set the room to decide/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /explicitly update standing key/i })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
});

test("Child Explore research has search, compare and risk questions without granting authority", async ({ page }, testInfo) => {
  const outbound = [];
  page.on("request", request => {
    if (["cresco-family-api", "keys-api-stocklana", "api.solana", "rpc.solana", "/api/family-practice"].some(value => request.url().includes(value))) outbound.push(request.url());
  });
  await page.goto("/try");
  await page.getByRole("navigation", { name: "Child demo navigation" })
    .getByRole("button", { name: "Explore" }).click();
  await expect(page.getByTestId("family-research-explore")).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search fictional research examples" })).toBeInViewport({ ratio: 0.2 });
  await testInfo.attach("family-child-explore-mobile.png", { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });
  await expect(page.getByText(/6 fictional research examples shown/i)).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Search fictional research examples" });
  await search.fill("clinics");
  await expect(page.getByText(/1 fictional research example shown/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Harbor Medical Tools" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Practice HBR choice/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Research Harbor Medical Tools" }).click();
  await expect(page.getByText(/Does a useful health product automatically/i)).toBeVisible();
  await page.getByRole("button", { name: /No, quality, costs and customers still matter/i }).click();
  await expect(page.getByText(/Product usefulness and investment value are different/i)).toBeVisible();

  await search.fill("");
  await page.getByRole("button", { name: "Compare Orchard Technology" }).click();
  await page.getByRole("button", { name: "Compare Neighborhood Markets" }).click();
  await expect(page.getByRole("region", { name: "Side-by-side example comparison" })).toBeVisible();
  await page.getByRole("button", { name: "Clear comparison" }).click();
  await expect(page.getByRole("region", { name: "Side-by-side example comparison" })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Child demo navigation" })
    .getByRole("button", { name: "Home" }).click();
  await expect(page.getByTestId("practice-available")).toHaveText("100");
  expect(await page.evaluate(() => document.documentElement.scrollWidth >
    document.documentElement.clientWidth + 1)).toBe(false);
  expect(outbound).toEqual([]);
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
