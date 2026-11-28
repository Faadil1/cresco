// node capture.cjs <baseUrl> <outdir>  (#132 visual before/after)
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const [base, out] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const metrics = [];
  for (const [vp, w, h, m] of [["1440", 1440, 900, false], ["1280", 1280, 800, false], ["390", 390, 844, true], ["375", 375, 812, true]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m })).newPage();
    const ready = async path => { await p.goto(base + path, { waitUntil: "networkidle" }); await p.waitForFunction(() => document.documentElement.dataset.familyReady === "1").catch(() => p.waitForTimeout(800)); await p.waitForTimeout(300); };
    const shot = async name => {
      const height = await p.evaluate(() => document.documentElement.scrollHeight);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      metrics.push({ vp, name, height, overflow });
      await p.screenshot({ path: `${out}/${vp}-${name}.png`, fullPage: false });
      if (vp === "1440" || vp === "390") await p.screenshot({ path: `${out}/${vp}-${name}-full.png`, fullPage: true });
    };
    await ready("/try/home"); await shot("home");
    await ready("/try/learn"); await shot("learn");
    await ready("/try/learn/c-budget"); await shot("lesson-budget");
    await ready("/try/learn/c-scams"); await shot("lesson-scams");
    await ready("/try/explore/real"); await shot("real");
    await ready("/try/portfolio"); await shot("portfolio");
    await ready("/try/portfolio/paper"); await shot("paper");
    await ready("/try/parent"); await shot("parent");
  }
  require("fs").writeFileSync(`${out}/metrics.json`, JSON.stringify(metrics, null, 1));
  await b.close();
})();
