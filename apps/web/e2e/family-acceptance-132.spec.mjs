import { test, expect } from "@playwright/test";
import { openRealStep, waitForFamilyReady } from "./family-ready.mjs";

waitForFamilyReady(test);

// Issue #132 P0 regression: the founder's out-of-order journey left Paper buy
// disabled with no visible way forward on desktop. Family Worker only.
// TEST DATA: 100.00 below is a synthetic input typed by the test, not a price
// for any company, and it is never shipped or shown outside this test run.
const TEST_PRICE = "100.00";

function watch(page) {
  const external = [];
  const writes = [];
  page.on("request", request => {
    const url = request.url();
    if (!url.startsWith("http://127.0.0.1:3100")) external.push(url);
    if (url.includes("/api/") || !["GET", "HEAD"].includes(request.method())) writes.push(`${request.method()} ${url}`);
  });
  return { external, writes };
}
const tab = (page, name) => page.locator('nav[aria-label="Main"]:visible').getByRole("link", { name, exact: true });

async function foundersOrderUpToBlockedBuy(page) {
  await page.goto("/try/explore/real");
  await expect(page.getByTestId("real-company-select-apple")).toHaveAttribute("aria-pressed", "true");
  // 1. Answers only the SEC profit question (not the company-choice reason).
  await page.getByTestId("real-mission-apple").locator("summary").click();
  await page.getByTestId("real-mission-apple").getByRole("button", { name: "No", exact: true }).click();
  await expect(page.getByTestId("real-mission-apple")).toContainText(/correct/i);
  await expect(page.getByTestId("real-reason-feedback")).toHaveCount(0);
  // 2. Missing, then invalid, then valid test price.
  await openRealStep(page, 2);
  await expect(page.getByTestId("market-quote-submit")).toBeDisabled();
  await page.getByTestId("market-price-input").fill("1OO");
  await expect(page.getByTestId("market-price-error")).toBeVisible();
  await page.getByTestId("market-price-input").fill(TEST_PRICE);
  await page.getByTestId("market-quote-submit").click();
  await expect(page.getByTestId("market-current-quote")).toContainText("$100.00");
  // 3. Attempts the trade: blocked, with the reason asked right there.
  await openRealStep(page, 3);
  await page.getByTestId("market-quantity-input").fill("0.25");
  await expect(page.getByTestId("market-trade-preview")).toContainText("$25.00");
  await expect(page.getByTestId("market-buy")).toBeDisabled();
  const need = page.getByTestId("market-need-reason");
  await expect(need).toBeVisible();
  await expect(need).toBeInViewport();
  await expect(need).toContainText(/one thing before you buy: why would you choose apple/i);
  // Nothing is auto-selected, nothing was traded.
  await expect(need.getByRole("button", { pressed: true })).toHaveCount(0);
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
}

async function finishAndVerify(page, net) {
  await expect(page.getByTestId("market-buy")).toBeEnabled();
  // Choosing a reason never trades by itself.
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
  // Price and quantity survived the detour.
  await expect(page.getByTestId("market-quantity-input")).toHaveValue("0.25");
  await expect(page.getByTestId("market-current-quote")).toContainText("$100.00");
  await page.getByTestId("market-buy").click();
  await expect(page.getByTestId("market-cash")).toContainText("$975.00");
  await expect(page.getByTestId("market-action-feedback")).toContainText(/no real order/i);
  // Per-company isolation: Microsoft still needs its own reason.
  await page.getByTestId("real-company-select-microsoft").click();
  await openRealStep(page, 3);
  await expect(page.getByTestId("market-need-reason")).toContainText(/why would you choose microsoft/i);
  await expect(page.getByTestId("market-buy")).toBeDisabled();
  // The pretend-credit book is independent.
  await tab(page, "Portfolio").click();
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  await page.getByTestId("portfolio-sections").getByRole("link", { name: "Paper dollars" }).click();
  await expect(page.getByTestId("paper-cash")).toContainText("$975.00");
  expect(net.writes).toEqual([]);
  expect(net.external, "no third-party request without chart opt-in").toEqual([]);
}

const viewports = [["1440x900", 1440, 900], ["1280x800", 1280, 800]];

for (const [label, width, height] of viewports) {
  test.describe(`P0 ${label}`, () => {
    test.use({ viewport: { width, height } });
    test(`P0 (${label}): inline recovery with the keyboard, then buy 0.25`, async ({ page }, testInfo) => {
      test.skip(/webkit|iphone/.test(testInfo.project.name), "phone project covers phones");
      const net = watch(page);
      await foundersOrderUpToBlockedBuy(page);
      await testInfo.attach(`p0-${label}-blocked.png`, { body: await page.screenshot(), contentType: "image/png" });
      const inline = page.getByTestId("market-need-reason").getByRole("button", { name: /keep paying for its products/i });
      await inline.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("market-reason-inline-feedback")).toHaveAttribute("data-strong", "true");
      // The same state shows in step 1.
      await expect(page.getByTestId("real-reason").getByRole("button", { pressed: true })).toHaveText(/keep paying for its products/i);
      await testInfo.attach(`p0-${label}-recovered.png`, { body: await page.screenshot(), contentType: "image/png" });
      await finishAndVerify(page, net);
    });
    test(`P0 (${label}): jump to step 1, choose, come back to the trade`, async ({ page }, testInfo) => {
      test.skip(/webkit|iphone/.test(testInfo.project.name), "phone project covers phones");
      const net = watch(page);
      await foundersOrderUpToBlockedBuy(page);
      await page.getByTestId("market-need-reason-jump").click();
      const field = page.getByTestId("real-reason");
      await expect(field).toBeInViewport();
      await expect(field.getByRole("button").first()).toBeFocused();
      await field.getByRole("button", { name: /official results show a lot of revenue/i }).click();
      await page.getByTestId("real-reason-back-to-trade").click();
      await expect(page.getByTestId("market-buy")).toBeInViewport();
      await expect(page.getByTestId("market-buy")).toBeFocused();
      await finishAndVerify(page, net);
    });
  });
}

test("P0 (phone, touch): jump to step 1, choose, come back to the trade, buy 0.25", async ({ page }, testInfo) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, "desktop sizes run above");
  const net = watch(page);
  await foundersOrderUpToBlockedBuy(page);
  await testInfo.attach("p0-phone-blocked.png", { body: await page.screenshot(), contentType: "image/png" });
  await page.getByTestId("market-need-reason-jump").tap().catch(() => page.getByTestId("market-need-reason-jump").click());
  await expect(page.getByTestId("step-toggle-1")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("real-reason")).toBeInViewport();
  await page.getByTestId("real-reason").getByRole("button", { name: /keep paying for its products/i }).click();
  await page.getByTestId("real-reason-back-to-trade").click();
  await expect(page.getByTestId("step-toggle-3")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("market-buy")).toBeInViewport();
  await finishAndVerify(page, net);
});
