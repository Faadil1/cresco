const { chromium } = require("/opt/node22/lib/node_modules/playwright");
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[390, 844], [375, 812]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true })).newPage();
    await p.goto("http://127.0.0.1:3100/try/explore/real", { waitUntil: "networkidle" });
    await p.waitForFunction(() => document.documentElement.dataset.familyReady === "1");
    const H = () => p.evaluate(() => document.documentElement.scrollHeight);
    const r = { initial: await H() };
    for (const n of [2, 3, 4]) { await p.getByTestId(`step-toggle-${n}`).click(); r[`step${n}`] = await H(); }
    // Worst case: every step body forced open at once (what a phone showed before the stepper).
    await p.addStyleTag({ content: '[id^="step-body-"]{display:block!important}' });
    r.allOpen = await H();
    console.log(w, JSON.stringify(r));
  }
  await b.close();
})();
