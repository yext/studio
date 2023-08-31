import { studioTest } from "./infra/studioTest.js";

studioTest("renders field picker dropdown", async ({ page, studioPage }) => {
  await studioPage.addElement("Button", "Components");
  await studioPage.setActiveComponent("Button");
  await page.getByLabel("Toggle field picker").click();
  await page.getByText("Meta").click();
  await studioPage.takePageScreenshotAfterImgRender();
  await page.setViewportSize({ width: 1000, height: 720 });
  await page.getByText("Meta").hover();
  await page.mouse.wheel(200, 0);
  await studioPage.takePageScreenshotAfterImgRender();
});
