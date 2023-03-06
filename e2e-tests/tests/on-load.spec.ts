import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("page appears as expected on load", async ({ studioPage }) => {
  console.log('on-load')
  await expect(studioPage.saveButton).toBeDisabled();
});
