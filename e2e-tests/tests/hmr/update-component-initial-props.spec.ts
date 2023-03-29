import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

const updatedComponent = fs.readFileSync(
  "./tests/__fixtures__/hmr-updated-component-initial-props.tsx",
  "utf-8"
);
const expectedPage = fs.readFileSync(
  "./tests/__fixtures__/hmr-component-expected-page.tsx",
  "utf-8"
);

studioTest(
  "can update initial props of a component and see UI is updated via HMR",
  async ({ page, studioPage }) => {
    const num0Previews = page.getByText("0");
    const num1Previews = page.getByText("1");
    const num5Previews = page.getByText("5");
    const falsePreviews = page.getByText("false");
    const truePreviews = page.getByText("true");
    const titlePreviews = page.getByText("initial title");

    await expect(num0Previews).toHaveCount(1);
    await expect(falsePreviews).toHaveCount(1);
    await expect(titlePreviews).toHaveCount(0);
    await expect(truePreviews).toHaveCount(0);
    await expect(num5Previews).toHaveCount(0);
    await expect(num1Previews).toHaveCount(0);

    await studioPage.addElement("Banner", "Components");
    await expect(num0Previews).toHaveCount(1);
    await expect(falsePreviews).toHaveCount(1);
    await expect(titlePreviews).toHaveCount(1);
    await expect(truePreviews).toHaveCount(1);
    await expect(num5Previews).toHaveCount(1);
    await expect(num1Previews).toHaveCount(0);
    await expect(page).toHaveScreenshot();

    fs.writeFileSync("./src/components/Banner.tsx", updatedComponent);

    await studioPage.addElement("Banner", "Components");
    await expect(num0Previews).toHaveCount(1);
    await expect(falsePreviews).toHaveCount(2);
    await expect(titlePreviews).toHaveCount(1);
    await expect(truePreviews).toHaveCount(1);
    await expect(num5Previews).toHaveCount(1);
    await expect(num1Previews).toHaveCount(1);
    await expect(page).toHaveScreenshot();

    await studioPage.save();
    await expect("./src/pages/UniversalPage.tsx").toHaveContents(expectedPage);
    await expect(page).toHaveScreenshot();
  }
);
