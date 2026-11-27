// Founder's order on a 1440 desktop: SEC quiz only, test price 100.00, try to buy. (TEST DATA, not a price.)
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const [base, out] = process.argv.slice(2);
(async () => { const b = await chromium.launch();
  for (const [vp,w,h,m] of [["1440",1440,900,false],["390",390,844,true]]) {
  const p = await (await b.newContext({ viewport:{width:w,height:h}, isMobile:m, hasTouch:m })).newPage();
  await p.goto(base + "/try/explore/real", {waitUntil:"networkidle"}); await p.waitForFunction(()=>document.documentElement.dataset.familyReady==="1");
  await p.getByTestId("real-mission-apple").locator("summary").click();
  await p.getByTestId("real-mission-apple").getByRole("button",{name:"No",exact:true}).click();
  const t = async n => { const x = p.getByTestId(`step-toggle-${n}`); if (await x.isVisible() && await x.getAttribute("aria-expanded")==="false") await x.click(); };
  if (m) { const next = p.getByTestId("real-step-1-next"); if (await next.isEnabled()) await next.click(); else await t(2); }
  await p.getByTestId("market-price-input").fill("100.00"); await p.getByTestId("market-quote-submit").click();
  await t(3); await p.getByTestId("market-quantity-input").fill("0.25");
  await p.getByTestId("market-buy").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300); await p.screenshot({ path: `${out}/${vp}-p0-blocked-buy.png` });
  }
  await b.close(); })();
