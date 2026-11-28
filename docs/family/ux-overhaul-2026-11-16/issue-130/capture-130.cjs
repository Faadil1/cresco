// node capture.cjs <baseUrl> <outdir> : comparable #130 captures for one build.
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const [base, out] = process.argv.slice(2);
const soft = async fn => { try { await fn(); } catch (e) { console.log("skip:", e.message.split("\n")[0].slice(0, 90)); } };
(async () => {
  const b = await chromium.launch();
  for (const [vp, w, h, m] of [["390", 390, 844, true], ["1440", 1440, 900, false]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m })).newPage();
    const ready = async path => { await p.goto(base + path, { waitUntil: "networkidle" }); await p.waitForFunction(() => document.documentElement.dataset.familyReady === "1").catch(() => p.waitForTimeout(800)); };
    const shot = async (name, full = true) => { await p.waitForTimeout(250); await p.screenshot({ path: `${out}/${vp}-${name}.png`, fullPage: full }); };
    const visible = async l => (await l.count()) > 0 && await l.first().isVisible();
    // Learn and the two lessons
    await ready("/try/learn"); await shot("learn");
    await ready("/try/learn/c-save"); await shot("lesson-save-start", false);
    await soft(async () => { await p.getByRole("button", { name: /put all 20/i }).click({ timeout: 2000 }); await shot("lesson-save-decided"); });
    await ready("/try/learn/c-risk"); await shot("lesson-risk-start", false);
    await soft(async () => { await p.getByRole("button", { name: /10 in orchard/i }).click({ timeout: 2000 }); await shot("lesson-risk-decided"); });
    // Real companies: first screen, then the full exercise
    await ready("/try/explore/real"); await shot("real-first-screen", false); await shot("real-step1-full");
    await soft(async () => {
      if (await visible(p.getByTestId("real-reason"))) await p.getByTestId("real-reason").getByRole("button").first().click();
      if (await visible(p.getByTestId("real-step-1-next"))) await p.getByTestId("real-step-1-next").click();
      await p.getByTestId("market-price-input").fill("200.00"); await p.getByTestId("market-quote-submit").click();
      if (await visible(p.getByTestId("step-toggle-3")) && await p.getByTestId("step-toggle-3").getAttribute("aria-expanded") === "false") await p.getByTestId("step-toggle-3").click();
      await p.getByTestId("market-quantity-input").fill("0.25"); await p.getByTestId("market-buy").click();
      if (await visible(p.getByTestId("step-toggle-2"))) await p.getByTestId("step-toggle-2").click();
      await p.getByTestId("market-price-input").fill("220.00"); await p.getByTestId("market-quote-submit").click();
      if (await visible(p.getByTestId("step-toggle-4")) && await p.getByTestId("step-toggle-4").getAttribute("aria-expanded") === "false") await p.getByTestId("step-toggle-4").click();
      await p.getByTestId("market-explain").getByRole("button", { name: /higher than/i }).click();
      await shot("real-explained");
    });
    // Parent approval states (in-app; one simulated browser)
    await ready("/try/explore/markets");
    await soft(async () => {
      await p.getByRole("button", { name: /compare food, wages/i }).click();
      await p.getByTestId("practice-this").click();
      await p.getByRole("button", { name: /a bigger choice/i }).click(); await p.getByTestId("make-choice").click();
      await shot("child-blocked", false);
      await p.getByTestId("to-parent").click(); await shot("parent-request", false);
      await p.getByTestId("approve-once").click(); await shot("parent-approved", false);
      await p.getByTestId("hand-back").click(); await p.getByTestId("use-approval").click(); await shot("child-used-approval", false);
      await p.locator('nav[aria-label="Main"]:visible').getByRole("link", { name: "Explore", exact: true }).click();
      await p.getByRole("link", { name: /make a practice choice/i }).click();
      await p.getByRole("button", { name: /pick another company/i }).click(); await p.getByRole("button", { name: "Choose ORC" }).click();
      await p.getByLabel("Practice credits", { exact: true }).fill("20"); await p.getByTestId("make-choice").click();
      await p.getByTestId("to-parent").click(); await p.getByTestId("decline-too-big").click();
      await p.getByTestId("hand-back").click(); await shot("child-declined", false);
      await p.getByRole("link", { name: /^Parent's view/ }).filter({ visible: true }).first().click();
      await shot("parent-timeline");
    });
  }
  await b.close();
})();
