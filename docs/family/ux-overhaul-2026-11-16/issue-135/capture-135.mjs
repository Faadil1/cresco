// node capture-135.mjs <baseUrl> <outdir> [viewports]  (#135 Home/Learn before/after; run from apps/web)
import { chromium } from "/home/user/cresco/apps/web/node_modules/playwright/index.mjs";
import { completeInteractiveLesson } from "/home/user/cresco/apps/web/e2e/family-ready.mjs";
import { writeFileSync } from "node:fs";
const [base, out, only] = process.argv.slice(2);
const VPS = [["1440", 1440, 900, false], ["1280", 1280, 800, false], ["390", 390, 844, true], ["375", 375, 812, true]]
  .filter(v => !only || only.split(",").includes(v[0]));
const b = await chromium.launch();
const metrics = [];
for (const [vp, w, h, m] of VPS) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m, deviceScaleFactor: 1 })).newPage();
  const ready = async () => { await p.waitForFunction(() => document.documentElement.dataset.familyReady === "1"); await p.waitForTimeout(350); };
  const shot = async name => {
    await p.waitForTimeout(450);
    const r = await p.evaluate(() => ({ height: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, dpr: devicePixelRatio, iw: innerWidth }));
    metrics.push({ vp, name, ...r });
    await p.screenshot({ path: `${out}/${vp}-${name}.png` });
    await p.screenshot({ path: `${out}/${vp}-${name}-full.png`, fullPage: true });
  };
  const nav = name => p.locator('nav[aria-label="Main"]:visible').getByRole("link", { name, exact: true }).click();
  const chapter = name => p.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name }).click();
  await p.goto(base + "/try/home", { waitUntil: "networkidle" }); await ready(); await shot("home-fresh");
  await p.goto(base + "/try/learn", { waitUntil: "networkidle" }); await ready(); await shot("learn-fresh");
  // In-app journey (state is in memory): onboarding with the bike goal, save 40, finish two lessons.
  await p.goto(base + "/try", { waitUntil: "networkidle" }); await ready();
  await p.getByTestId("welcome-start").click(); await p.getByRole("radio", { name: /new bike/i }).click();
  await chapter("Next"); await p.getByRole("button", { name: "Food & shopping" }).click();
  await chapter("Next"); await chapter("Open my Home");
  await p.getByTestId("home-save").click(); await p.getByTestId("home-save").click();
  await shot("home-goal");
  for (let i = 0; i < 2; i++) {
    if (i === 0) await p.getByTestId("home-mission-go").click();
    else { await nav("Learn"); await p.getByTestId("learn-up-next").click(); }
    if (i === 1) await shot("lesson");
    await completeInteractiveLesson(p, { expectWrongFirst: false });
    if (i === 1) await shot("lesson-done");
    await p.getByTestId("lesson-back-home").click();
  }
  await shot("home-progress");
  await nav("Learn"); await shot("learn-progress");
  await p.close();
}
writeFileSync(`${out}/metrics.json`, JSON.stringify(metrics, null, 1));
await b.close();
