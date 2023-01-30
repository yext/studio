import { test, expect } from "@playwright/test";

test("can remove a page", async ({ page }) => {
  await page.goto("./");

  const pageInTree = page.getByText("UniversalPage");
  const saveToFileButton = page.getByRole("button", {
    exact: true,
    name: "Commit Changes to Repository",
  });

  await expect.poll(() => pageInTree.count()).toBe(1);
  await expect(saveToFileButton).toBeDisabled();

  await page
    .locator("li", {
      has: pageInTree,
    })
    .getByRole("button", {
      exact: true,
      name: "Remove Page",
    })
    .click();
  await page.getByText("Delete", { exact: true }).click();

  await expect.poll(() => pageInTree.count()).toBe(0);
  await expect(saveToFileButton).toBeEnabled();
});
