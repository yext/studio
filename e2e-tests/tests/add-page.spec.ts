import { test, expect } from "@playwright/test";

test("can add a new page", async ({ page }) => {
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
});
