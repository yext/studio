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

studioTest(
  "can update initial props of a component and see UI is updated via HMR",
  async ({ page, studioPage }) => {
    const buttonPreviews = page.getByText("Press me!");
    await expect(buttonPreviews).toHaveCount(0);

    await studioPage.addElement("Button", "Components");
    await expect(buttonPreviews).toHaveCount(1);
    await expect(page).toHaveScreenshot();

    expect(
      await studioPage.getComponentStringPropValue("className", "Button", 0)
    ).toEqual("px-2");
    await expect(page).toHaveScreenshot();

    fs.writeFileSync("./src/components/Button.tsx", updatedComponent);

    await studioPage.addElement("Button", "Components");
    await expect(buttonPreviews).toHaveCount(2);
    await expect(page).toHaveScreenshot();

    expect(
      await studioPage.getComponentStringPropValue("className", "Button", 1)
    ).toEqual("px-4");
    await expect(page).toHaveScreenshot();

    await studioPage.save();
    await expect("./src/pages/UniversalPage.tsx").toHaveContents(expectedPage);
    await expect(page).toHaveScreenshot();
  }
);
