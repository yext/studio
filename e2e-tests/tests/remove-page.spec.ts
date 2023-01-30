import { test, expect } from "@playwright/test";

test("can remove a page", async ({ page }) => {
  await page.goto("./");

  const newPageInTree = page.getByText("UniversalPage");
  const saveToFileButton = page.getByRole("button", {
    exact: true,
    name: "Save to file",
  });

  await expect.poll(() => newPageInTree.count()).toBe(1);
  await expect(saveToFileButton).toBeDisabled();

  await page
    .locator("li", {
      has: newPageInTree,
    })
    .getByRole("button", {
      exact: true,
      name: "Remove Page",
    })
    .click();
  await page.getByText("Delete", { exact: true }).click();

  await expect.poll(() => newPageInTree.count()).toBe(0);
  await expect(saveToFileButton).toBeEnabled();
});
