import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest("renders nested props", async ({ page, studioPage }) => {
  await studioPage.addElementSection.addComponent("Banner");
  await studioPage.componentTreeSection.setActiveElement("Banner");

  const editorSidebar = page.getByTestId("EditorSidebar");
  const expectScreenshot = async () =>
    await expect(editorSidebar).toHaveScreenshot({
      maxDiffPixelRatio: 0.015,
    });
  await expectScreenshot();

  await editorSidebar.getByTestId("prop-tooltip").hover();
  await expectScreenshot();
});
