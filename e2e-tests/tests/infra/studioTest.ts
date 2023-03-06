import { test as base, expect, TestInfo } from "@playwright/test";
import StudioPlaywrightPage from "./StudioPlaywrightPage.js";
import fs from "fs";
import path from "path";

type Fixtures = {
  studioPage: StudioPlaywrightPage;
};

const initialState = {
  pages: Object.fromEntries(
    fs.readdirSync("./src/pages", "utf-8").map((pagepath) => {
      const pathFromRoot = path.join("./src/pages", pagepath);
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
    await page.reload();
    const studioPage = new StudioPlaywrightPage(page);
    // Run the test.
    console.log('running test')
    await use(studioPage);
    console.log('screenshot')
    expect(page).toMatchSnapshot();
    fs.readdirSync("./src/pages", "utf-8").forEach((pagepath) => {
      const pathFromRoot = path.join("./src/pages", pagepath);
      console.log('unlinking', pathFromRoot)
      fs.unlinkSync(pathFromRoot);
    });
    Object.entries(initialState.pages).forEach(([pathFromRoot, contents]) => {
      console.log('rewriting', pathFromRoot)
      fs.writeFileSync(pathFromRoot, contents);
    });
  },
});
