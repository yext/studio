import { test, expect } from "@playwright/test";

test("can add a new page", async ({ page }) => {
  await page.goto("./");

  const newPageInTree = page.getByText("MyNewPage");
  const saveToFileButton = page.getByRole("button", {
    exact: true,
    name: "Save to file",
  });

  await expect.poll(() => newPageInTree.count()).toBe(0);
  await expect(saveToFileButton).toBeDisabled();

  await page
    .getByRole("button", {
      exact: true,
      name: "Add Page",
    })
    .click();

  const modal = page.getByRole("dialog", {
    exact: true,
    name: "Add Page Modal",
  });

  await modal.getByRole("textbox").type("My New Page");
  await modal.getByText("Save").click();

  await expect.poll(() => newPageInTree.count()).toBe(1);
  await expect(saveToFileButton).toBeEnabled();
});