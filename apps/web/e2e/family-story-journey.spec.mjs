import { test, expect } from "@playwright/test";

const FORBIDDEN = ["cresco-family-api", "keys-api-stocklana", "api.solana", "rpc.solana", "/api/", "api.pyth", "hermes.pyth"];

function watch(page) {
  const outbound = [];
  const external = [];
  const bad = [];
  page.on("response", response => { if (response.status() >= 400) bad.push(response.url().replace("http://127.0.0.1:3100", "")); });
  page.on("request", request => {
    const url = request.url();
    if (FORBIDDEN.some(value => url.includes(value)) || !["GET", "HEAD"].includes(request.method())) outbound.push(`${request.method()} ${url}`);
    if (!url.startsWith("http://127.0.0.1:3100")) external.push(url);
  });
  return { outbound, external, bad };
}
// The only tolerated failure is the known WebKit manifest 404 (console noise, no user effect).
function expectCleanNetwork(net) {
  expect(net.outbound, "no API, wallet or write requests").toEqual([]);
  expect(net.external, "no external hosts").toEqual([]);
  expect(net.bad.filter(url => url !== "/manifest.webmanifest"), "no failed response, so no denied prefetch or fallback").toEqual([]);
}
const inViewport = locator => expect(locator).toBeInViewport({ ratio: 0.5 });
async function answerUntilCorrect(page, scope, feedback = "lesson-feedback") {
  const buttons = page.locator(`${scope} button[aria-pressed]`);
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    await buttons.nth(i).click();
    if (await page.getByTestId(feedback).getByText(/^(correct|good research)/i).count()) return;
  }
  throw new Error("no correct answer found");
}
async function advanceLessonToQuiz(page) {
  // All courses require one applied teaching moment; either option can be
  // chosen, and no option changes a Key, credits or Parent authorization.
  let reached = false;
  for (let step = 0; step < 20; step++) {
    const exercise = page.getByTestId("lesson-applied-exercise");
    if (await exercise.isVisible() && await page.getByTestId("applied-feedback").count() === 0) {
      const advance = page.getByRole("button", { name: /next idea|quick check/i });
      await expect(advance).toBeDisabled();
      await exercise.getByRole("button").first().click();
      await expect(page.getByTestId("applied-feedback")).toBeVisible();
    }
    const quick = page.getByRole("button", { name: /quick check/i });
    if (await quick.isVisible()) {
      await expect(quick).toBeEnabled();
      await quick.click();
      reached = true;
      break;
    }
    const next = page.getByRole("button", { name: /next idea/i });
    await expect(next).toBeEnabled();
    await next.click();
  }
  expect(reached, "lesson must reach its final recall check").toBe(true);
}
async function finishLesson(page) {
  await advanceLessonToQuiz(page);
  await answerUntilCorrect(page, "[data-testid=lesson-quiz]");
  await page.getByRole("button", { name: /complete lesson/i }).click();
}
async function openReadyAfterGoal(page, interest) {
  const next = () => page.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name: "Next", exact: true });
  await next().click();
  await expect(page).toHaveURL(/\/try\/goal\/interests$/);
  if (interest) await page.getByRole("button", { name: interest }).click();
  await page.getByRole("navigation", { name: "Previous and next chapter" })
    .getByRole("link", { name: interest ? "Next" : "Skip for now" }).click();
  await expect(page).toHaveURL(/\/try\/goal\/ready$/);
}
// The five destinations live in two "Main" navs (side rail >= md, bottom bar on phones); use the visible one.
const tab = (page, name) => page.locator('nav[aria-label="Main"]:visible').getByRole("link", { name, exact: true });
async function openHomeFromReady(page) {
  await page.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name: "Open my Home" }).click();
  await expect(page).toHaveURL(/\/try\/home$/);
}
async function openOptionalSavings(page) {
  await page.getByTestId("ready-optional-saving").locator("summary").click();
}
async function oneStatusAtMost(page) {
  expect(await page.getByRole("status").count()).toBeLessThanOrEqual(1);
}

test("the whole story: goal, lesson, research, blocked choice, Parent approval, receipt, replay, together", async ({ page }, testInfo) => {
  const net = watch(page);
  await page.goto("/try");
  await expect(page.getByRole("heading", { level: 1, name: /learn to decide/i })).toBeVisible();
  await expect(page.getByTestId("welcome-start")).toBeInViewport();
  await expect(page.getByTestId("welcome-key")).toContainText("15 credits");
  await page.getByTestId("welcome-start").click();

  // Chapter 1: goal and interests change what comes next.
  await expect(page).toHaveURL(/\/try\/goal$/);
  await page.getByRole("radio", { name: /gaming setup/i }).click();
  await expect(page.getByTestId("goal-result")).toContainText(/about half a year/i);
  await openReadyAfterGoal(page, "Food & shopping");
  await openOptionalSavings(page);
  await page.getByRole("button", { name: /set aside 20 credits/i }).click();
  await expect(page.getByTestId("goal-progress")).toContainText("20 of 80");
  await openHomeFromReady(page);
  await expect(page.getByTestId("home-goal-saved")).toHaveText("20/80");
  await tab(page, "Learn").click();

  // Learn: the lesson starts where the goal needs it, with a goal note, and quiz feedback is real.
  await expect(page).toHaveURL(/\/try\/learn$/);
  await expect(page.getByTestId("learn-progress")).toContainText("0 of 17");
  await page.getByTestId("learn-up-next").click();
  await expect(page).toHaveURL(/\/try\/learn\/original-why-prices-move$/);
  await expect(page.getByTestId("goal-note")).toContainText(/gaming setup/i);
  await expect(page.getByTestId("lesson-slide").locator("svg").first()).toBeVisible();
  await advanceLessonToQuiz(page);
  const choices = page.locator("[data-testid=lesson-quiz] fieldset button");
  // A wrong answer is explained and does not complete the lesson.
  let wrong = 0;
  for (let i = 0; i < await choices.count(); i++) {
    await choices.nth(i).click();
    if (await page.getByTestId("lesson-feedback").getByText(/^not quite/i).count()) { wrong++; break; }
  }
  expect(wrong).toBe(1);
  await expect(page.getByRole("button", { name: /complete lesson/i })).toBeDisabled();
  await answerUntilCorrect(page, "[data-testid=lesson-quiz]");
  await oneStatusAtMost(page);
  await page.getByRole("button", { name: /complete lesson/i }).click();
  await expect(page.getByTestId("lesson-done-next")).toBeVisible();
  await page.getByRole("link", { name: /^explore companies$/i }).click();
  await expect(page).toHaveURL(/\/try\/explore$/);
  // A hard load resets the in-memory story.
  await page.goto("/try/learn");
  await expect(page.getByTestId("learn-progress")).toContainText("0 of 17");
  void testInfo;
  expect(net.outbound, "no API, wallet or write requests").toEqual([]);
  expect(net.external, "no external hosts").toEqual([]);
});

