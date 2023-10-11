import { studioTest } from "./infra/studioTest.js";

studioTest("can-collapse-sidebars", async ({ page, studioPage }) => {
  const leftSidebar = page.getByLabel("Collapse left sidebar");
  const rightSidebar = page.getByLabel("Collapse right sidebar");
  await leftSidebar.click();
  await rightSidebar.click();
  await studioPage.takePageScreenshotAfterImgRender();
});
