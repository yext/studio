import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest.only("renders nested props", async ({ page, studioPage }) => {
  await studioPage.addElement("Banner", "Components");
  await studioPage.setActiveComponent("Banner");
  await expect(page.getByTestId("EditorSidebar")).toHaveScreenshot({
    maxDiffPixelRatio: 0.015,
  });
});