test("one client-side journey keeps a single state across real pages, Back and Forward", async ({ page }, testInfo) => {
  const net = watch(page);
  await page.goto("/try");
  await page.evaluate(() => { window.__marker = "same-document"; });
  await page.getByTestId("welcome-start").click();
  await page.getByRole("radio", { name: /family trip/i }).click();
  await openReadyAfterGoal(page, "Food & shopping");
  await openOptionalSavings(page);
  await page.getByRole("button", { name: /set aside 20 credits/i }).click();
  await openHomeFromReady(page);
  await tab(page, "Learn").click();
  await page.getByTestId("learn-up-next").click();
  await finishLesson(page);
  await expect(page.getByTestId("lesson-done-next")).toBeVisible();
  await page.getByRole("link", { name: /^explore companies$/i }).click();
  await expect(page).toHaveURL(/\/try\/explore$/);

  // Interest puts the matching invented company first.
  await expect(page.getByRole("list", { name: "Invented companies" }).getByRole("listitem").first()).toHaveAttribute("data-testid", "company-markets");
  await expect(page.getByTestId("company-markets")).toContainText("You like: Food & shopping");
  await expect(page.getByTestId("explore-key-chip")).toContainText("15 credits");

  await page.getByRole("link", { name: "Open Neighborhood Markets" }).click();
  await expect(page).toHaveURL(/\/try\/explore\/markets$/);
  await expect(page.getByTestId("goal-lens")).toContainText(/family trip/i);
  await answerUntilCorrect(page, "section[aria-labelledby=research-q]", "research-feedback");
  await expect(page.getByTestId("practice-this")).toBeVisible();

  // Back and Forward keep what was done; nothing reloaded.
  await page.goBack();
  await expect(page).toHaveURL(/\/try\/explore$/);
  await expect(page.getByTestId("company-markets")).toContainText("Researched");
  await page.goForward();
  await expect(page).toHaveURL(/\/try\/explore\/markets$/);
  await page.getByTestId("practice-this").click();
  await expect(page).toHaveURL(/\/try\/decision$/);

  // Chapter 4: the limit is visible before the click.
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "inside-key");
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "needs-parent");
  await expect(page.getByTestId("limit-preview")).toContainText(/over your 15-credit limit/i);
  await expect(page.getByTestId("make-choice")).toContainText(/ask my parent/i);
  await page.getByLabel(/it fits what i am saving for/i).check();
  await page.getByTestId("make-choice").click();

  // Chapter 6, blocked: the outcome is visible without scrolling, and tells the Child what to do.
  await expect(page).toHaveURL(/\/try\/outcome$/);
  await inViewport(page.getByTestId("outcome-hero"));
  await expect(page.getByTestId("outcome-hero")).toContainText(/blocked by my key/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("0");
  await oneStatusAtMost(page);
  await testInfo.attach("blocked.png", { body: await page.screenshot(), contentType: "image/png" });
  await page.getByTestId("to-parent").click();

  // Chapter 5: the Parent sees the exact request, the goal and the Child's reason.
  await expect(page).toHaveURL(/\/try\/parent\/request$/);
  await expect(page.getByTestId("story-lens")).toContainText(/parent/i);
  await expect(page.getByTestId("request-detail")).toContainText("Practice MKT for 25 credits");
  await expect(page.getByTestId("child-reason")).toHaveText(/fits what i am saving for/i);
  await expect(page.getByTestId("parent-goal-card")).toContainText(/family trip/i);
  await expect(page.getByText(/no guardian identity or consent is verified/i)).toBeVisible();
  await inViewport(page.getByTestId("approve-once"));
  await page.getByTestId("approve-once").click();
  await inViewport(page.getByTestId("parent-result"));
  await expect(page.getByTestId("parent-result")).toContainText(/key did not widen/i);
  await oneStatusAtMost(page);
  await page.getByTestId("hand-back").click();

  // Child uses the approval exactly once.
  await expect(page.getByTestId("outcome-hero")).toContainText(/your parent said yes, once/i);
  await page.getByTestId("use-approval").click();
  await expect(page.getByTestId("receipt-line")).toContainText("25 credits");
  await expect(page.getByTestId("receipt-line")).toContainText(/cannot be replayed/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("25");
  await expect(page.getByTestId("outcome-saved")).toContainText("20 / 100");
  await expect(page.getByTestId("downturn-card")).toContainText(/bad month/i);
  await inViewport(page.getByTestId("outcome-hero"));
  await testInfo.attach("receipt.png", { body: await page.screenshot(), contentType: "image/png" });
  // Portfolio is its own destination, reached from the result.
  await page.getByRole("link", { name: /open my portfolio/i }).click();
  await expect(page).toHaveURL(/\/try\/portfolio$/);
  await expect(page.getByTestId("portfolio-spent")).toContainText("25");
  await expect(page.getByTestId("portfolio-receipts")).toContainText(/PRACTICE ONLY - NOT EXECUTED ONCHAIN/i);
  await expect(page.getByTestId("child-request-history")).toContainText(/approval used/i);
  await page.goBack();
  await expect(page).toHaveURL(/\/try\/outcome$/);

  // Replay is refused before the click and by the engine.
  await page.getByRole("link", { name: /make another choice/i }).click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "inside-key");
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "used");
  await expect(page.getByTestId("make-choice")).toBeDisabled();

  // Chapter 7: both perspectives, then a real choice of what to learn next.
  await page.getByRole("button", { name: /a small choice/i }).click();
  await page.getByTestId("make-choice").click();
  await expect(page).toHaveURL(/\/try\/outcome$/);
  await expect(page.getByTestId("outcome-hero")).toContainText(/on your own/i);
  await page.getByRole("link", { name: /talk it through/i }).click();
  await page.getByRole("button", { name: /practice a small fictional choice/i }).click();
  await page.getByRole("button", { name: /answering as the parent/i }).click();
  await page.getByRole("button", { name: /agree on a small practice boundary/i }).click();
  await page.getByRole("button", { name: /mark our discussion complete/i }).click();
  await expect(page.getByTestId("together-result")).toContainText(/2 practice receipts/i);
  await expect(page.getByTestId("next-chapter-choice").getByRole("link").first()).toBeVisible();

  // Never reloaded: one document for the whole client-side story.
  expect(await page.evaluate(() => window.__marker)).toBe("same-document");
  expectCleanNetwork(net);
});

