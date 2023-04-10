import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest.use({
  createRemote: true,
});

studioTest("can deploy changes", async ({ page, studioPage }) => {
  await studioPage.addElement("Container", "Containers");
  await expect(page).toHaveScreenshot();
  await studioPage.deployButton.click();
  await expect(page).toHaveScreenshot();
});
