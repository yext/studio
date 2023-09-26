import { studioTest } from "./infra/studioTest.js";

studioTest("can set and reset Viewport", async ({ studioPage }) => {
  await studioPage.switchPage("LocationPage");
  await studioPage.openViewportMenu();
  await studioPage.takePageScreenshotAfterImgRender();
  await studioPage.setViewport("Galaxy Z Flip5 Folded");
  await studioPage.openViewportMenu();
  await studioPage.takePageScreenshotAfterImgRender();
  await studioPage.setViewport("Reset Viewport");
  await studioPage.openViewportMenu();
  await studioPage.takePageScreenshotAfterImgRender();
});