test("a declined request teaches the Child why and leads to a smaller choice", async ({ page }) => {
  await page.goto("/try/explore/markets");
  await page.getByTestId("practice-this").click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await page.getByTestId("make-choice").click();
  await page.getByTestId("to-parent").click();
  await page.getByTestId("decline-too-big").click();
  await expect(page.getByTestId("parent-result")).toContainText(/declined\. nothing was bought/i);
  await page.getByTestId("hand-back").click();
  await inViewport(page.getByTestId("outcome-hero"));
  await expect(page.getByTestId("outcome-hero")).toContainText(/big for one choice/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("0");
  await page.getByTestId("try-smaller").click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "declined");
  await expect(page.getByTestId("make-choice")).toBeDisabled();
  await page.getByRole("button", { name: /a small choice/i }).click();
  await page.getByTestId("make-choice").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/on your own/i);
});

test("changing the Key makes an earlier request stale, and learning never changes the Key", async ({ page }) => {
  await page.goto("/try/explore/markets");
  await page.getByTestId("practice-this").click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await page.getByTestId("make-choice").click();
  await page.getByTestId("to-parent").click();
  await page.getByRole("link", { name: /^parent home$/i }).first().click();
  await expect(page.getByTestId("parent-pending")).toBeVisible();
  await page.getByRole("link", { name: /change the key on purpose/i }).click();
  await page.getByLabel("Max credits per action").fill("30");
  await page.getByRole("button", { name: /explicitly update standing key/i }).click();
  await expect(page.getByTestId("key-result")).toContainText(/previous requests became stale/i);
  await page.getByRole("link", { name: /^parent home$/i }).first().click();
  await page.getByRole("link", { name: /your learning path/i }).click();
  await page.getByRole("link", { name: /understand my key/i }).click();
  await finishLesson(page);
  await expect(page.getByRole("link", { name: /back to the parent/i })).toBeVisible();
  await page.getByRole("link", { name: /back to the parent/i }).click();
  await expect(page.getByText(/decides alone up to 30 credits/i)).toBeVisible();
  await expect(page.getByText(/1 of 7 Parent lessons done/i)).toBeVisible();
});

