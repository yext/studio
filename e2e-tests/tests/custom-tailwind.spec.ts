import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

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

const expectedPageContents = `export default function BasicPage() {
  return <CustomTailwindButton className="bg-primary" />;
}`;

studioTest("TailwindClass prop editor", async ({ studioPage, page }) => {
  await studioPage.removeElement("div");
  await studioPage.addElement("CustomTailwindButton", "Components", false);
  await studioPage.setActiveComponent("CustomTailwindButton");
  const editorSidebar = page.getByTestId("EditorSidebar");
  await expect(editorSidebar).toHaveScreenshot();
  const classPicker = editorSidebar.getByRole("button", {
    name: "Toggle tailwind class picker",
  });
  await classPicker.click();
  await expect(editorSidebar).toHaveScreenshot();
  await editorSidebar.getByText("bg-primary").click();
  await expect(editorSidebar).toHaveScreenshot();
  await expect(studioPage.preview.locator("body")).toHaveScreenshot();
  await studioPage.saveButton.click();
  const pagePath = studioPage.getPagePath("BasicPage");
  const hasExpectedPageContents = fs
    .readFileSync(pagePath, "utf-8")
    .includes(expectedPageContents);
  expect(hasExpectedPageContents).toBeTruthy();
});
