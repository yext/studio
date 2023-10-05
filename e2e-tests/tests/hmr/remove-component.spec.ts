import { expect } from "@playwright/test";
import { studioTest } from "../infra/studioTest.js";
import fs from "fs";

studioTest("HMR for removing a component", async ({ studioPage }) => {
  const addElementLocator =
    studioPage.componentTreeSection.getElement("Banner");
  await expect(addElementLocator).toHaveCount(1);
  fs.rmSync(studioPage.getComponentPath("Banner"));
  await expect(addElementLocator).toHaveCount(0);
});
