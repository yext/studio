// import { studioTest } from "./infra/studioTest.js";
// import { expect } from "@playwright/test";

// studioTest("can create new nested modules", async ({ page, studioPage }) => {
//   await studioPage.setActiveComponent("Banner");
//   await studioPage.createModule("InnerModule");

//   const innerModuleLocator = studioPage.componentTree.getByText("InnerModule");
//   await expect(innerModuleLocator).toHaveCount(1);
//   await expect(page).toHaveScreenshot();

//   await studioPage.setActiveComponent("Container");
//   await studioPage.createModule("OuterModule");

//   const outerModuleLocator = studioPage.componentTree.getByText("OuterModule");
//   await expect(outerModuleLocator).toHaveCount(1);
//   await expect(innerModuleLocator).toHaveCount(0);
//   await expect(page).toHaveScreenshot();

//   await studioPage.saveButton.click();
//   await expect(page).toHaveScreenshot();
//   await page.reload();
//   await expect(outerModuleLocator).toHaveCount(1);
//   await expect(innerModuleLocator).toHaveCount(0);
//   await expect(page).toHaveScreenshot();
// });