test("deep links and refresh: empty states point to the right chapter, bad ids are 404", async ({ page, request }) => {
  await page.goto("/try/parent/request");
  await expect(page.getByTestId("parent-empty")).toBeVisible();
  await expect(page.getByRole("link", { name: /go to the child's choice/i })).toBeVisible();
  await page.goto("/try/outcome");
  await expect(page.getByTestId("outcome-hero")).toContainText(/nothing has happened yet/i);
  await page.getByTestId("go-choose").click();
  await expect(page).toHaveURL(/\/try\/decision$/);
  await expect(page.getByRole("heading", { name: /which company do you want to practice with/i })).toBeVisible();
  await page.goto("/try/decision");
  await expect(page.getByTestId("make-choice")).toHaveCount(0);
  await page.getByRole("button", { name: "Choose ORC" }).click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "inside-key");
  await page.reload();
  await expect(page.getByRole("heading", { name: /which company do you want to practice with/i })).toBeVisible();
  // Research-only companies offer no practice choice.
  await page.goto("/try/explore/river");
  await expect(page.getByText(/research only\. no practice choice is offered/i)).toBeVisible();
  await expect(page.getByTestId("practice-this")).toHaveCount(0);
  for (const path of ["/try/explore/nope", "/try/explore/ORCHARD", "/try/learn/unknown", "/try/api", "/try/parent/sign-in", "/try/wallet", "/try/dashboard", "/try/home/x", "/try/portfolio/ORC", "/try/profile/edit", "/home", "/portfolio", "/profile", "/parent/sign-in", "/onboarding/goal", "/invest/ORC", "/api/health"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
  for (const path of ["/", "/try", "/try/goal", "/try/home", "/try/portfolio", "/try/profile", "/try/learn", "/try/learn/c-save", "/try/explore", "/try/explore/basket", "/try/decision", "/try/parent", "/try/parent/learn", "/try/parent/key", "/try/parent/request", "/try/outcome", "/try/together", "/try/lab"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test("setup uses separate readable screens, then the durable five-destination app takes over", async ({ page }, testInfo) => {
  const appPaths = ["/try/home", "/try/learn", "/try/explore", "/try/decision", "/try/portfolio", "/try/profile", "/try/outcome", "/try/together"];
  for (const path of ["/try", "/try/goal", "/try/goal/interests", "/try/goal/ready", ...appPaths, "/try/parent", "/try/learn/c-save"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path + " horizontal overflow").toBeLessThanOrEqual(1);
    await expect(page.getByRole("main")).toBeVisible();
    // The seven-chapter rail is gone everywhere.
    await expect(page.getByTestId("story-rail")).toHaveCount(0);
    if (path.startsWith("/try/goal")) {
      await expect(page.getByRole("progressbar", { name: "Setup progress" })).toBeInViewport();
      await expect(page.locator('nav[aria-label="Main"]:visible')).toHaveCount(0);
    } else if (appPaths.includes(path)) {
      const main = page.locator('nav[aria-label="Main"]:visible');
      await expect(main).toHaveCount(1);
      await expect(main).toBeInViewport();
      await expect(main.getByRole("link")).toHaveText(["Home", "Learn", "Explore", "Portfolio", "Profile"]);
      await expect(main.locator('[aria-current="page"]')).toHaveCount(1);
    } else {
      // Invitation, Parent dashboard and lesson focus mode have no Child tab bar.
      await expect(page.locator('nav[aria-label="Main"]:visible')).toHaveCount(0);
    }
  }
  await page.goto("/try/goal");
  await expect(page.getByTestId("goal-scene-dream")).toBeVisible();
  await testInfo.attach("legacy-step-1-dream.png", { body: await page.screenshot(), contentType: "image/png" });
  await expect(page.getByRole("group", { name: "Interests" })).toHaveCount(0);
  await expect(page.getByTestId("ready-optional-saving")).toHaveCount(0);
  await page.getByRole("radio", { name: /new bike/i }).click();
  await page.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/try\/goal\/interests$/);
  await expect(page.getByTestId("goal-scene-interests")).toBeVisible();
  await testInfo.attach("legacy-step-2-interests.png", { body: await page.screenshot(), contentType: "image/png" });
  await expect(page.getByRole("radiogroup", { name: "Saving goal" })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name: "Skip for now" }).click();
  await expect(page).toHaveURL(/\/try\/goal\/ready$/);
  await expect(page.getByTestId("goal-scene-ready")).toBeVisible();
  const safety = page.getByTestId("ready-safety-summary");
  const nextAction = page.getByRole("navigation", { name: "Previous and next chapter" }).getByRole("link", { name: "Open my Home" });
  await expect(safety).toContainText(/no money moves; no guardian identity is verified/i);
  await expect(nextAction).toBeInViewport({ ratio: 0.5 });
  const safetyBox = await safety.boundingBox();
  const nextBox = await nextAction.boundingBox();
  expect(safetyBox, "ready safety panel geometry").not.toBeNull();
  expect(nextBox, "main action geometry").not.toBeNull();
  expect(safetyBox.y + safetyBox.height + 8, "the sticky main CTA must not cover the practice-safety summary")
    .toBeLessThanOrEqual(nextBox.y);
  await testInfo.attach("legacy-step-3-ready.png", { body: await page.screenshot(), contentType: "image/png" });
  await nextAction.click();
  await expect(page).toHaveURL(/\/try\/home$/);
  await expect(page.locator('nav[aria-label="Main"]:visible')).toBeInViewport();
});

test("landing leads into the story, with the free lab still available", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /try cresco - no sign-in/i }).click();
  await expect(page).toHaveURL(/\/try$/);
  // One invitation, one main action; no chapter index.
  await expect(page.getByTestId("welcome-start")).toBeVisible();
  await expect(page.getByTestId("welcome-chapters")).toHaveCount(0);
  await page.goto("/try/lab");
  await expect(page.getByTestId("family-public-studio")).toBeVisible();
  await page.getByRole("link", { name: /take the illustrated story/i }).click();
  await expect(page).toHaveURL(/\/try$/);
});

test("the lab and the story share one practice state", async ({ page }) => {
  await page.goto("/try/goal");
  await page.getByRole("radio", { name: /family trip/i }).click();
  await openReadyAfterGoal(page);
  await openOptionalSavings(page);
  await page.getByRole("button", { name: /set aside 20 credits/i }).click();
  await page.getByRole("link", { name: /prefer the free practice lab/i }).click();
  await expect(page).toHaveURL(/\/try\/lab$/);
  await expect(page.getByTestId("practice-saved")).toHaveText("20");
  await expect(page.getByText("Saved for Family trip", { exact: true })).toBeVisible();
});

test("a Parent can start first, with their own lens, and nothing is pre-filled for them", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try");
  await page.getByTestId("start-as-parent").click();
  await expect(page).toHaveURL(/\/try\/parent$/);
  await expect(page.getByTestId("story-lens")).toContainText(/parent's view/i);
  await expect(page.getByTestId("parent-no-pending")).toContainText(/nothing is waiting/i);
  await expect(page.getByTestId("goal-default-note")).toBeVisible();
  await page.getByRole("link", { name: /your learning path/i }).click();
  await expect(page).toHaveURL(/\/try\/parent\/learn$/);
  await page.getByRole("link", { name: /money & family conversations/i }).click();
  await expect(page.getByTestId("goal-note")).toContainText(/your child is saving for/i);
  await expect(page.getByText(/parent's lens/i).first()).toBeVisible();
  await finishLesson(page);
  await expect(page.getByTestId("lesson-done")).toContainText(/lesson complete/i);
  await page.getByRole("link", { name: /back to the parent/i }).click();
  await expect(page.getByText(/1 of 7 Parent lessons done/i)).toBeVisible();
  // Parent learning never touched the Child's chapters or the Key.
  await expect(page.getByText(/decides alone up to 15 credits/i)).toBeVisible();
  await page.getByRole("link", { name: /what happened/i }).last().click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/nothing has happened yet/i);
  expectCleanNetwork(net);
});

test("the header always names the right lens, including Parent lessons and Together", async ({ page }) => {
  const lens = page.getByTestId("story-lens");
  await page.goto("/try/learn/p-basics");
  await expect(lens).toHaveAttribute("data-lens", "parent");
  await expect(lens).toContainText(/parent's view/i);
  await page.goto("/try/learn/c-save");
  await expect(lens).toHaveAttribute("data-lens", "child");
  await page.goto("/try/parent/request");
  await expect(lens).toHaveAttribute("data-lens", "parent");
  await page.goto("/try/together");
  await expect(lens).toHaveAttribute("data-lens", "both");
  await expect(lens).toContainText(/together/i);
});

test("exhausted credits and a duplicate request are explained before the click and cannot be sent", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try/goal");
  // The chapter now requires an explicit goal choice; test the empty-credit
  // edge case through the real story, not a synthetic unchosen default.
  await page.getByRole("radio", { name: /family trip/i }).click();
  await openReadyAfterGoal(page);
  await openOptionalSavings(page);
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: /set aside 20 credits/i }).click();
  await expect(page.getByTestId("goal-progress")).toContainText("0 still available");
  await expect(page.getByRole("button", { name: /set aside 20 credits/i })).toBeDisabled();
  await openHomeFromReady(page);
  await expect(page.getByTestId("home-save")).toBeDisabled();
  await tab(page, "Explore").click();
  await page.getByRole("link", { name: "Open Neighborhood Markets" }).click();
  await page.getByTestId("practice-this").click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "insufficient");
  await expect(page.getByTestId("limit-preview")).toContainText(/only 0 practice credits/i);
  await expect(page.getByTestId("make-choice")).toBeDisabled();
  await page.getByRole("link", { name: /what happened/i }).last().click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/nothing has happened yet/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("0");
  expectCleanNetwork(net);
});

test("a second identical ask is blocked as already sent, and a Key change shows the Child an expired ask", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try/explore/markets");
  await page.getByTestId("practice-this").click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await page.getByTestId("make-choice").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/blocked by my key/i);
  // Duplicate: same company, same amount.
  await page.getByRole("link", { name: /make another choice/i }).click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "pending");
  await expect(page.getByTestId("limit-preview")).toContainText(/already sent to your parent/i);
  await expect(page.getByTestId("make-choice")).toBeDisabled();
  await page.getByRole("link", { name: /open the request/i }).click();
  await expect(page.getByTestId("request-detail")).toContainText("Practice MKT for 25 credits");
  // The Parent changes the Key and removes MKT from the allowed list.
  await page.getByRole("link", { name: /^parent home$/i }).first().click();
  await page.getByRole("link", { name: /change the key on purpose/i }).click();
  await page.getByRole("checkbox", { name: "MKT" }).uncheck();
  await page.getByRole("button", { name: /explicitly update standing key/i }).click();
  await expect(page.getByTestId("key-result")).toContainText(/previous requests became stale/i);
  await page.getByRole("link", { name: /what happened/i }).last().click();
  await inViewport(page.getByTestId("outcome-hero"));
  await expect(page.getByTestId("outcome-hero")).toContainText(/that ask expired/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("0");
  // An asset the Key no longer allows is named before the click.
  await page.getByRole("link", { name: /make another choice/i }).click();
  await page.getByRole("button", { name: /a small choice/i }).click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "needs-parent");
  await expect(page.getByTestId("limit-preview")).toContainText(/MKT is not allowed by your Key/i);
  expectCleanNetwork(net);
});

