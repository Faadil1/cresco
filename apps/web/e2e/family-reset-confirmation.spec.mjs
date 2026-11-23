import { test, expect } from "@playwright/test";

// Exact Family-only /try browser flows. Client-side navigation must preserve
// in-memory state; page.goto during an assertion would itself reset the demo.
const tab = (page, name) => page.locator('nav[aria-label="Main"]:visible').getByRole("link", { name, exact: true });

function observeForbiddenNetwork(page) {
  const forbidden = [];
  page.on("request", request => {
    const url = request.url();
    if (!url.startsWith("http://127.0.0.1:3100") ||
        url.includes("/api/") ||
        !["GET", "HEAD"].includes(request.method())) forbidden.push(request.method() + " " + url);
  });
  return forbidden;
}

async function seedPaperTrade(page) {
  await page.goto("/try/portfolio/companies");
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
  await page.getByTestId("market-price-input").fill("200.00");
  await page.getByTestId("market-quote-submit").click();
  await page.getByTestId("market-quantity-input").fill("0.50");
  await page.getByTestId("market-buy").click();
  await expect(page.getByTestId("market-cash")).toContainText("$900.00");
}

async function openPaperFromStory(page) {
  await tab(page, "Portfolio").click();
  await page.getByTestId("portfolio-go-real").click();
}

test("new-family confirmation cancels without losing the paper book, then clears both tracks", async ({ page }) => {
  const forbidden = observeForbiddenNetwork(page);
  await seedPaperTrade(page);
  await tab(page, "Profile").click();

  await page.getByTestId("profile-reset").click();
  const dialog = page.getByRole("alertdialog", { name: "Start a new Family session?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("$1,000 imaginary USD paper portfolio");
  await expect(dialog).toContainText("15 credits per choice and 60 per period");
  await expect(page.getByTestId("family-reset-cancel")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/try\/profile$/);

  // Back through client links only: cancel must retain the paper position.
  await openPaperFromStory(page);
  await expect(page.getByTestId("market-cash")).toContainText("$900.00");
  await expect(page.getByTestId("market-holdings")).toContainText("0.50 pretend shares");

  await tab(page, "Profile").click();
  await page.getByTestId("profile-reset").click();
  await page.getByTestId("family-reset-confirm").click();
  await expect(page).toHaveURL(/\/try$/);
  await page.getByTestId("welcome-start").click();
  await openPaperFromStory(page);
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
  await expect(page.getByTestId("market-current-quote")).toContainText("No price recorded");
  await expect(page.getByTestId("market-holdings")).toContainText("No pretend holdings yet");
  expect(forbidden, "Reset is offline and never calls a financial API").toEqual([]);
});

test("lab Reset whole demo also resets the hidden paper book only after explicit confirmation", async ({ page }) => {
  const forbidden = observeForbiddenNetwork(page);
  await seedPaperTrade(page);
  await tab(page, "Profile").click();
  await page.getByRole("link", { name: "Free practice lab" }).click();
  await expect(page).toHaveURL(/\/try\/lab$/);

  await page.getByRole("button", { name: "Reset whole demo" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Reset the whole Family demo?" });
  await expect(dialog).toContainText("$1,000 imaginary USD paper portfolio");
  await page.getByTestId("family-reset-cancel").click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/try\/lab$/);

  // Cancel leaves all hidden paper state intact across the shared /try layout.
  await page.getByRole("link", { name: /take the illustrated story/i }).first().click();
  await page.getByTestId("welcome-start").click();
  await openPaperFromStory(page);
  await expect(page.getByTestId("market-cash")).toContainText("$900.00");

  await tab(page, "Profile").click();
  await page.getByRole("link", { name: "Free practice lab" }).click();
  await page.getByRole("button", { name: "Reset whole demo" }).click();
  await page.getByTestId("family-reset-confirm").click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("link", { name: /take the illustrated story/i }).first().click();
  await page.getByTestId("welcome-start").click();
  await openPaperFromStory(page);
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
  await expect(page.getByTestId("market-holdings")).toContainText("No pretend holdings yet");
  expect(forbidden).toEqual([]);
});
