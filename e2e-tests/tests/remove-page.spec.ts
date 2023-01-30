import { test, expect } from "@playwright/test";

test("can remove a page", async ({ page }) => {
  await page.goto("./");

  const newPageInTree = page.getByText("MyNewPage");
  await expect.poll(() => newPageInTree.count()).toBe(0);

  await page
    .getByRole("button", {
      exact: true,
      name: "Add Page",
    })
    .click();
  await page.getByRole("textbox").type("My New Page");
  await page
    .getByRole("dialog", {
      exact: true,
      name: "Add Page Modal",
    })
    .getByText("Save")
    .click();

  await expect.poll(() => newPageInTree.count()).toBe(1);

  await page
    .locator(
      "li",
      {
        has: newPageInTree
      }
    )
    .getByRole("button", {
      exact: true,
      name: "Remove Page",
    })
    .click();
  await page.getByText("Delete", { exact: true }).click();

  await expect.poll(() => newPageInTree.count()).toBe(0);
});
