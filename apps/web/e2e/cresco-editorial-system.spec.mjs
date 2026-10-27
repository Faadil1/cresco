import { test, expect, devices } from "@playwright/test";

// Pure navigation/accessibility checks: no signing, wallet, or API writes.
test.use({ ...devices["iPhone 13"] });

const routes = ["/", "/how-it-works", "/start", "/parent/sign-in", "/worlds-fair/desk", "/worlds-fair"];

for (const route of routes) {
  test(`CRESCO editorial site stays readable without horizontal overflow: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
}

test("Family illustration and product truth remain visible on the landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: /illustrated parent and teenager/i })).toBeVisible();
  await expect(page.getByText("Illustrative Devnet example")).toBeVisible();
  await expect(page.getByText(/demo tokens only/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /a simple flow for real life/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Enter Delegated capital" })).toHaveAttribute("href", "/worlds-fair/desk?case=capital");
});

test("Family onboarding shows contextual people without removing demo disclosures", async ({ page }) => {
  await page.goto("/parent/sign-in");
  await expect(page.getByRole("img", { name: /illustrated parent reviewing a CRESCO request/i })).toBeVisible();
  await expect(page.getByText(/not identity verification/i)).toBeVisible();
});

test("Family onboarding does not collect pretend email identities and exposes safe Devnet handoff", async ({ page }) => {
  await page.goto("/start");
  await expect(page.getByRole("button", { name: /start guided learning/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /email/i })).toHaveCount(0);
  await expect(page.getByText(/ask your parent to create the family mandate/i)).toBeVisible();
  await expect(page.getByText(/demo assets/i)).toBeVisible();

  await page.goto("/parent/sign-in");
  await expect(page.getByRole("button", { name: /continue as .* \(demo\)/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /email/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /set up family mandate/i })).toHaveAttribute("href", "/worlds-fair/desk?case=family");
  await expect(page.getByText(/not verified identity/i)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
});
