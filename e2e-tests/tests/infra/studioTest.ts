import { test as base } from "@playwright/test";
import StudioPlaywrightPage from "./StudioPlaywrightPage.js";
import setupAcceptance from "./setupAcceptance.js";

export type StudioTestFixtures = {
  /**
   * The StudioPlaywrightPage model for interacting with the page.
   */
  studioPage: StudioPlaywrightPage;
  /**
   * Whether the test branch should be pushed to the remote.
   * If true, the remote branch will be cleaned up at the end of the testrun.
   */
  createRemote: boolean;
  /** Flag to turn on logging and prevent cleanup of temp folders. */
  debug: boolean;
};

/**
 * studioTest extends the base playwright test by providing a StudioPage Page Object Model,
 * and also performing setup and cleanup.
 */
export const studioTest = base.extend<StudioTestFixtures>({
  createRemote: false,
  debug: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  studioPage: async ({ page, createRemote, debug }, use, testInfo) => {
    const opts = { createRemote, debug, testInfo };
    await setupAcceptance(opts, async (port: number, tmpDir: string) => {
      await page.goto("localhost:" + port);
      await page.waitForLoadState("networkidle");
      const studioPage = new StudioPlaywrightPage(page, tmpDir);
      await use(studioPage);
    });
  },
});