test("the goal chapter records an actual Child choice rather than silently accepting the default", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try/goal");
  const chapterNav = page.getByRole("navigation", { name: "Previous and next chapter" });
  await expect(page.getByText("Choose one to continue. You can change it any time.")).toBeVisible();
  await expect(chapterNav.getByText("Choose a goal to continue")).toHaveAttribute("aria-disabled", "true");
  await expect(chapterNav.getByRole("link", { name: "Next" })).toHaveCount(0);
  await page.getByRole("radio", { name: /family trip/i }).click();
  await expect(page.getByTestId("goal-result")).toContainText(/family trip/i);
  await expect(chapterNav.getByRole("link", { name: "Next" })).toBeVisible();
  await chapterNav.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/try\/goal\/interests$/);
  await page.getByRole("navigation", { name: "Previous and next chapter" })
    .getByRole("link", { name: "Skip for now" }).click();
  await expect(page).toHaveURL(/\/try\/goal\/ready$/);
  await openHomeFromReady(page);
  await expect(page.getByRole("heading", { level: 1, name: /one step at a time/i })).toBeVisible();
  await expect(page.getByTestId("home-focus")).toContainText(/family trip/i);
  expectCleanNetwork(net);
});

test("a fictional person's dilemma stays with the Child, Parent and receipt without granting authority", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try/explore/markets");
  await expect(page.getByTestId("fictional-episode")).toContainText("Mina");
  await page.getByRole("button", { name: /compare food, wages and delivery costs with sales/i }).click();
  await expect(page.getByTestId("episode-reflection")).toContainText(/more customers can help/i);
  await page.getByTestId("practice-this").click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await expect(page.getByTestId("limit-preview")).toHaveAttribute("data-preview-kind", "needs-parent");
  await page.getByTestId("make-choice").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/blocked by my key/i);
  await page.getByTestId("to-parent").click();
  await expect(page.getByTestId("parent-human-story")).toContainText("Mina");
  // The discussion is expandable: it should never push the exact approval
  // action off the iPhone's first screen by default.
  await expect(page.getByTestId("approve-once")).toBeInViewport({ ratio: 0.5 });
  await page.getByTestId("parent-human-story").locator("summary").click();
  await expect(page.getByTestId("parent-episode-choice")).toContainText(/compare food, wages and delivery costs with sales/i);
  await page.getByTestId("approve-once").click();
  await page.getByTestId("hand-back").click();
  await page.getByTestId("use-approval").click();
  await expect(page.getByTestId("receipt-line")).toContainText("25 credits");
  await expect(page.getByTestId("episode-takeaway")).toContainText(/more customers can help/i);
  await expect(page.getByTestId("episode-takeaway").getByRole("img", { name: /fictional Mina in her family.s grocery/i })).toBeVisible();
  await page.getByRole("link", { name: /talk it through/i }).last().click();
  await page.getByRole("button", { name: /practice a small fictional choice/i }).click();
  await page.getByRole("button", { name: /answering as the parent/i }).click();
  await page.getByRole("button", { name: /agree on a small practice boundary/i }).click();
  await page.getByRole("button", { name: /mark our discussion complete/i }).click();
  await expect(page.getByTestId("together-story-memory")).toContainText("Mina");
  await expect(page.getByTestId("together-story-memory").getByRole("img", { name: /fictional Mina in her family.s grocery/i })).toBeVisible();
  await expect(page.getByTestId("together-story-memory")).toContainText(/new fact could change your mind/i);
  expectCleanNetwork(net);
});

test("the first mobile story decision and a fictional person's problem are visible without scrolling", async ({ page }, testInfo) => {
  const net = watch(page);
  await page.goto("/try/goal");
  // The old Cresco's illustrated personal choices are once again the first
  // thing to interact with, not buried below a large decorative plant.
  await expect(page.getByRole("radio", { name: /new bike/i })).toBeInViewport({ ratio: 0.5 });
  await expect(page.getByRole("radio", { name: /family trip/i })).toBeInViewport({ ratio: 0.5 });
  // Acceptance evidence, exact test-head local Worker, viewport-sized (not full-page).
  await testInfo.attach("goal-first-screen.png", { body: await page.screenshot(), contentType: "image/png" });
  await page.goto("/try/explore/markets");
  // Match the character heading only: the dilemma's h3 can also mention Mina.
  await expect(page.getByTestId("fictional-episode").getByRole("heading", { level: 2, name: /^mina,/i }))
    .toBeInViewport({ ratio: 0.5 });
  await expect(page.getByTestId("fictional-episode")).toContainText(/supplier has raised delivery prices/i);
  await expect(page.getByTestId("fictional-episode").getByRole("img", { name: /fictional Mina in her family.s grocery/i })).toBeVisible();
  // The first response must be genuinely reachable above the initial fold:
  // visible heading alone is not enough for a story-led decision.
  const firstChoice = page.getByRole("group", { name: "Your response to the fictional dilemma" })
    .getByRole("button").first();
  await expect(firstChoice).toBeInViewport({ ratio: 0.99 });
  // Checking half of the button isn't enough: the fixed five-tab nav can
  // overlay a visible DOM element and make its answer unreadable / unclickable.
  const mobileNav = page.getByTestId("bottom-nav");
  if (await mobileNav.isVisible()) {
    const answerRect = await firstChoice.boundingBox();
    const navRect = await mobileNav.boundingBox();
    expect(answerRect, "Mina's answer must have a real onscreen layout").not.toBeNull();
    expect(navRect, "mobile tab bar must have a real onscreen layout").not.toBeNull();
    expect(answerRect.y + answerRect.height,
      "Mina's entire first answer must clear the fixed bottom navigation")
      .toBeLessThanOrEqual(navRect.y - 8);
  }
  await testInfo.attach("mina-first-screen.png", { body: await page.screenshot(), contentType: "image/png" });
  // The invitation to consider the business is a *story-first* question,
  // not an implied real investment decision.
  await page.getByRole("button", { name: /compare food, wages and delivery costs with sales/i }).click();
  await expect(page.getByTestId("episode-reflection")).toContainText(/more customers can help/i);
  expectCleanNetwork(net);
});


