import { expect } from "@playwright/test";
import { studioTest } from "./infra/studioTest.js";
import fs from "fs";

const expectedNewPage = fs.readFileSync(
  "./tests/__fixtures__/add-element-expected-page.tsx",
  "utf-8"
);

studioTest("can add a container component", async ({ page, studioPage }) => {
  const previews = page.getByText("I'm a container:");
  await expect(previews).toHaveCount(1);
  await studioPage.addElement("Container", "Containers");
  await expect(previews).toHaveCount(2);
  await studioPage.screenshot();
  await studioPage.save();
  await expect("./src/pages/UniversalPage.tsx").toHaveContents(expectedNewPage);
});
