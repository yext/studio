import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("page appears as expected on load", async ({ page, studioPage }) => {
  await expect(studioPage.saveButton).toBeDisabled();
  await expect(page).toHaveScreenshot();
});