// Facilitated sessions use one computer and one browser tab. A *new* family's
// session must start from a clean slate without carrying a prior child's goal,
// fictional company response, Parent approval, receipt or spending into it.
test("a new local family session never inherits the previous simulated family's decisions", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try/goal");
  await page.getByRole("radio", { name: /family trip/i }).click();
  await openReadyAfterGoal(page);
  await openOptionalSavings(page);
  await page.getByRole("button", { name: /set aside 20 credits/i }).click();
  await openHomeFromReady(page);
  await tab(page, "Explore").click();
  await page.getByRole("link", { name: "Open Neighborhood Markets" }).click();
  await page.getByRole("button", { name: /compare food, wages and delivery costs with sales/i }).click();
  await page.getByTestId("practice-this").click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await page.getByTestId("make-choice").click();
  await page.getByTestId("to-parent").click();
  await page.getByTestId("approve-once").click();
  await page.getByTestId("hand-back").click();
  await page.getByTestId("use-approval").click();
  await expect(page.getByTestId("receipt-line")).toContainText("25 credits");
  await expect(page.getByTestId("episode-takeaway")).toContainText("Mina");
  await expect(page.getByTestId("outcome-saved")).toContainText("20 / 100");
  // The facilitator starts the next participant with a full reload, rather
  // than client-side chapter navigation which correctly retains the story.
  await page.reload();
  await expect(page.getByTestId("outcome-hero")).toContainText(/nothing has happened yet/i);
  await expect(page.getByTestId("outcome-spent")).toHaveText("0");
  await expect(page.getByTestId("episode-takeaway")).toHaveCount(0);
  await expect(page.getByTestId("story-rail")).toHaveCount(0);
  await page.locator('a[href="/try/parent"]:visible').first().click();
  await expect(page.getByTestId("parent-no-pending")).toContainText(/nothing is waiting/i);
  await page.getByTestId("goal-default-note").getByRole("link", { name: /choose it together/i }).click();
  await expect(page.getByRole("radio", { name: /family trip/i })).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("navigation", { name: "Previous and next chapter" })
    .getByText("Choose a goal to continue")).toHaveAttribute("aria-disabled", "true");
  expectCleanNetwork(net);
});

// ---------------------------------------------------------------------------
// Durable app shell (legacy Cresco product UX) acceptance journeys.
// ---------------------------------------------------------------------------

async function childSetup(page, goal = /new bike/i, interest = "Food & shopping") {
  await page.goto("/try");
  await page.getByTestId("welcome-start").click();
  await page.getByRole("radio", { name: goal }).click();
  await openReadyAfterGoal(page, interest);
  await openHomeFromReady(page);
}

test("Home shows goal, today's mission and navigation in the first screen, and each destination has its own content", async ({ page }, testInfo) => {
  const net = watch(page);
  await childSetup(page);
  await expect(page.getByTestId("home-focus")).toBeInViewport({ ratio: 0.5 });
  await expect(page.getByTestId("home-focus")).toContainText(/new bike/i);
  await expect(page.getByTestId("home-save")).toBeVisible();
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "first-lesson");
  await expect(page.getByTestId("home-mission-go")).toBeInViewport({ ratio: 0.5 });
  await expect(page.locator('nav[aria-label="Main"]:visible')).toBeInViewport();
  await expect(page.getByTestId("home-key")).toContainText("15 credits");
  await expect(page.getByTestId("home-parent-preview")).toHaveCount(0);
  await testInfo.attach("home-first-screen.png", { body: await page.screenshot(), contentType: "image/png" });

  const destinations = [
    ["Learn", /\/try\/learn$/, page.getByTestId("learn-up-next-card")],
    ["Explore", /\/try\/explore$/, page.getByTestId("explore-featured")],
    ["Portfolio", /\/try\/portfolio$/, page.getByTestId("portfolio-empty")],
    ["Profile", /\/try\/profile$/, page.getByTestId("profile-screen")],
    ["Home", /\/try\/home$/, page.getByTestId("home-screen")],
  ];
  for (const [name, url, landmark] of destinations) {
    await tab(page, name).click();
    await expect(page).toHaveURL(url);
    await expect(tab(page, name)).toHaveAttribute("aria-current", "page");
    await expect(landmark).toBeVisible();
    await testInfo.attach(`${name.toLowerCase()}.png`, { body: await page.screenshot(), contentType: "image/png" });
  }
  // Interest-matched person is the one Explore and Home suggest first.
  await tab(page, "Explore").click();
  await expect(page.getByTestId("explore-featured")).toContainText("Mina");
  // Profile never asks for identity.
  await tab(page, "Profile").click();
  await expect(page.getByTestId("profile-goal")).toContainText(/new bike/i);
  await expect(page.getByTestId("profile-interests")).toContainText(/food & shopping/i);
  await expect(page.locator("input")).toHaveCount(0);
  expectCleanNetwork(net);
});

