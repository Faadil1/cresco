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

// ---------------------------------------------------------------------------
// P3: the simulated Child -> Parent -> Child cycle, asserting real state at
// every step. Single-browser simulation only: no identity, consent, cookies,
// storage or sync. Everything stays in-app (a hard reload resets the demo).
// ---------------------------------------------------------------------------
async function toParent(page) {
  await page.getByRole("link", { name: /^Parent's view/ }).filter({ visible: true }).first().click();
  await expect(page.getByRole("navigation", { name: "Parent" })).toBeVisible();
}
async function toChild(page) {
  await page.getByTestId("switch-to-child").click();
  await expect(page).toHaveURL(/\/try\/home$/);
}
const parentTab = (page, name) => page.getByRole("navigation", { name: "Parent" }).getByRole("link", { name }).click();
async function choose(page, amount, reason) {
  await page.getByLabel("Practice credits", { exact: true }).fill(String(amount));
  if (reason) await page.getByLabel(reason).check();
}
async function toDecision(page) {
  // Always in-app: Explore -> "Make a practice choice" (a hard load would reset the demo).
  await page.locator('nav[aria-label="Main"]:visible').getByRole("link", { name: "Explore", exact: true }).click();
  await page.getByRole("link", { name: /make a practice choice/i }).click();
  await expect(page).toHaveURL(/\/try\/decision$/);
}
async function pickCompany(page, code) {
  const another = page.getByRole("button", { name: /pick another company/i });
  if (await another.isVisible()) await another.click();
  await page.getByRole("button", { name: `Choose ${code}` }).click();
}

async function childParentCycle(page, testInfo, label) {
  const net = watch(page);
  const shot = async name => testInfo.attach(`${label}-${name}.png`, { body: await page.screenshot(), contentType: "image/png" });
  await page.goto("/try/explore/markets");
  await page.getByRole("button", { name: /compare food, wages and delivery costs/i }).click();
  await page.getByTestId("practice-this").click();

  // 1. Inside the Key (15 per choice): done alone, one receipt, no request.
  await choose(page, 10);
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "inside-key");
  await page.getByTestId("make-choice").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/done inside my key, on your own/i);
  await expect(page.getByTestId("receipt-line")).toContainText(/10 credits · neighborhood markets/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("10");
  await expect(page.getByTestId("outcome-available")).toHaveText("90");
  await toParent(page);
  await expect(page.getByTestId("parent-no-pending")).toBeVisible();
  await expect(page.getByTestId("parent-activity")).toContainText(/practice choice: 10 credits of neighborhood markets\s*on their own, inside the key/i);
  await toChild(page);

  // 2. Over the Key: blocked; nothing bought; an exact request carrying the Child's reason.
  await toDecision(page);
  await pickCompany(page, "MKT");
  await choose(page, 25, /i am curious how it behaves/i);
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "needs-parent");
  await page.getByTestId("make-choice").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/blocked by my key/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("10");
  // The same ask cannot be sent twice.
  await toDecision(page);
  await choose(page, 25);
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "pending");
  await expect(page.getByTestId("make-choice")).toBeDisabled();
  await shot("child-pending");

  // 3. Parent sees amount, company and reason, and approves ONCE (keyboard). The Key does not widen.
  await toParent(page);
  await expect(page.getByTestId("parent-pending")).toContainText(/1 request waiting/i);
  await page.getByTestId("open-request").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("25 credits · Neighborhood Markets");
  await expect(page.getByTestId("request-detail")).toContainText("Practice MKT for 25 credits");
  await expect(page.getByTestId("child-reason")).toHaveText(/i am curious how it behaves/i);
  await expect(page.getByText(/no guardian identity or consent is verified/i)).toBeVisible();
  await expect(page.getByTestId("approve-once")).toBeInViewport();
  await shot("parent-request");
  await page.getByTestId("approve-once").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("parent-result")).toContainText(/approved once\. the key did not widen/i);
  await parentTab(page, "My Key");
  await expect(page.getByTestId("parent-key-now")).toContainText(/alone, per choice\s*15 credits/i);

  // 4. Child uses the approval exactly once; it cannot be replayed.
  await toChild(page);
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "use-approval");
  await page.getByTestId("home-mission-go").click();
  await page.getByTestId("use-approval").click();
  await expect(page.getByTestId("receipt-line")).toContainText(/25 credits/);
  await expect(page.getByTestId("receipt-line")).toContainText(/cannot be replayed/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("35");
  await toDecision(page);
  await choose(page, 25);
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "used");
  await expect(page.getByTestId("make-choice")).toBeDisabled();
  await shot("child-approval-used");

  // 5. Decline with a reason: nothing bought, the Child learns why and adapts.
  await pickCompany(page, "ORC");
  await choose(page, 20, /it fits what i am saving for/i);
  await page.getByTestId("make-choice").click();
  await page.getByTestId("to-parent").click();
  await page.getByTestId("decline-too-big").click();
  await expect(page.getByTestId("parent-result")).toContainText(/declined\. nothing was bought/i);
  await page.getByTestId("hand-back").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/your parent declined\. nothing was bought/i);
  await expect(page.getByTestId("outcome-hero")).toContainText(/big for one choice/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("35");
  await shot("child-declined");
  await page.getByTestId("try-smaller").click();
  await choose(page, 20);
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "declined");
  await expect(page.getByTestId("make-choice")).toBeDisabled();
  await choose(page, 10);
  await page.getByTestId("make-choice").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/on your own/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("45");

  // 6. A Key change makes an open request stale; it cannot be approved and authorizes nothing.
  await toDecision(page);
  await pickCompany(page, "BKT");
  await choose(page, 30);
  await page.getByTestId("make-choice").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/blocked by my key/i);
  await toParent(page);
  await parentTab(page, "My Key");
  await page.getByLabel("Max credits per action").fill("20");
  await expect(page.getByTestId("key-change-warning")).toContainText(/expire 1 open request/i);
  await page.getByRole("button", { name: /explicitly update standing key/i }).click();
  await expect(page.getByTestId("key-result")).toContainText(/previous requests became stale/i);
  await parentTab(page, "Requests");
  await expect(page.getByTestId("parent-result")).toContainText(/this request expired/i);
  await expect(page.getByTestId("approve-once")).toHaveCount(0);
  await parentTab(page, "Overview");
  await expect(page.getByTestId("parent-no-pending")).toBeVisible();
  const activity = page.getByTestId("parent-activity");
  await expect(activity).toContainText(/asked for 30 credits of balanced basket fund: expired when the key changed/i);
  await expect(activity).toContainText(/asked for 20 credits of orchard technology: you declined/i);
  await expect(activity).toContainText(/asked for 25 credits of neighborhood markets: your one-time yes was used/i);
  await expect(activity).toContainText(/reason given: "i am curious how it behaves"/i);
  await expect(activity.getByText(/^asked for/i)).toHaveCount(3);
  await expect(activity.getByText(/^practice choice:/i)).toHaveCount(3);
  await shot("parent-timeline");
  await toChild(page);
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "see-expired");
  await page.getByTestId("home-mission-go").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/that ask expired/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("45");
  await toDecision(page);
  await choose(page, 30);
  // Under the new Key (20 per choice) the same 30 is asked again, never silently allowed.
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "needs-parent");

  // 7. A full reload resets the simulation; nothing was stored or sent anywhere.
  expect(await page.context().cookies()).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await page.goto("/try/portfolio");
  await expect(page.getByTestId("portfolio-spent")).toHaveText("0");
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  await noHorizontalScroll(page);
  expect(net.writes, "no API or write requests").toEqual([]);
  expect(net.external, "no third-party requests").toEqual([]);
}

test("P3 (phone): within the Key, approve once, decline and stale requests behave exactly", async ({ page }, testInfo) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, "desktop sizes run below");
  await childParentCycle(page, testInfo, "phone");
});

for (const [width, height] of [[1440, 900], [1280, 800]]) {
  test.describe(`P3 desktop ${width}x${height}`, () => {
    test.use({ viewport: { width, height } });
    test(`P3 (${width}x${height}): within the Key, approve once, decline and stale requests behave exactly`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name.includes("webkit") || testInfo.project.name.includes("iphone"), "phone project covers the phone layout");
      await childParentCycle(page, testInfo, `${width}`);
    });
  });
}
