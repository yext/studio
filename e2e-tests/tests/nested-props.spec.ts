import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("renders nested props", async ({ page, studioPage }) => {
  await studioPage.addElementSection.addComponent("Banner");
  await studioPage.componentTreeSection.setActiveElement("Banner");
  await expect(page.getByTestId("EditorSidebar")).toHaveScreenshot({
    maxDiffPixelRatio: 0.015,
  });
});