test("child first: lesson, Mina, blocked ask, Parent once, receipt, Portfolio, each returning to a contextual Home mission", async ({ page }, testInfo) => {
  const net = watch(page);
  await childSetup(page);
  await page.evaluate(() => { window.__marker = "same-document"; });

  // Lesson from the Home mission, then back Home: progress and next mission changed.
  await page.getByTestId("home-mission-go").click();
  await expect(page).toHaveURL(/\/try\/learn\/c-save$/);
  await expect(page.locator('nav[aria-label="Main"]:visible')).toHaveCount(0);
  await finishLesson(page);
  await page.getByTestId("lesson-back-home").click();
  await expect(page).toHaveURL(/\/try\/home$/);
  await expect(page.getByTestId("home-focus")).toBeVisible();
  await expect(page.getByTestId("home-more")).toHaveCount(0);
  // Dedicated nav already exposes the five destinations; Home must not duplicate it with another card grid.
  await expect(page.getByTestId("home-quick-links")).toHaveCount(0);
  await expect(page.locator('nav[aria-label="Main"]:visible').getByRole("link")).toHaveCount(5);
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "meet-person");
  await expect(page.getByTestId("home-mission")).toContainText("Meet Mina");

  // Mina's dilemma comes before any financial research.
  await page.getByTestId("home-mission-go").click();
  await expect(page).toHaveURL(/\/try\/explore\/markets$/);
  await expect(tab(page, "Explore")).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: /compare food, wages and delivery costs with sales/i }).click();
  await tab(page, "Home").click();
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "first-choice");
  await page.getByTestId("home-mission-go").click();
  await page.getByTestId("practice-this").click();
  await page.getByRole("button", { name: /a bigger choice \(25\)/i }).click();
  await page.getByLabel(/i am curious how it behaves/i).check();
  await page.getByTestId("make-choice").click();
  await expect(page.getByTestId("outcome-hero")).toContainText(/blocked by my key/i);

  // Home now points at the Parent, and previews the exact reason.
  await tab(page, "Home").click();
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "parent-deciding");
  await expect(page.getByTestId("home-parent-preview")).toContainText(/Parent decision/i);
  await expect(page.getByTestId("home-mission")).toContainText(/25 credits/i);
  await page.getByTestId("home-mission-go").click();
  await expect(page).toHaveURL(/\/try\/parent\/request$/);
  await expect(page.getByRole("navigation", { name: "Parent" })).toBeVisible();
  await expect(page.getByTestId("child-reason")).toHaveText(/i am curious how it behaves/i);
  await testInfo.attach("parent-request.png", { body: await page.screenshot(), contentType: "image/png" });
  await page.getByTestId("approve-once").click();
  await expect(page.getByTestId("parent-result")).toContainText(/key did not widen/i);

  // Back to the Child: Home says the Parent answered.
  await page.getByTestId("switch-to-child").click();
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "use-approval");
  await page.getByTestId("home-mission-go").click();
  await page.getByTestId("use-approval").click();
  await expect(page.getByTestId("receipt-line")).toContainText("25 credits");
  await tab(page, "Portfolio").click();
  await expect(page.getByTestId("portfolio-receipts")).toContainText(/parent's one-time approval/i);
  await expect(page.getByTestId("portfolio-what-if")).toBeVisible();
  await expect(page.getByTestId("portfolio-allocation")).toContainText("25 invested");
  await expect(page.getByTestId("portfolio-weights")).toContainText("100% in the largest position");
  await page.getByRole("button", { name: "A bad month" }).click();
  await expect(page.getByTestId("scenario-hypothetical")).toHaveText("22.50");
  await tab(page, "Home").click();
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "together");
  await expect(page.getByTestId("home-key")).toContainText("15 credits");

  // Together remembers Mina, then Home moves on to the next lesson.
  await page.getByTestId("home-mission-go").click();
  await page.getByRole("button", { name: /practice a small fictional choice/i }).click();
  await page.getByRole("button", { name: /answering as the parent/i }).click();
  await page.getByRole("button", { name: /agree on a small practice boundary/i }).click();
  await page.getByRole("button", { name: /mark our discussion complete/i }).click();
  await expect(page.getByTestId("together-story-memory")).toContainText("Mina");
  await expect(page.getByTestId("together-story-memory").getByRole("img", { name: /fictional Mina in her family.s grocery/i })).toBeVisible();
  await page.getByTestId("together-home").click();
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "next-lesson");
  await tab(page, "Profile").click();
  await expect(page.getByTestId("profile-wins")).toContainText(/first practice choice\s*earned/i);
  expect(await page.evaluate(() => window.__marker)).toBe("same-document");
  expectCleanNetwork(net);
});

test("Parent first: own dashboard, no identity capture, learning and Key visible, then the Child path later", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try");
  await page.getByTestId("start-as-parent").click();
  await expect(page).toHaveURL(/\/try\/parent$/);
  await expect(page.getByTestId("parent-overview-grid").locator(":scope > *")).toHaveCount(3);
  await expect(page.getByTestId("parent-overview-grid")).toContainText(/My Key/);
  const parentNav = page.getByRole("navigation", { name: "Parent" });
  await expect(parentNav.getByRole("link")).toHaveText(["Overview", "Requests", "My Key", "Learn"]);
  await expect(parentNav.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  for (const [name, url] of [["Requests", /\/parent\/request$/], ["My Key", /\/parent\/key$/], ["Learn", /\/parent\/learn$/]]) {
    await parentNav.getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
    // No sign-in, email, password or identity verification anywhere in the Parent lens.
    await expect(page.locator('input[type="email"], input[type="password"], input[autocomplete]')).toHaveCount(0);
    await expect(page.getByText(/no guardian identity|no identity is verified|simulated/i).first()).toBeVisible();
  }
  await parentNav.getByRole("link", { name: "Requests" }).click();
  await expect(page.getByTestId("parent-empty")).toBeVisible();
  await page.getByTestId("switch-to-child").click();
  await expect(page).toHaveURL(/\/try\/home$/);
  await expect(page.getByTestId("home-mission")).toHaveAttribute("data-mission", "choose-goal");
  await page.getByTestId("home-mission-go").click();
  await expect(page).toHaveURL(/\/try\/goal$/);
  expectCleanNetwork(net);
});

