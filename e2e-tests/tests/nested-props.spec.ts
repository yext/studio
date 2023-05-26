import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("renders nested props", async ({ page, studioPage }) => {
  await studioPage.setActiveComponent("Banner");
  await studioPage.clickPropertiesTab();
  await expect(page.getByTestId("EditorSidebar")).toHaveScreenshot();
});
