import { test, expect } from "@playwright/test";
import { chooseReason, openRealStep, waitForFamilyReady } from "./family-ready.mjs";

waitForFamilyReady(test);

// Acceptance checks for the 2026-11-16 Family redesign (issue #126, audit
// docs/family/FAMILY_PRODUCT_REVIEW_CLAUDE_20261116.md section 4). Runs against
// the locally built public Family artifact; no API, wallet or deploy.

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

test("A1: the public landing and the classic lab render (they returned HTTP 500 at the baseline)", async ({ page, request }) => {
  for (const path of ["/", "/try/lab", "/try/explore/real", "/try/portfolio/paper", "/try/portfolio/companies"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /your child takes the lead/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /try cresco - no sign-in/i })).toBeInViewport();
  await page.goto("/try/lab");
  await expect(page.getByTestId("family-public-studio")).toBeVisible();
  await expect(page.getByRole("link", { name: /back to the cresco family app/i })).toBeVisible();
});

test("A2: Home shows the next step, the learning loop and the wallet, and the loop fills in as real things happen", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try/home");
  await expect(page.getByTestId("home-mission-go")).toBeInViewport();
  await expect(page.getByTestId("journey-track")).toBeInViewport();
  await expect(page.getByTestId("journey-track")).toHaveAttribute("data-done", "0");
  await expect(page.getByTestId("journey-track").locator('[aria-current="step"]')).toHaveAttribute("data-step", "goal");
  await expect(page.getByTestId("home-key")).toContainText("15 credits");
  await noHorizontalScroll(page);

  // Choose a goal through the real onboarding; the loop marks Goal done and moves on.
  await page.getByTestId("home-mission-go").click();
  await page.getByRole("radio", { name: /new bike/i }).click();
  await page.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name: "Next" }).click();
  await page.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name: "Skip for now" }).click();
  await page.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name: "Open my Home" }).click();
  await expect(page.getByTestId("journey-track")).toHaveAttribute("data-done", "1");
  await expect(page.getByTestId("journey-track").locator('[data-step="goal"]')).toHaveAttribute("data-done", "true");
  await expect(page.getByTestId("journey-track").locator('[aria-current="step"]')).toHaveAttribute("data-step", "learn");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/saving for a new bike/i);

  // Wallet: setting aside moves credits from free to saved, visibly.
  await page.getByTestId("home-save").click();
  await expect(page.getByTestId("home-goal-saved")).toHaveText("20/60");
  await expect(page.getByTestId("home-credit-bar")).toHaveAttribute("aria-label", /20 saved.*80 free/);
  expect(net.writes).toEqual([]);
  expect(net.external).toEqual([]);
});

test("A5/A6: every main page carries exactly one reality tag, and the two worlds never share a page", async ({ page }) => {
  const expectations = [
    ["/try/home", "pretend"], ["/try/explore", "pretend"], ["/try/explore/markets", "pretend"],
    ["/try/portfolio", "pretend"], ["/try/explore/real", "real"], ["/try/portfolio/paper", "real"],
  ];
  for (const [path, kind] of expectations) {
    await page.goto(path);
    await expect(page.locator("[data-reality]"), path).toHaveCount(1);
    await expect(page.locator("[data-reality]"), path).toHaveAttribute("data-reality", kind);
  }
  // The old disclaimer paragraph and the link to the lab are gone from the shared footer.
  await page.goto("/try/home");
  await expect(page.getByTestId("family-footer")).not.toContainText(/legacy|experiment/i);
  await expect(page.getByTestId("family-footer").getByRole("link", { name: "How Cresco works" })).toHaveAttribute("href", "/try/profile#how-it-works");
});

test("A3/A7: real-company journey: business, source and date, opt-in chart, paper trade, explain the result", async ({ page }) => {
  const net = watch(page);
  await page.route("https://s3.tradingview.com/**", route =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "/* isolated */" }));
  await page.goto("/try/explore/real");
  await page.getByTestId("real-company-select-costco").click();
  await expect(page.getByTestId("real-company-select-costco")).toHaveAttribute("aria-pressed", "true");
  await chooseReason(page);
  await expect(page.getByRole("heading", { name: /step 1: understand costco/i })).toBeVisible();
  // Official figures keep their period, form, filing date and currency.
  await openRealStep(page, 1);
  await expect(page.getByTestId("real-sec-costco")).toContainText(/fiscal period ending \d{4}-\d{2}-\d{2} · 10-K filed \d{4}-\d{2}-\d{2} · USD/);
  // Investor-relations links are no longer the first thing on the page; they sit inside step 1.
  await expect(page.getByRole("link", { name: /investor relations/i })).toBeHidden();
  await page.getByTestId("real-risks").locator("summary").click();
  await expect(page.getByRole("link", { name: /costco investor relations \(opens outside cresco\)/i })).toBeVisible();
  expect(net.external, "nothing third-party before the chart is requested").toEqual([]);

  await openRealStep(page, 2);
  await page.getByTestId("real-chart-consent-costco").click();
  await expect(page.getByTestId("real-chart-widget-costco")).toBeVisible();
  await openRealStep(page, 2);
  await page.getByTestId("market-price-input").fill("100.00");
  await page.getByTestId("market-quote-submit").click();
  await openRealStep(page, 3);
  await page.getByTestId("market-quantity-input").fill("1");
  await page.getByTestId("market-buy").click();
  await expect(page.getByTestId("market-action-feedback")).toContainText(/no real order/i);
  await expect(page.getByTestId("market-explain-wait")).toBeVisible();

  await openRealStep(page, 2);
  await page.getByTestId("market-price-input").fill("110.00");
  await page.getByTestId("market-quote-submit").click();
  await expect(page.getByTestId("market-explain")).toContainText(/up \$10\.00/);
  await openRealStep(page, 4);
  await page.getByTestId("market-explain").getByRole("button", { name: /higher than the price you paid/i }).click();
  await expect(page.getByTestId("market-explain-feedback")).toContainText(/paper gain/i);

  // Separate books: pretend credits untouched.
  await tab(page, "Portfolio").click();
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  await noHorizontalScroll(page);
  expect(net.writes).toEqual([]);
  expect(net.external.every(url => url.startsWith("https://s3.tradingview.com/"))).toBe(true);
});

