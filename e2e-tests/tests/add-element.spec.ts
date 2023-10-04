import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/add-element-expected-page.tsx",
  "utf-8"
);

studioTest("can add a Footer component", async ({ studioPage }) => {
  await studioPage.switchPage("LocationPage");

  const addElementSection = studioPage.addElementSection;
  await addElementSection.toggleAddElementMenu();
  await addElementSection.takeScreenshot();
  await addElementSection.addComponent("Footer");
  
  const previews = studioPage.preview.getByText("© 2023 Yext");
  await expect(previews).toHaveCount(1);
  await studioPage.takePageScreenshotAfterImgRender();
  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("LocationPage");
  await expect(pagePath).toHaveContents(expectedPage);
  await studioPage.takePageScreenshotAfterImgRender();
});
