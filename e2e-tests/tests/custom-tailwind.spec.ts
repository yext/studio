import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest.use({
  tailwindConfigPath: "tests/__fixtures__/tailwind.config.ts",
  debug: true
})

studioTest.only(
  "can display styles from a custom tailwind theme",
  async ({ studioPage }) => {
    await studioPage.removeElement("div");
    await studioPage.addElement("Button", "Components");
    await studioPage.setActiveComponent("Button");
    const classNameInput = studioPage.getPropInput("className");
    await classNameInput.clear();
    await classNameInput.type("bg-primary text-extremelyLarge");
    await expect(studioPage.preview.locator("body")).toHaveScreenshot();
  }
);
