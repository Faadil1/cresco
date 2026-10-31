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
async function finishLesson(page) {
  while (await page.getByRole("button", { name: /next idea/i }).count()) await page.getByRole("button", { name: /next idea/i }).click();
  await page.getByRole("button", { name: /quick check/i }).click();
  await answerUntilCorrect(page, "[data-testid=lesson-quiz]");
  await page.getByRole("button", { name: /complete lesson/i }).click();
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
  await page.getByRole("button", { name: "Food & shopping" }).click();
  await page.getByRole("button", { name: /set aside 20 credits/i }).click();
  await expect(page.getByTestId("goal-progress")).toContainText("20 of 80");
  await page.getByRole("link", { name: /my learning path/i }).last().click();

  // Chapter 2: the lesson starts where the goal needs it, with a goal note, and quiz feedback is real.
  await expect(page).toHaveURL(/\/try\/learn$/);
  await expect(page.getByTestId("learn-progress")).toContainText("0 of 9");
  await page.getByTestId("learn-up-next").click();
  await expect(page).toHaveURL(/\/try\/learn\/original-why-prices-move$/);
  await expect(page.getByTestId("goal-note")).toContainText(/gaming setup/i);
  await expect(page.getByTestId("lesson-slide").locator("svg").first()).toBeVisible();
  while (await page.getByRole("button", { name: /next idea/i }).count()) await page.getByRole("button", { name: /next idea/i }).click();
  await page.getByRole("button", { name: /quick check/i }).click();
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
  await expect(page.getByTestId("learn-progress")).toContainText("0 of 9");
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
  await page.getByRole("button", { name: "Food & shopping" }).click();
  await page.getByRole("button", { name: /set aside 20 credits/i }).click();
  await page.getByRole("link", { name: /my learning path/i }).last().click();
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
  await page.getByTestId("portfolio-details").locator("summary").click();
  await expect(page.getByText(/PRACTICE ONLY - NOT EXECUTED ONCHAIN/i).first()).toBeVisible();

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
  await expect(page.getByText(/1 of 5 Parent lessons done/i)).toBeVisible();
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
  for (const path of ["/try/explore/nope", "/try/explore/ORCHARD", "/try/learn/unknown", "/try/api", "/try/parent/sign-in", "/try/wallet", "/home", "/parent/sign-in", "/onboarding/goal", "/invest/ORC", "/api/health"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
  for (const path of ["/", "/try", "/try/goal", "/try/learn", "/try/learn/c-save", "/try/explore", "/try/explore/basket", "/try/decision", "/try/parent", "/try/parent/learn", "/try/parent/key", "/try/parent/request", "/try/outcome", "/try/together", "/try/lab"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test("the story is reachable and readable without horizontal scroll or hidden chapters", async ({ page }) => {
  for (const path of ["/try", "/try/goal", "/try/learn", "/try/explore", "/try/decision", "/try/parent", "/try/outcome", "/try/together"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} horizontal overflow`).toBeLessThanOrEqual(1);
    await expect(page.getByRole("main")).toBeVisible();
    if (path !== "/try") {
      await expect(page.getByTestId("story-rail")).toBeInViewport();
      await expect(page.getByRole("navigation", { name: "Story chapters" }).getByRole("link")).toHaveCount(7);
    }
  }
  await page.goto("/try/goal");
  const menu = page.locator("summary[aria-label='All chapters']");
  if (await menu.isVisible()) {
    await menu.click();
    const nav = page.getByRole("navigation", { name: "All chapters" });
    for (const label of ["Welcome", "My goal", "My learning path", "Explore", "Make a choice", "Parent's moment", "What happened", "Together"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: /free practice lab/i })).toBeVisible();
    // Choosing a chapter from the menu navigates and closes the sheet.
    await nav.getByRole("link", { name: "Explore", exact: true }).click();
    await expect(page).toHaveURL(/\/try\/explore$/);
    await expect(page.locator("details:has(summary[aria-label='All chapters'])")).not.toHaveAttribute("open", "");
    await expect(page.getByRole("navigation", { name: "All chapters" })).toBeHidden();
    await expect(page.getByRole("heading", { level: 1, name: /investigate before you decide/i })).toBeInViewport();
  } else {
    for (const label of ["Goal", "Learn", "Explore", "Choose", "Parent", "Result", "Together"]) {
      await expect(page.getByTestId("story-rail").getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  }
});

test("landing leads into the story, with the free lab still available", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /try cresco - no sign-in/i }).click();
  await expect(page).toHaveURL(/\/try$/);
  await expect(page.getByTestId("welcome-chapters").getByRole("link")).toHaveCount(7);
  await page.goto("/try/lab");
  await expect(page.getByTestId("family-public-studio")).toBeVisible();
  await page.getByRole("link", { name: /take the illustrated story/i }).click();
  await expect(page).toHaveURL(/\/try$/);
});

test("the lab and the story share one practice state", async ({ page }) => {
  await page.goto("/try/goal");
  await page.getByRole("radio", { name: /family trip/i }).click();
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
  await expect(page.getByTestId("lesson-feedback")).toContainText(/correct/i);
  await page.getByRole("link", { name: /back to the parent/i }).click();
  await expect(page.getByText(/1 of 5 Parent lessons done/i)).toBeVisible();
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
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: /set aside 20 credits/i }).click();
  await expect(page.getByTestId("goal-progress")).toContainText("0 still available");
  await expect(page.getByRole("button", { name: /set aside 20 credits/i })).toBeDisabled();
  await page.getByRole("link", { name: /explore companies|my learning path/i }).last().click();
  await page.getByRole("link", { name: /explore companies/i }).last().click();
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
  await expect(chapterNav.getByRole("link", { name: "My learning path" })).toHaveCount(0);
  await page.getByRole("radio", { name: /family trip/i }).click();
  await expect(page.getByTestId("goal-result")).toContainText(/family trip/i);
  await expect(chapterNav.getByRole("link", { name: "My learning path" })).toBeVisible();
  await chapterNav.getByRole("link", { name: "My learning path" }).click();
  await expect(page).toHaveURL(/\/try\/learn$/);
  await expect(page.getByRole("heading", { level: 1, name: /learn, one small step at a time/i })).toBeVisible();
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
  expectCleanNetwork(net);
});
