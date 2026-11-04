import { test, expect } from "@playwright/test";

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

  await page.goto("/try/portfolio/companies");
  for (const id of ["shopify", "microsoft", "costco", "apple"]) {
    await expect(page.getByTestId("real-company-" + id)).toBeVisible();
    await expect(page.getByTestId("real-sec-" + id)).toBeVisible();
    await expect(page.getByTestId("real-revenue-" + id)).toContainText("$");
    await expect(page.getByTestId("real-sec-" + id).getByRole("link", {name:"Read official SEC filings"})).toHaveAttribute("href", /sec\.gov/);
    await expect(page.getByTestId("real-chart-consent-" + id)).toBeVisible();
  }
  expect(external, "No third-party requests before user action").toEqual([]);
  expect(forbidden, "No API/wallet/write calls").toEqual([]);

  await page.getByTestId("real-mission-apple").locator("summary").click();
  await page.getByTestId("real-mission-apple").getByRole("button",{name:"No",exact:true}).click();
  await expect(page.getByTestId("real-mission-apple")).toContainText("does not change your practice credits");
  expect(external, "The lesson remains local").toEqual([]);

  await page.getByTestId("real-chart-consent-apple").click();
  await expect(page.getByTestId("real-chart-widget-apple")).toBeVisible();
  await expect.poll(() => external.filter(url => url.startsWith("https://s3.tradingview.com/")).length)
    .toBeGreaterThan(0);
  expect(forbidden).toEqual([]);
  await page.getByRole("button",{name:"Hide third-party chart"}).click();
  await expect(page.getByTestId("real-chart-consent-apple")).toBeVisible();
});
