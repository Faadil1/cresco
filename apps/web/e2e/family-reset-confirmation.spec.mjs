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

// UX-1: the safe action must be first visually as well as in keyboard order.
async function expectSafeResetActionFirst(page) {
  const cancel = page.getByTestId("family-reset-cancel");
  const confirm = page.getByTestId("family-reset-confirm");
  await expect(cancel).toBeVisible();
  await expect(confirm).toBeVisible();
  await expect(cancel).toBeFocused();
  await expect(confirm).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const cancelBackground = await cancel.evaluate(element => getComputedStyle(element).backgroundColor);
  expect(cancelBackground).not.toBe("rgba(0, 0, 0, 0)");
  const a = await cancel.boundingBox();
  const b = await confirm.boundingBox();
  expect(a).not.toBeNull();
  expect(b).not.toBeNull();
  const narrow = await page.evaluate(() => matchMedia("(min-width: 640px)").matches === false);
  if (narrow) {
    expect(a.y + a.height).toBeLessThanOrEqual(b.y + 1);
  } else {
    expect(a.x + a.width).toBeLessThanOrEqual(b.x + 1);
  }
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

async function finishSetupToHome(page) {
  // After a confirmed reset (or a never-completed setup), welcome-start enters
  // onboarding, which intentionally has no Main navigation.
  const chapter = page.getByRole("navigation", { name: "Previous and next chapter" });
  await expect(page).toHaveURL(/\/try\/goal$/);
  await page.getByRole("radio", { name: /new bike/i }).click();
  await chapter.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/try\/goal\/interests$/);
  await chapter.getByRole("link", { name: "Skip for now" }).click();
  await expect(page).toHaveURL(/\/try\/goal\/ready$/);
  await chapter.getByRole("link", { name: "Open my Home" }).click();
  await expect(page).toHaveURL(/\/try\/home$/);
}

async function openPaperFromStory(page) {
  await tab(page, "Portfolio").click();
  await page.getByTestId("portfolio-go-real").click();
}

test("new-family confirmation cancels without losing the paper book, then clears both tracks", async ({ page }, testInfo) => {
  const forbidden = observeForbiddenNetwork(page);
  await seedPaperTrade(page);
  await tab(page, "Profile").click();

  await page.getByTestId("profile-reset").click();
  const dialog = page.getByRole("alertdialog", { name: "Start a new Family session?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("$1,000 imaginary USD paper portfolio");
  await expect(dialog).toContainText("15 credits per choice and 60 per period");
  await expectSafeResetActionFirst(page);
  await page.screenshot({ path: testInfo.outputPath("profile-reset-dialog.png"), fullPage: true });
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
  await finishSetupToHome(page);
  await tab(page, "Profile").click();
  await expect(page.getByTestId("profile-screen").locator('a[href="/try/parent/key"]')).toContainText("Up to 15 credits a choice, 60 left");
  await openPaperFromStory(page);
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
  await expect(page.getByTestId("market-current-quote")).toContainText("No price recorded");
  await expect(page.getByTestId("market-holdings")).toContainText("No pretend holdings yet");
  expect(forbidden, "Reset is offline and never calls a financial API").toEqual([]);
});

test("lab Reset whole demo also resets the hidden paper book only after explicit confirmation", async ({ page }, testInfo) => {
  const forbidden = observeForbiddenNetwork(page);
  await seedPaperTrade(page);
  await tab(page, "Profile").click();
  await page.getByRole("link", { name: "Free practice lab" }).click();
  await expect(page).toHaveURL(/\/try\/lab$/);

  await page.getByRole("button", { name: "Reset whole demo" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Reset the whole Family demo?" });
  await expect(dialog).toContainText("$1,000 imaginary USD paper portfolio");
  await expectSafeResetActionFirst(page);
  await page.screenshot({ path: testInfo.outputPath("lab-reset-dialog.png"), fullPage: true });
  await page.getByTestId("family-reset-cancel").click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/try\/lab$/);

  // Cancel leaves all hidden paper state intact across the shared /try layout.
  await page.getByRole("link", { name: /take the illustrated story/i }).first().click();
  await page.getByTestId("welcome-start").click();
  await finishSetupToHome(page);
  await openPaperFromStory(page);
  await expect(page.getByTestId("market-cash")).toContainText("$900.00");

  await tab(page, "Profile").click();
  await page.getByRole("link", { name: "Free practice lab" }).click();
  await page.getByRole("button", { name: "Reset whole demo" }).click();
  await page.getByTestId("family-reset-confirm").click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("link", { name: /take the illustrated story/i }).first().click();
  await page.getByTestId("welcome-start").click();
  await finishSetupToHome(page);
  await openPaperFromStory(page);
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
  await expect(page.getByTestId("market-holdings")).toContainText("No pretend holdings yet");
  expect(forbidden).toEqual([]);
});
