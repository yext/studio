import { test as base } from "@playwright/test";
import StudioPlaywrightPage from "./StudioPlaywrightPage.js";
import fs from "fs";
import path from "path";

type Fixtures = {
  studioPage: StudioPlaywrightPage;
};

const initialState = {
  pages: getInitialDirState("./src/pages"),
  components: getInitialDirState("./src/components"),
};

function getInitialDirState(dirPath: string) {
  return Object.fromEntries(
    fs.readdirSync(dirPath, "utf-8").map((filename) => {
      const pathFromRoot = path.join(dirPath, filename);
      return [pathFromRoot, fs.readFileSync(pathFromRoot, "utf-8")];
    })
  );
}

/**
 * studioTest extends the base playwright test by providing a StudioPage Page Object Model,
 * and also performing setup and cleanup.
 */
export const studioTest = base.extend<Fixtures>({
  studioPage: async ({ page }, use) => {
    try {
      await page.goto("./");
      const studioPage = new StudioPlaywrightPage(page);
      // Run the test.
      await use(studioPage);
    } finally {
      unlinkDir("./src/pages");
      unlinkDir("./src/components");
      Object.values(initialState).forEach((slice) =>
        Object.entries(slice).forEach(([pathFromRoot, contents]) =>
          fs.writeFileSync(pathFromRoot, contents)
        )
      );
    }
  },
});

function unlinkDir(dirPath: string) {
  fs.readdirSync(dirPath, "utf-8").forEach((filename) => {
    const pathFromRoot = path.join(dirPath, filename);
    fs.unlinkSync(pathFromRoot);
  });
}
