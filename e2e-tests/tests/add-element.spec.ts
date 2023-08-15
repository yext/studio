import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-element-expected-page.tsx",
  "utf-8"
);

const waitForImageLoad = async () => {
  await new Promise((r) => setTimeout(r, 500));
};

studioTest("can add a Footer component", async ({ page, studioPage }) => {
  await studioPage.switchPage("LocationPage");
  await waitForImageLoad();
  await studioPage.addElement("Footer", "Components");
  const previews = studioPage.preview.getByText("© 2023 Yext");
  await expect(previews).toHaveCount(1);
  await expect(page).toHaveScreenshot();
  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("LocationPage");
  await expect(pagePath).toHaveContents(expectedPage);
  await expect(page).toHaveScreenshot();
});
