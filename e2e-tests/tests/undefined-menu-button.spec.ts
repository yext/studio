import { studioTest } from "./infra/studioTest.js";

studioTest("renders undefined menu button", async ({ page, studioPage }) => {
  await studioPage.componentTreeSection.setActiveElement("Banner");
  await page.getByLabel("Toggle undefined value menu").first().click();
  await studioPage.takePageScreenshotAfterImgRender();
});
