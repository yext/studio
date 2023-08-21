import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";

studioTest.use({
  tailwindConfigPath: "tests/__fixtures__/tailwind.config.ts",
});

studioTest(
  "can display styles from a custom tailwind theme",
  async ({ studioPage }) => {
    await studioPage.removeElement("div");
    await studioPage.addElement("Button", "Components", false);
    await studioPage.setActiveComponent("Button");
    const classNameInput = studioPage.getPropInput("className");
    await classNameInput.clear();
    const safelistedClasses = "bg-primary text-extremelyLarge ";
    const builtInTailwindClasses =
      "text-teal-300 line-through shadow-lg shadow-cyan-500/50";
    await classNameInput.type(safelistedClasses + builtInTailwindClasses);
    await expect(studioPage.preview.locator("body")).toHaveScreenshot();
  }
);
