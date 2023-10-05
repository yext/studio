import { studioTest } from "./infra/studioTest.js";

studioTest("can set and reset Viewport", async ({ studioPage }) => {
  await studioPage.switchPage("LocationPage");
  const viewportMenuSection = studioPage.viewportMenuSection;

  await viewportMenuSection.toggleViewportMenu();
  await viewportMenuSection.takeScreenshot();
  await viewportMenuSection.setViewport("Galaxy Z Flip5 Folded");
  await viewportMenuSection.toggleViewportMenu();
  await viewportMenuSection.takeScreenshot();
  await viewportMenuSection.setViewport("Reset Viewport");
  await viewportMenuSection.toggleViewportMenu();
  await viewportMenuSection.takeScreenshot();
});
