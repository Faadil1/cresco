import { test, expect, devices } from "@playwright/test";

// Navigation-only regression: no API writes, no wallet interactions.
test.use({ ...devices["iPhone 13"] });

test("CRESCO unifies Family and Delegated capital entry", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /act alone inside the rules/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /freedom inside a family key/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /authority for strategies and agents/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Enter Family" })).toHaveAttribute("href", "/start");
  await expect(page.getByRole("link", { name: "Live family mandate on Solana" })).toHaveAttribute("href", "/worlds-fair/desk?case=family");
  await expect(page.getByRole("link", { name: "Parent sign-in" })).toHaveAttribute("href", "/parent/sign-in");
  await page.getByRole("link", { name: "Enter Delegated capital" }).click();
  await expect(page).toHaveURL(/\/worlds-fair\/desk\?case=capital$/);
  await expect(page.getByRole("radio", { name: /delegated capital/i })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("link", { name: "CRESCO home" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
});
