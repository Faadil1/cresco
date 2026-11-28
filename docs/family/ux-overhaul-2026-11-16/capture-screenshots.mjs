// usage (from apps/web, with the public Family artifact served on :3100): node ../../docs/family/ux-overhaul-2026-11-16/capture-screenshots.mjs <outdir>
import { createRequire } from "node:module"; const { chromium } = createRequire("/opt/node22/lib/node_modules/")("playwright");
import { mkdirSync, writeFileSync } from "node:fs";
const out = process.argv[2]; mkdirSync(out, { recursive: true });
const base = "http://127.0.0.1:3100";
const routes = [
  ["landing", "/"], ["try", "/try"], ["goal", "/try/goal"], ["home", "/try/home"], ["learn", "/try/learn"],
  ["lesson", "/try/learn/c-save"], ["explore", "/try/explore"], ["company", "/try/explore/markets"],
  ["decision", "/try/decision"], ["outcome", "/try/outcome"], ["portfolio", "/try/portfolio"],
  ["real", "/try/explore/real"], ["paper", "/try/portfolio/paper"], ["profile", "/try/profile"], ["parent", "/try/parent"],
  ["parent-key", "/try/parent/key"], ["parent-request", "/try/parent/request"], ["together", "/try/together"], ["lab", "/try/lab"],
];
const viewports = [["1440", 1440, 900], ["1280", 1280, 800], ["390", 390, 844], ["375", 375, 812]];
const metrics = [];
const browser = await chromium.launch();
for (const [vp, w, h] of viewports) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
  const page = await ctx.newPage();
  const external = [];
  page.on("request", r => { if (!r.url().startsWith(base)) external.push(r.url()); });
  for (const [name, path] of routes) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const m = await page.evaluate(() => {
      const text = document.body.innerText;
      const count = re => (text.match(re) || []).length;
      let small = 0, tiny = 0;
      for (const el of document.querySelectorAll("body *")) {
        if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        const r = el.getBoundingClientRect(); if (!r.width) continue;
        if (fs < 12) tiny++; else if (fs < 13) small++;
      }
      const ctas = [...document.querySelectorAll("main a, main button")].filter(e => e.getBoundingClientRect().width).length;
      const h1 = document.querySelector("h1")?.innerText ?? "";
      return {
        height: document.documentElement.scrollHeight, words: text.split(/\s+/).length,
        disclaimers: count(/pretend|fictional|imaginary|no real|not real|simulated|not verified|practice only/gi),
        tinyText: tiny, smallText: small, interactive: ctas, h1,
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    metrics.push({ vp, name, path, ...m });
    await page.screenshot({ path: `${out}/${vp}-${name}.png`, fullPage: false });
    if (vp === "390" || vp === "1440") await page.screenshot({ path: `${out}/${vp}-${name}-full.png`, fullPage: true });
  }
  metrics.push({ vp, external: [...new Set(external)] });
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/metrics.json`, JSON.stringify(metrics, null, 1));
console.log("ok", metrics.length);
