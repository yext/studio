import { test as base } from "@playwright/test";
import StudioPlaywrightPage from "./StudioPlaywrightPage.js";
import setup from "./setup.js";

type Fixtures = {
  /**
   * The StudioPlaywrightPage model for interacting with the page.
   */
  studioPage: StudioPlaywrightPage;
  /**
   * Whether the test branch should be pushed to the remote.
   * If true, the remote branch will be cleaned up at the end of the testrun.
   */
  createRemote: boolean;
};

/**
 * studioTest extends the base playwright test by providing a StudioPage Page Object Model,
 * and also performing setup and cleanup.
 */
export const studioTest = base.extend<Fixtures>({
  createRemote: false,
  studioPage: async ({ page, createRemote }, use, testInfo) => {
    await setup(testInfo, createRemote, async (port: number) => {
      await page.goto("localhost:" + port);
      await page.waitForLoadState("networkidle");
      const studioPage = new StudioPlaywrightPage(page, port);
      await use(studioPage);
    });
  },
});
