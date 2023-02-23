import { test as base, expect } from "@playwright/test";
import StudioPlaywrightPage from "./StudioPlaywrightPage.js";

type Fixtures = {
  studioPage: StudioPlaywrightPage;
};

/**
 * studioTest extends the base playwright test by providing a StudioPage Page Object Model,
 * and also performing setup and cleanup.
 */
export const studioTest = base.extend<Fixtures>({
  studioPage: async ({ page }, use) => {
    await page.goto("./");
    const studioPage = new StudioPlaywrightPage(page);
    // Run the test.
    await use(studioPage);
    await expect(page).toHaveScreenshot();
  },
});