test("A8: Parent journey: what needs you first, the same loop, a dated activity list, and a request decided once", async ({ page }) => {
  // A hard load resets the in-memory story, so the whole journey stays in-app.
  await page.goto("/try/explore/markets");
  // Meet needs a meaningful interaction, not just opening the page.
  await page.locator('nav[aria-label="Main"]:visible').getByRole("link", { name: "Home", exact: true }).click();
  await expect(page.getByTestId("journey-track").locator('[data-step="explore"]')).toHaveAttribute("data-done", "false");
  await page.goBack();
  await expect(page).toHaveURL(/\/try\/explore\/markets$/);
  await page.getByRole("button", { name: /compare food, wages and delivery costs with sales/i }).click();
  await page.getByTestId("practice-this").click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await page.getByLabel(/it fits what i am saving for/i).check();
  await page.getByTestId("make-choice").click();
  await page.getByTestId("to-parent").click();
  await page.getByRole("navigation", { name: "Parent" }).getByRole("link", { name: "Overview" }).click();

  const grid = page.getByTestId("parent-overview-grid");
  await expect(grid.locator(":scope > *").first()).toContainText(/1 request waiting for you/i);
  await expect(page.getByTestId("parent-journey")).toBeVisible();
  await expect(page.getByTestId("parent-journey").locator('[data-step="explore"]')).toHaveAttribute("data-done", "true");
  await expect(page.getByTestId("parent-activity")).toContainText(/asked for 25 credits of neighborhood markets: waiting for you/i);
  await expect(page.getByTestId("parent-activity")).toContainText(/fits what i am saving for/i);
  await page.getByTestId("open-request").click();
  await expect(page.getByTestId("request-detail")).not.toContainText(/nonce/i);
  await page.getByTestId("approve-once").click();
  await page.getByRole("navigation", { name: "Parent" }).getByRole("link", { name: "Overview" }).click();
  await expect(page.getByTestId("parent-activity")).toContainText(/you said yes once/i);
  await expect(page.getByTestId("parent-no-pending")).toBeVisible();
});

test("A10: keyboard users reach the main action and the switches, with visible state", async ({ page }) => {
  await page.goto("/try/explore");
  const realSwitch = page.getByTestId("explore-sections").getByRole("link", { name: "Real companies" });
  await expect(page.getByTestId("explore-sections").getByRole("link", { name: "Story companies" })).toHaveAttribute("aria-current", "page");
  await realSwitch.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/try\/explore\/real$/);
  await page.getByTestId("real-company-select-shopify").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("real-company-select-shopify")).toHaveAttribute("aria-pressed", "true");
  // Tab order reaches the price field without a pointer.
  await openRealStep(page, 2);
  await page.getByTestId("market-price-input").focus();
  await page.keyboard.type("50.00");
  await page.keyboard.press("Tab");
  await openRealStep(page, 2);
  await expect(page.getByTestId("market-quote-date")).toBeFocused();
});

test("A3 (phones): the real-company lab guides one step at a time and moves forward on its own", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, "lg+ shows all four steps at once");
  await page.goto("/try/explore/real");
  const open = n => expect(page.getByTestId(`step-toggle-${n}`)).toHaveAttribute("aria-expanded", "true");
  const closed = n => expect(page.getByTestId(`step-toggle-${n}`)).toHaveAttribute("aria-expanded", "false");
  await open(1); await closed(2); await closed(3); await closed(4);
  await expect(page.getByTestId("step-toggle-2")).toContainText(/type the latest price/i);
  await expect(page.getByTestId("market-price-input")).toBeHidden();
  // Step 1 asks why first, then hands over to step 2.
  await expect(page.getByTestId("real-step-1-next")).toBeDisabled();
  await chooseReason(page);
  await page.getByTestId("real-step-1-next").click();
  await open(2); await closed(1);
  await expect(page.getByTestId("real-chart-consent-apple")).toBeVisible();
  await page.getByTestId("market-price-input").fill("200.00");
  await page.getByTestId("market-quote-submit").click();
  // Saving a price opens the trade; the summary of step 2 remembers the price.
  await open(3);
  await expect(page.getByTestId("step-toggle-2")).toContainText("$200.00");
  await page.getByTestId("market-quantity-input").fill("1");
  await page.getByTestId("market-buy").click();
  // Trading opens "Explain the result", and the no-real-order feedback stays visible.
  await open(4);
  await expect(page.getByTestId("market-action-feedback")).toBeVisible();
  await expect(page.getByTestId("market-action-feedback")).toContainText(/no real order/i);
  await expect(page.getByTestId("market-explain-wait")).toBeVisible();
  // Switching company restarts at step 1; the paper position is marked on the picker.
  await page.getByTestId("real-company-select-costco").click();
  await open(1);
  await expect(page.getByTestId("real-company-select-apple")).toHaveAttribute("aria-label", /you hold paper shares/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
});
