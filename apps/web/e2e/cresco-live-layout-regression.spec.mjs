import { test, expect } from "@playwright/test";

// Visual-layout regressions found from a real read-only Cloudflare browser QA.
test("desktop hero example cards anchor inside the family scene", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const stage = page.locator(".cresco-story-stage").first();
  const cards = stage.locator(":scope > .cresco-demo-card");
  await expect(cards).toHaveCount(2);
  expect(await cards.nth(0).evaluate((node) => getComputedStyle(node).position)).toBe("absolute");
  expect(await cards.nth(1).evaluate((node) => getComputedStyle(node).position)).toBe("absolute");
  const scene = await stage.boundingBox();
  const rule = await cards.nth(0).boundingBox();
  const request = await cards.nth(1).boundingBox();
  expect(scene && rule && request).toBeTruthy();
  expect(request.x).toBeGreaterThan(rule.x + 130);
  expect(request.y).toBeGreaterThan(rule.y + 130);
  expect(request.x + request.width).toBeLessThanOrEqual(scene.x + scene.width + 3);
  expect(request.y + request.height).toBeLessThanOrEqual(scene.y + scene.height + 3);
});

test("mobile CRESCO navigation exposes all settings without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByText("Explore CRESCO", { exact: true })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "CRESCO mobile navigation" });
  await expect(nav).toBeHidden();
  await page.locator("summary").filter({ hasText: "Explore CRESCO" }).click();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Delegated capital" })).toHaveAttribute("href", "/worlds-fair/desk?case=capital");
  await expect(nav.getByRole("link", { name: "Parent sign-in" })).toHaveAttribute("href", "/parent/sign-in");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
});

test("role story portrait is framed inside the live desk without privileged actions", async ({ page }) => {
  await page.goto("/worlds-fair/desk");
  const portrait = page.getByRole("img", { name: /illustrated parent reviewing a CRESCO request/i });
  await expect(portrait).toBeVisible();
  const face = portrait.locator('path[d^="M236 59c3-23"]');
  await expect(face).toHaveCount(1);
  const svgBox = await portrait.boundingBox();
  const faceBox = await face.boundingBox();
  expect(svgBox && faceBox).toBeTruthy();
  // The facial features must stay within the image frame after the new pose is applied.
  expect(faceBox.x).toBeGreaterThanOrEqual(svgBox.x);
  expect(faceBox.x + faceBox.width).toBeLessThan(svgBox.x + svgBox.width - 7);
  expect(faceBox.y).toBeGreaterThan(svgBox.y);
  expect(faceBox.y + faceBox.height).toBeLessThan(svgBox.y + svgBox.height);
});
