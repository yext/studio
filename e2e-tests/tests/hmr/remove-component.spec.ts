import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

studioTest("HMR for removing a component", async ({ studioPage }) => {
  const componentTreeSection = studioPage.componentTreeSection;
  const addElementLocator = componentTreeSection.getElement("Banner");
  await expect(addElementLocator).toHaveCount(1);
  await componentTreeSection.takeScreenshot();

  fs.rmSync(studioPage.getComponentPath("Banner"));
  await expect(addElementLocator).toHaveCount(0);
  await componentTreeSection.takeScreenshot();
});
