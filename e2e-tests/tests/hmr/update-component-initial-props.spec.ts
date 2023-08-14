import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

const updatedComponent = fs.readFileSync(
  "./tests/__fixtures__/hmr/updated-button-initial-props.tsx",
  "utf-8"
);
const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/hmr/update-button-props-expected-page.tsx",
  "utf-8"
);

studioTest.only(
  "can update initial props of a component and see UI is updated via HMR",
  async ({ page, studioPage }) => {
    const buttonPreviews = studioPage.preview.getByText("Press me!");
    await expect(buttonPreviews).toHaveCount(0);

    await studioPage.addElement("Button", "Components");
    await expect(buttonPreviews).toHaveCount(1);
    await expect(page).toHaveScreenshot();

    expect(
      await studioPage.getStringPropValue("className", "Button", 0)
    ).toEqual("px-4 py-2 text-lg border-4 border-green-500");
    await expect(page).toHaveScreenshot();

    const buttonPath = studioPage.getComponentPath("Button");
    fs.writeFileSync(buttonPath, updatedComponent);
    // Wait for the HMR to complete
    await page.waitForResponse(/Button\.tsx/, { timeout: 10000 });

    await studioPage.addElement("Button", "Components");
    await expect(buttonPreviews).toHaveCount(2);
    await expect(page).toHaveScreenshot();

    expect(
      await studioPage.getStringPropValue("className", "Button", 1)
    ).toEqual("px-4");
    await expect(page).toHaveScreenshot();

    await studioPage.saveButton.click();
    const pagePath = studioPage.getPagePath("BasicPage");
    await expect(pagePath).toHaveContents(expectedPage);
    await expect(page).toHaveScreenshot();
  }
);
