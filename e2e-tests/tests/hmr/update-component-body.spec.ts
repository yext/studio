import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

const updatedComponent = fs.readFileSync(
  "./tests/__fixtures__/hmr/updated-button-body.tsx",
  "utf-8"
);

studioTest(
  "can update the body of a component and see it updated via HMR",
  async ({ page, studioPage }) => {
    await studioPage.componentTreeSection.removeElement("Container");
    const updatedButtonPreviews = studioPage.preview.getByText(
      "this is the updated component body"
    );
    await expect(updatedButtonPreviews).toHaveCount(0);

    await studioPage.addElementSection.addComponent("Button");
    await expect(updatedButtonPreviews).toHaveCount(0);
    await studioPage.takePreviewScreenshotAfterImgRender();

    const buttonPath = studioPage.getComponentPath("Button");
    fs.writeFileSync(buttonPath, updatedComponent);
    // Wait for the HMR to complete
    await page.waitForResponse(/Button\.tsx/, { timeout: 5000 });
    await expect(updatedButtonPreviews).toHaveCount(1);
    await studioPage.takePreviewScreenshotAfterImgRender();
  }
);
