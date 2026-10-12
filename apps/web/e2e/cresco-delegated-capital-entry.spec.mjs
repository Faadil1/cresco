import { test, expect } from "@playwright/test";

// Strictly read-only: opening the desk and choosing a presentation cannot create any mandate.
test("CRESCO capital entry via URL selects delegated context after hydration", async ({ page }) => {
  await page.goto("/worlds-fair/desk?case=capital");
  const capital = page.getByRole("radio", { name: "Delegated capital" });
  await expect(capital).toHaveAttribute("aria-checked", "true", { timeout: 20000 });
  await expect(page.getByText(/Delegated capital workspace/i)).toBeVisible();
  await expect(page.getByRole("img", { name: /illustrated professional reviewing a delegated financial mandate/i })).toBeVisible();
});

test("CRESCO capital context is selectable without API or wallet operations", async ({ page }) => {
  await page.goto("/worlds-fair/desk");
  const capital = page.getByRole("radio", { name: "Delegated capital" });
  await expect(capital).toBeVisible();
  await capital.click();
  await expect(capital).toHaveAttribute("aria-checked", "true", { timeout: 20000 });
  await expect(page.getByText(/Delegated capital workspace/i)).toBeVisible();
});
