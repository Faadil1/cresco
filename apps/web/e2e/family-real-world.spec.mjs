import { test, expect } from "@playwright/test";
import { openRealStep, waitForFamilyReady } from "./family-ready.mjs";

waitForFamilyReady(test);

test("Real-world research stays offline until a chart is explicitly requested", async ({page}) => {
  const external = [];
  const forbidden = [];
  page.on("request", request => {
    const url = request.url();
    if (!url.startsWith("http://127.0.0.1:3100")) external.push(url);
    if (url.includes("/api/") || !["GET", "HEAD"].includes(request.method())) forbidden.push(url);
  });

  // Intercept the public widget script only after opt-in. No quote is invented.
  await page.route("https://s3.tradingview.com/**", route =>
    route.fulfill({status:200, contentType:"application/javascript", body:"/* network isolation test */"}));

  // Real companies are one switch away from the story companies, under Explore.
  await page.goto("/try/explore");
  await page.getByTestId("explore-sections").getByRole("link", { name: "Real companies" }).click();
  await expect(page).toHaveURL(/\/try\/explore\/real$/);
  await expect(page.getByTestId("reality-real")).toBeVisible();
  // Business first: step 1 (official facts) comes before the price and the trade.
  const step1 = await page.getByRole("heading", { name: /step 1: understand apple/i }).boundingBox();
  const step3 = await page.getByRole("heading", { name: /step 3: try a paper trade/i }).boundingBox();
  expect(step1.y).toBeLessThan(step3.y);
  for (const id of ["shopify", "microsoft", "costco", "apple"]) {
    await expect(page.getByTestId("real-company-" + id)).toBeVisible();
    await page.getByTestId("real-company-select-" + id).click();
    await openRealStep(page, 1);
    await expect(page.getByTestId("real-sec-" + id)).toBeVisible();
    await expect(page.getByTestId("real-revenue-" + id)).toContainText("$");
    await openRealStep(page, 1);
    await expect(page.getByTestId("real-sec-" + id).getByRole("link", {name:"Read official SEC filings"})).toHaveAttribute("href", /sec\.gov/);
    await openRealStep(page, 2);
    await expect(page.getByTestId("real-chart-consent-" + id)).toBeVisible();
  }
  expect(external, "No third-party requests before user action").toEqual([]);
  expect(forbidden, "No API/wallet/write calls").toEqual([]);

  await openRealStep(page, 1);
  await page.getByTestId("real-mission-apple").locator("summary").click();
  await page.getByTestId("real-mission-apple").getByRole("button",{name:"No",exact:true}).click();
  await expect(page.getByTestId("real-mission-apple")).toContainText("does not change your practice credits");
  expect(external, "The lesson remains local").toEqual([]);

  await openRealStep(page, 2);
  await page.getByTestId("real-chart-consent-apple").click();
  await expect(page.getByTestId("real-chart-widget-apple")).toBeVisible();
  await expect.poll(() => external.filter(url => url.startsWith("https://s3.tradingview.com/")).length)
    .toBeGreaterThan(0);
  expect(forbidden).toEqual([]);
  await page.getByRole("button",{name:"Hide third-party chart"}).click();
  await openRealStep(page, 2);
  await expect(page.getByTestId("real-chart-consent-apple")).toBeVisible();
});


