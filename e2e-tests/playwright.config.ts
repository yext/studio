import { PlaywrightTestConfig, expect } from "@playwright/test";
import fs from "fs";

expect.extend({
  async toHaveContents(filepath: string, expectedContents: string) {
    await expect
      .poll(() => {
        if (fs.existsSync(filepath)) {
          return fs.readFileSync(filepath, "utf-8").trim();
        }
      })
      .toBe(expectedContents.trim());

    return {
      pass: true,
    };
  },
});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: "./tests",
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  snapshotPathTemplate: "__screenshots__/{testFilePath}/{arg}{ext}",
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
    toHaveScreenshot: {
      threshold: 0.005,
      maxDiffPixelRatio: 0.005,
    },
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallellism since tests may manipulate the filesystem. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    video: "on",
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npx studio",
    port: 5173,
  },
};

export default config;
