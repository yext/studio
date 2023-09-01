import { studioTest } from "./infra/studioTest.js";

studioTest("renders undefined menu button", async ({ page, studioPage }) => {
  await studioPage.setActiveComponent("Banner");
  await page.getByLabel("Toggle undefined value menu").first().click();
  await studioPage.takePageScreenshotAfterImgRender();
});