test("Profile can start over for a new family without a reload, and nothing carries over", async ({ page }) => {
  test.slow(); // Full reset journey: allow a busy CI desktop runner without dropping checks.
  await childSetup(page, /family trip/i);
  await page.getByTestId("home-save").click();
  await expect(page.getByTestId("home-goal-saved")).toHaveText("20/100");
  await tab(page, "Profile").click();
  await page.getByTestId("profile-reset").click();
  await expect(page).toHaveURL(/\/try$/);
  await expect(page.getByTestId("welcome-start")).toHaveText(/let's begin/i);
  await page.getByTestId("start-as-parent").click();
  await expect(page.getByTestId("goal-default-note")).toBeVisible();
});


test("lessons teach with multi-step content and an applied choice before their final recall check", async ({ page }, testInfo) => {
  const net = watch(page);
  await page.goto("/try/learn/c-save");
  await expect(page.getByTestId("lesson-slide")).toContainText("Give a dream a deadline");
  await page.getByRole("button", { name: /next idea/i }).click();
  await expect(page.getByTestId("lesson-slide")).toContainText("Keep the bike money safe");
  const exercise = page.getByTestId("lesson-applied-exercise");
  await expect(exercise).toContainText(/bike costs 60 pretend credits/i);
  await expect(page.getByRole("button", { name: /next idea/i })).toBeDisabled();
  await expect(page.getByTestId("applied-try-first")).toContainText(/choose an answer/i);
  await exercise.getByRole("button", { name: /plan to save the remaining 40/i }).click();
  await expect(page.getByTestId("applied-feedback")).toContainText(/planning gives you a number/i);
  await exercise.getByRole("button", { name: /put the bike credits into one risky company/i }).click();
  await expect(page.getByTestId("applied-feedback")).toContainText(/mercy of a price/i);
  await page.getByRole("button", { name: /next idea/i }).click();
  await expect(page.getByTestId("lesson-slide")).toContainText("Work backward from the goal");
  await expect(page.getByTestId("lesson-math-lab")).toContainText("Build your own saving plan");
  await expect(page.getByTestId("lab-savings-result")).toContainText("15 pretend credits each period");
  await page.getByRole("slider", { name: "Practice periods" }).press("ArrowLeft");
  await expect(page.getByTestId("lab-savings-result")).toContainText("20 pretend credits each period");
  await testInfo.attach("hands-on-c-save.png", { body: await page.screenshot(), contentType: "image/png" });
  await page.getByRole("button", { name: /quick check/i }).click();
  await expect(page.getByTestId("lesson-quiz")).toBeVisible();
  await testInfo.attach("lesson-substantive-scene.png", { body: await page.screenshot(), contentType: "image/png" });
  expectCleanNetwork(net);
});


test("empty Portfolio teaches real portfolio mechanics without inventing a holding or changing My Key", async ({ page }, testInfo) => {
  const net = watch(page);
  await page.goto("/try/portfolio");
  await expect(page.getByTestId("portfolio-empty")).toContainText(/no practice holdings yet/i);
  await expect(page.getByTestId("portfolio-spent")).toHaveText("0credits");
  await page.getByTestId("portfolio-example-toggle").click();
  const example = page.getByTestId("portfolio-example");
  await expect(example).toContainText(/not your holdings/i);
  await expect(example.getByRole("listitem")).toHaveCount(3);
  await example.getByRole("button", { name: /a bad month/i }).click();
  await expect(page.getByTestId("example-scenario-total")).toContainText(/60.00 invested → 49.00 scenario value/i);
  await testInfo.attach("portfolio-guided-example.png", { body: await page.screenshot(), contentType: "image/png" });
  await tab(page, "Home").click();
  await expect(page.getByTestId("home-key")).toContainText("15 credits");
  await expect(page.getByTestId("home-goal-saved")).toHaveText("0/60");
  await tab(page, "Portfolio").click();
  await expect(page.getByTestId("portfolio-empty")).toBeVisible();
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  expectCleanNetwork(net);
});


test("hands-on grocery and price-risk labs calculate consequences without changing the child's credit balance", async ({ page }, testInfo) => {
  const net = watch(page);
  for (const part of [
    { id: "c-explore", title: /mina.s grocery cover its costs/i, slider: "Delivery cost", testid: "lab-grocery-result", initial: /15 pretend credits left after costs/, changed: /25 pretend credits short after costs/ },
    { id: "c-risk", title: /what could a price drop mean/i, slider: "Hypothetical price drop", testid: "lab-risk-result", initial: /20 credits become 15.00/, changed: /20 credits become 10.00/ },
  ]) {
    await page.goto("/try/learn/" + part.id);
    await page.getByRole("button", { name: /next idea/i }).click();
    const exercise = page.getByTestId("lesson-applied-exercise");
    await expect(exercise).toBeVisible();
    await exercise.getByRole("button").first().click();
    await expect(page.getByTestId("applied-feedback")).toBeVisible();
    await page.getByRole("button", { name: /next idea/i }).click();
    await expect(page.getByTestId("lesson-math-lab")).toContainText(part.title);
    await expect(page.getByTestId(part.testid)).toContainText(part.initial);
    await page.getByRole("slider", { name: part.slider }).press("End");
    await expect(page.getByTestId(part.testid)).toContainText(part.changed);
    await testInfo.attach("hands-on-" + part.id + ".png", { body: await page.screenshot(), contentType: "image/png" });
  }
  await page.goto("/try/portfolio");
  await expect(page.getByTestId("portfolio-spent")).toContainText("0");
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  await expect(page.getByTestId("portfolio-empty")).toBeVisible();
  expectCleanNetwork(net);
});


test("real-company research is separate from fictional holdings and cannot mutate practice credits", async ({ page }, testInfo) => {
  const net = watch(page);
  await page.goto("/try/portfolio");
  await expect(page.getByTestId("portfolio-sections").getByRole("link", { name: "Fictional practice" })).toHaveAttribute("aria-current", "page");
  await page.getByTestId("portfolio-sections").getByRole("link", { name: "Real companies" }).click();
  await expect(page).toHaveURL(/\/try\/portfolio\/companies$/);
  await expect(tab(page, "Portfolio")).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("real-company-boundary")).toContainText(/no live prices, buy buttons, real balances/i);
  for (const name of ["shopify", "microsoft", "costco", "apple"]) {
    const company = page.getByTestId("real-company-" + name);
    await expect(company).toBeVisible();
    await expect(company.getByRole("link")).toHaveAttribute("href", /^https:\/\//);
    await expect(company.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
    await company.getByText("What should I check?").click();
    await expect(company).toContainText("Customers:");
  }
  await expect(page.getByRole("button", { name: /buy|invest|trade/i })).toHaveCount(0);
  await testInfo.attach("real-company-research.png", { body: await page.screenshot(), contentType: "image/png" });
  await page.getByTestId("portfolio-sections").getByRole("link", { name: "Fictional practice" }).click();
  await expect(page.getByTestId("portfolio-empty")).toBeVisible();
  await expect(page.getByTestId("portfolio-available")).toHaveText("100");
  expectCleanNetwork(net);
});

test("the expanded curriculum has 17 Child lessons and 7 Parent lessons with multiple learning steps", async ({ page }) => {
  const net = watch(page);
  await page.goto("/try/learn");
  await expect(page.getByTestId("learn-progress")).toContainText("0 of 17");
  await expect(page.getByRole("list", { name: "All Child lessons" }).getByRole("listitem")).toHaveCount(17);
  await page.getByRole("link", { name: /recognize scams and promises/i }).click();
  await expect(page).toHaveURL(/\/try\/learn\/c-scams$/);
  await expect(page.getByTestId("lesson-slide")).toContainText("Notice the pressure");
  await page.getByRole("button", { name: /next idea/i }).click();
  const exercise = page.getByTestId("lesson-applied-exercise");
  await expect(exercise).toContainText(/social message/i);
  await exercise.getByRole("button").first().click();
  await expect(page.getByTestId("applied-feedback")).toBeVisible();
  await page.goto("/try/parent/learn");
  await expect(page.getByRole("list", { name: /parent lessons/i }).getByRole("listitem")).toHaveCount(7);
  expectCleanNetwork(net);
});
