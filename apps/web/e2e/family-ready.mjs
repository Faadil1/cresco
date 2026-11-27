import { expect } from "@playwright/test";
// Wait until the in-memory Family app has hydrated after a full page load.
// Server-rendered buttons are visible earlier but do nothing until React attaches.
export function waitForFamilyReady(test) {
  test.beforeEach(async ({ page }) => {
    for (const method of ["goto", "reload"]) {
      const original = page[method].bind(page);
      page[method] = async (...args) => {
        const response = await original(...args);
        if (new URL(page.url()).pathname.startsWith("/try")) {
          await page.waitForFunction(() => document.documentElement.dataset.familyReady === "1");
        }
        return response;
      };
    }
  });
}

// On phones the real-company lab shows one step at a time. Open step n the way a
// child would (tap its heading). On desktop every step is open and the toggle
// is hidden, so this does nothing.
export async function openRealStep(page, n) {
  await page.getByTestId("real-companies-screen").waitFor();
  const toggle = page.getByTestId(`step-toggle-${n}`);
  if (await toggle.isVisible() && (await toggle.getAttribute("aria-expanded")) === "false") await toggle.click();
}

// Real companies ask "why would you choose it?" before a paper buy (issue #130 P2).
export async function chooseReason(page, name = /many people|schools and businesses|members come back|many shops/i) {
  await openRealStep(page, 1);
  await page.getByTestId("real-reason").getByRole("button", { name }).click();
  await page.getByTestId("real-reason-feedback").waitFor();
}

// Work through any interactive lesson the way a child would: answer each
// activity (trying groups/values until correct), then the check. Used by #132.
export async function completeInteractiveLesson(page, { expectWrongFirst = true } = {}) {
  const next = () => page.getByRole("button", { name: /next idea|quick check/i });
  for (let guard = 0; guard < 8; guard++) {
    if (await page.getByTestId("lesson-quiz").isVisible()) break;
    await expect(next()).toBeDisabled();
    if (await page.getByTestId("beat-decide").isVisible()) {
      await page.getByTestId("beat-decide").getByRole("button").first().click();
      await expect(page.getByTestId("decision-consequence")).toBeVisible();
    } else if (await page.getByTestId("beat-sort").isVisible()) {
      for (const item of await page.getByTestId("beat-sort").locator("li[data-testid^=sort-item-]").all()) {
        for (const bucket of await item.getByRole("button").all()) {
          if ((await item.getAttribute("data-state")) === "right") break;
          await bucket.click();
        }
        await expect(item).toHaveAttribute("data-state", "right");
      }
    } else if (await page.getByTestId("beat-allocate").isVisible()) {
      const allocate = page.getByTestId("beat-allocate");
      for (let i = 0; i < 30 && await page.getByTestId("allocate-met").count() === 0; i++) {
        const problems = await page.getByTestId("allocate-problems").innerText();
        const needs = /(.+) needs at least/.exec(problems);
        const over = /(.+) is more than/.exec(problems);
        if (needs) await page.getByRole("button", { name: `More for ${needs[1].trim()}` }).click();
        else if (over) await page.getByRole("button", { name: `Less for ${over[1].trim()}` }).click();
        else if (/still to place/.test(problems)) await allocate.getByRole("button", { name: /^More for/ }).last().click();
        else await allocate.getByRole("button", { name: /^Less for/ }).last().click();
      }
      await expect(page.getByTestId("allocate-met")).toBeVisible();
    } else if (await page.getByTestId("beat-lab").isVisible()) {
      const lab = page.getByTestId("beat-lab");
      await lab.getByRole("slider").fill({ savings: "8", drop: "25", fees: "3", profit: "100", grocery: "35" }[await lab.getAttribute("data-lab")]);
      await expect(page.getByTestId("lab-goal-met")).toBeVisible();
    }
    await expect(next()).toBeEnabled();
    await next().click();
  }
  const quiz = page.getByTestId("lesson-quiz");
  const complete = page.getByRole("button", { name: /complete lesson/i });
  const choices = await quiz.getByRole("button").all();
  let sawWrong = false;
  for (const choice of choices) {
    await choice.click();
    if (await page.getByTestId("lesson-feedback").getByText(/^correct/i).count()) break;
    sawWrong = true;
    await expect(page.getByTestId("lesson-feedback")).toContainText(/hint/i);
    await expect(complete).toBeDisabled();
  }
  if (expectWrongFirst && !sawWrong) {
    // The first option was right: still prove a wrong answer is explained and blocks completion.
    await choices[choices.length - 1].click();
    await expect(page.getByTestId("lesson-feedback")).toContainText(/hint/i);
    await expect(complete).toBeDisabled();
    for (const choice of choices) {
      await choice.click();
      if (await page.getByTestId("lesson-feedback").getByText(/^correct/i).count()) break;
    }
  }
  await complete.click();
  await expect(page.getByTestId("lesson-done")).toBeVisible();
}
