// node run.cjs <outdir> : scripted Child + Parent journey, one screenshot per screen, 390 and 1440.
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const [vp, w, h, mobile] of [["390", 390, 844, true], ["1440", 1440, 900, false]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 })).newPage();
    let i = 0;
    const shot = async name => { await p.waitForTimeout(200); await p.screenshot({ path: `${out}/${vp}-${String(++i).padStart(2, "0")}-${name}.png`, fullPage: true }); };
    const nav = name => p.locator('nav[aria-label="Main"]:visible').getByRole("link", { name, exact: true }).click();
    const chapter = name => p.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name }).click();
    await p.goto("http://127.0.0.1:3100/try", { waitUntil: "networkidle" });
    await p.waitForFunction(() => document.documentElement.dataset.familyReady === "1");
    await shot("welcome");
    await p.getByTestId("welcome-start").click(); await p.getByRole("radio", { name: /gaming setup/i }).click(); await shot("goal");
    await chapter("Next"); await p.getByRole("button", { name: "Food & shopping" }).click(); await shot("interests");
    await chapter("Next"); await shot("ready");
    await chapter("Open my Home"); await shot("home-start");
    await p.getByTestId("home-mission-go").click(); await shot("lesson-slide");
    for (let k = 0; k < 12; k++) {
      const ex = p.getByTestId("lesson-applied-exercise");
      if (await ex.isVisible() && !(await p.getByTestId("applied-feedback").count())) await ex.getByRole("button").first().click();
      const q = p.getByRole("button", { name: /quick check/i });
      if (await q.isVisible()) { await q.click(); break; }
      await p.getByRole("button", { name: /next idea/i }).click();
    }
    const choices = p.locator("[data-testid=lesson-quiz] fieldset button");
    for (let k = 0; k < await choices.count(); k++) { await choices.nth(k).click(); if (await p.getByTestId("lesson-feedback").getByText(/^correct/i).count()) break; }
    await shot("lesson-quiz");
    await p.getByRole("button", { name: /complete lesson/i }).click(); await shot("lesson-done");
    await p.getByTestId("lesson-back-home").click(); await shot("home-after-lesson");
    await nav("Learn"); await shot("learn");
    await nav("Explore"); await shot("explore");
    await p.getByRole("link", { name: "Open Neighborhood Markets" }).click();
    await p.getByRole("button", { name: /compare food, wages/i }).click(); await shot("company");
    await p.getByTestId("practice-this").click();
    await p.getByRole("button", { name: /a bigger choice/i }).click(); await shot("decision");
    await p.getByTestId("make-choice").click(); await shot("outcome-blocked");
    await p.getByTestId("to-parent").click(); await shot("parent-request");
    await p.getByRole("navigation", { name: "Parent" }).getByRole("link", { name: "Overview" }).click(); await shot("parent-overview");
    await p.getByTestId("open-request").click();
    await p.getByTestId("approve-once").click(); await shot("parent-approved");
    await p.getByTestId("hand-back").click(); await shot("outcome-approved");
    await p.getByTestId("use-approval").click(); await shot("outcome-receipt");
    await nav("Portfolio"); await shot("portfolio");
    await nav("Home"); await shot("home-together-mission");
    await p.getByTestId("home-mission-go").click(); await shot("together");
    await p.getByRole("button", { name: /practice a small fictional choice/i }).click();
    await p.getByRole("button", { name: /agree on a small practice boundary/i }).click();
    await p.getByRole("button", { name: /mark our discussion complete/i }).click(); await shot("together-done");
    await p.getByTestId("together-home").click(); await shot("home-loop-complete");
    await nav("Profile"); await shot("profile");
    await p.getByTestId("switch-to-parent").or(p.getByRole("link", { name: /^Parent's view/ })).first().click().catch(async () => { await p.getByRole("link", { name: /parent/i }).first().click(); });
    await shot("parent-overview-after");
    await p.getByRole("navigation", { name: "Parent" }).getByRole("link", { name: "My Key" }).click(); await shot("parent-key");
    await p.getByRole("navigation", { name: "Parent" }).getByRole("link", { name: "Learn" }).click(); await shot("parent-learn");
    await p.getByRole("navigation", { name: "Parent" }).getByRole("link", { name: "Requests" }).click(); await shot("parent-requests-after");
  }
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
