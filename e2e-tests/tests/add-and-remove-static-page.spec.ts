import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-and-remove-static-page-expected-page.tsx",
  "utf-8"
);

studioTest(
  "can remove a page and then add it back",
  async ({ page, studioPage }) => {
    const pageInTree = page.getByText("BasicPage");
    await expect(pageInTree).toHaveCount(1);
    await studioPage.removePage("BasicPage");
    await expect(pageInTree).toHaveCount(0);
    await studioPage.saveButton.click();
    const pagePath = studioPage.getPagePath("BasicPage");
    expect(fs.existsSync(pagePath)).toBeFalsy();
    await expect(page).toHaveScreenshot();

    // Ensure that the page is still deleted after a browser refresh.
    await page.reload();
    await expect(page).toHaveScreenshot();

    await expect(pageInTree).toHaveCount(0);
    await studioPage.addStaticPage("BasicPage", "index.html");
    await expect(pageInTree).toHaveCount(1);
    await expect(page).toHaveScreenshot();
    await studioPage.saveButton.click();
    await expect(pagePath).toHaveContents(expectedPage);
    await expect(page).toHaveScreenshot();
  }
);
