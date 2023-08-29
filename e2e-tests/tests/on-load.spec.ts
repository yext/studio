import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest.only("page appears as expected on load", async ({ page, studioPage }) => {
  await expect(studioPage.saveButton.button).toBeDisabled();
  await expect(page).toHaveScreenshot();
});
