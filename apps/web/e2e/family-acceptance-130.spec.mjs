import { test, expect } from "@playwright/test";
import { chooseReason, openRealStep, waitForFamilyReady } from "./family-ready.mjs";

waitForFamilyReady(test);

// Issue #130 acceptance. Runs only against the local Family Worker (never the
// canonical Next app), on iPhone WebKit in CI and desktop Chromium.

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
const noHorizontalScroll = async page => expect(await page.evaluate(() =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);

async function priceAndTrade(page, { price, qty, kind = "buy" }) {
  await openRealStep(page, 2);
  await page.getByTestId("market-price-input").fill(price);
  await page.getByTestId("market-quote-submit").click();
  if (qty) {
    await openRealStep(page, 3);
    await page.getByTestId("market-quantity-input").fill(qty);
    await page.getByTestId(kind === "buy" ? "market-buy" : "market-sell").click();
    await expect(page.getByTestId("market-action-feedback")).toContainText(/no real order/i);
  }
}

test("P2: a child understands Apple and Shopify, sets dated prices, trades on paper and explains the change", async ({ page }, testInfo) => {
  const net = watch(page);
  await page.goto("/try/explore/real");

  // Apple: understand first, in plain words.
  await expect(page.getByTestId("real-in-one-sentence")).toContainText(/apple makes iphones/i);
  await page.getByTestId("term-revenue").click();
  await expect(page.getByTestId("term-revenue")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("note").filter({ hasText: /before it pays any costs/i })).toBeVisible();
  await expect(page.getByTestId("real-sec-apple")).toContainText(/fiscal period ending \d{4}-\d{2}-\d{2} · 10-K filed \d{4}-\d{2}-\d{2} · USD/);
  await expect(page.getByTestId("real-profit-per-100-apple")).toContainText(/about \$28 was left as profit/);

  // No paper buy before saying why; a weak reason is answered kindly but still teaches.
  await openRealStep(page, 3);
  await expect(page.getByTestId("market-buy")).toBeDisabled();
  await expect(page.getByTestId("market-need-reason")).toBeVisible();
  await chooseReason(page, /logo or ads/i);
  await expect(page.getByTestId("real-reason-feedback")).toHaveAttribute("data-strong", "false");
  await chooseReason(page, /keep paying for its products/i);
  await expect(page.getByTestId("real-reason-feedback")).toHaveAttribute("data-strong", "true");
  await testInfo.attach("p2-apple-understand.png", { body: await page.screenshot(), contentType: "image/png" });

  // Missing and invalid prices are explained and block the trade.
  await openRealStep(page, 2);
  await expect(page.getByTestId("market-current-quote")).toContainText(/no price recorded/i);
  await page.getByTestId("market-price-input").fill("about two hundred");
  await expect(page.getByTestId("market-price-error")).toBeVisible();
  await expect(page.getByTestId("market-quote-submit")).toBeDisabled();
  await openRealStep(page, 3);
  await expect(page.getByTestId("market-buy")).toBeDisabled();

  // A valid, dated, unverified price; a fractional paper buy.
  await priceAndTrade(page, { price: "200.00", qty: "0.25" });
  await expect(page.getByTestId("market-current-quote")).toContainText(/User-entered AAPL: \$200\.00 · \d{4}-\d{2}-\d{2} · TradingView \(NOT VERIFIED\)/);
  await expect(page.getByTestId("market-cash")).toContainText("$950.00");
  await expect(page.getByTestId("market-explain-wait")).toBeVisible();

  // Later price: value and P&L change; explain the direction (wrong, then right).
  await priceAndTrade(page, { price: "220.00" });
  await expect(page.getByTestId("market-equity")).toContainText("$1,005.00");
  await expect(page.getByTestId("market-unrealized")).toContainText("$5.00");
  await openRealStep(page, 4);
  await expect(page.getByTestId("market-explain")).toContainText(/AAPL is up \$5\.00/);
  await page.getByTestId("market-explain").getByRole("button", { name: /sales must have grown/i }).click();
  await expect(page.getByTestId("market-explain-feedback")).toContainText(/not necessarily/i);
  await page.getByTestId("market-explain").getByRole("button", { name: /higher than the price you paid/i }).click();
  await expect(page.getByTestId("market-explain-feedback")).toContainText(/paper gain/i);
  await testInfo.attach("p2-apple-explain.png", { body: await page.screenshot(), contentType: "image/png" });

  // Shopify: its own reason, price, buy and a loss.
  await page.getByTestId("real-company-select-shopify").click();
  await expect(page.getByTestId("real-in-one-sentence")).toContainText(/shopify makes the software/i);
  await expect(page.getByTestId("real-sec-shopify")).toContainText(/fiscal period ending/);
  await chooseReason(page, /many shops depend on it/i);
  await priceAndTrade(page, { price: "100.00", qty: "0.50" });
  await priceAndTrade(page, { price: "90.00" });
  await openRealStep(page, 4);
  await expect(page.getByTestId("market-explain")).toContainText(/SHOP is down \$5\.00/);
  await page.getByTestId("market-explain").getByRole("button", { name: /lower than the price you paid/i }).click();
  await expect(page.getByTestId("market-explain-feedback")).toContainText(/paper loss/i);
  await expect(page.getByTestId("market-cash")).toContainText("$900.00");
  await expect(page.getByTestId("market-equity")).toContainText("$1,000.00");

  // The pretend-credit book is untouched; the paper book shows both positions.
  await tab(page, "Portfolio").click();
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  await page.getByTestId("portfolio-sections").getByRole("link", { name: "Paper dollars" }).click();
  await expect(page.getByTestId("paper-holdings")).toContainText("Apple");
  await expect(page.getByTestId("paper-holdings")).toContainText("Shopify");
  await expect(page.getByTestId("paper-cash")).toContainText("$900.00");

  // Reset the paper book only.
  await page.getByTestId("paper-go-real").click();
  await openRealStep(page, 4);
  await page.getByTestId("market-reset").click();
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
  await tab(page, "Portfolio").click();
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  await noHorizontalScroll(page);

  expect(net.writes, "no API or write requests").toEqual([]);
  expect(net.external, "no third-party request without the chart opt-in").toEqual([]);
});