test("A dated user-entered price powers a separate offline paper portfolio with P&L", async ({page}) => {
  const forbidden = [];
  page.on("request", request => {
    const url = request.url();
    if (!url.startsWith("http://127.0.0.1:3100")) forbidden.push(url);
    if (url.includes("/api/") || !["GET", "HEAD"].includes(request.method())) forbidden.push(url);
  });
  await page.goto("/try/portfolio/companies");
  await expect(page.getByTestId("market-equity")).toContainText("$1,000.00");
  await expect(page.getByTestId("market-buy")).toBeDisabled();
  await expect(page.getByTestId("market-current-quote")).toContainText("No price recorded");

  await openRealStep(page, 2);
  await page.getByTestId("market-price-input").fill("200.00");
  await page.getByTestId("market-quote-submit").click();
  await expect(page.getByTestId("market-current-quote")).toContainText(/user-entered/i);
  await expect(page.getByTestId("market-current-quote")).toContainText("$200.00");
  await openRealStep(page, 3);
  await page.getByTestId("market-quantity-input").fill("0.50");
  await expect(page.getByTestId("market-trade-preview")).toContainText("$100.00");
  await page.getByTestId("market-buy").click();
  await expect(page.getByTestId("market-cash")).toContainText("$900.00");
  await expect(page.getByTestId("market-equity")).toContainText("$1,000.00");
  await expect(page.getByTestId("market-holdings")).toContainText("0.50 paper shares");
  await expect(page.getByTestId("market-action-feedback")).toContainText("no real order");

  // Change only the manual reference price. Cash and positions do not trade.
  await openRealStep(page, 2);
  await page.getByTestId("market-price-input").fill("180.00");
  await page.getByTestId("market-quote-submit").click();
  await expect(page.getByTestId("market-cash")).toContainText("$900.00");
  await expect(page.getByTestId("market-equity")).toContainText("$990.00");
  await expect(page.getByTestId("market-unrealized")).toContainText("-$10.00");
  await openRealStep(page, 3);
  await page.getByTestId("market-quantity-input").fill("0.25");
  await page.getByTestId("market-sell").click();
  await expect(page.getByTestId("market-cash")).toContainText("$945.00");

  // Step 4: the child explains the paper loss; nothing is invented or changed.
  await expect(page.getByTestId("market-explain")).toContainText(/down \$5\.00/);
  await openRealStep(page, 4);
  await page.getByTestId("market-explain").getByRole("button", { name: /lost money as a business/i }).click();
  await expect(page.getByTestId("market-explain-feedback")).toContainText(/not necessarily/i);
  await openRealStep(page, 4);
  await page.getByTestId("market-explain").getByRole("button", { name: /lower than the price you paid/i }).click();
  await expect(page.getByTestId("market-explain-feedback")).toContainText(/paper loss/i);
  await expect(page.getByTestId("market-cash")).toContainText("$945.00");

  // Portfolio keeps the two books apart behind one switch, never summed.
  await page.locator('nav[aria-label="Main"]:visible').getByRole("link", { name: "Portfolio", exact: true }).click();
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  await page.getByTestId("portfolio-sections").getByRole("link", {name:"Paper dollars"}).click();
  await expect(page).toHaveURL(/\/try\/portfolio\/paper$/);
  await expect(page.getByTestId("paper-cash")).toContainText("$945.00");
  await expect(page.getByTestId("paper-holdings")).toContainText("0.25 paper shares");
  await page.getByTestId("paper-go-real").click();
  await expect(page.getByTestId("market-cash")).toContainText("$945.00");

  await openRealStep(page, 4);
  await page.getByTestId("market-reset").click();
  await expect(page.getByTestId("market-cash")).toContainText("$1,000.00");
  await expect(page.getByTestId("market-holdings")).toContainText("No paper positions yet");
  expect(forbidden, "Paper trading must not contact markets, wallets or any server API").toEqual([]);
});

test("paper trading blocks impossible quote, overspending and selling shares not owned", async ({page}) => {
  await page.goto("/try/portfolio/companies");
  await openRealStep(page, 2);
  await page.getByTestId("market-price-input").fill("-1");
  await expect(page.getByTestId("market-quote-submit")).toBeDisabled();
  await openRealStep(page, 2);
  await page.getByTestId("market-price-input").fill("9999.00");
  await page.getByTestId("market-quote-submit").click();
  await openRealStep(page, 3);
  await page.getByTestId("market-quantity-input").fill("1");
  await expect(page.getByTestId("market-buy")).toBeDisabled();
  await expect(page.getByTestId("market-sell")).toBeDisabled();
  await expect(page.getByTestId("market-trade-preview")).toContainText("Not enough imaginary USD");
});


test("compact market desk places chart beside trade on desktop and above it on mobile", async ({page}, testInfo) => {
  await page.goto("/try/portfolio/companies");
  const chart = page.getByTestId("market-chart-column");
  const trade = page.getByTestId("market-order-column");
  await expect(chart).toBeVisible();
  await expect(trade).toBeVisible();
  const chartBox=await chart.boundingBox();
  const tradeBox=await trade.boundingBox();
  expect(chartBox).not.toBeNull();
  expect(tradeBox).not.toBeNull();
  const wide=(page.viewportSize()?.width??0)>=1200;
  if(wide) {
    expect(tradeBox.x).toBeGreaterThan(chartBox.x + chartBox.width-10);
    expect(Math.abs(tradeBox.y-chartBox.y)).toBeLessThan(12);
  } else {
    expect(tradeBox.y).toBeGreaterThan(chartBox.y + chartBox.height-10);
  }
  await expect(page.getByTestId("market-approved-quote")).toHaveCount(0);
  await openRealStep(page, 2);
  await expect(page.getByTestId("real-chart-consent-apple")).toBeVisible();
  await openRealStep(page, 1);
  await expect(page.getByTestId("real-sec-apple")).toBeVisible();
  await testInfo.attach("compact-market-desk.png",{body:await page.screenshot(),contentType:"image/png"});
});
