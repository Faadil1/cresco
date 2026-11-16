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
