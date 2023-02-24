import { test as base, expect } from "@playwright/test";
import StudioPlaywrightPage from "./StudioPlaywrightPage.js";
import fs from "fs";
import path from "path";

type Fixtures = {
  studioPage: StudioPlaywrightPage;
};

const initialState = {
  pages: Object.fromEntries(
    fs.readdirSync("./src/pages", "utf-8").map((filepath) => {
      const pathFromRoot = path.join("./src/pages", filepath);
      return [pathFromRoot, fs.readFileSync(pathFromRoot, "utf-8")];
    })
  ),
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
    Object.entries(initialState.pages).forEach(([pathFromRoot, contents]) => {
      fs.writeFileSync(pathFromRoot, contents);
    });
  },
});
