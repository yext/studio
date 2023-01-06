import { test, expect } from "@playwright/test";

test("can add a container component", async ({ page }) => {
  await page.goto("./");

  await page
    .getByRole("button", {
      exact: true,
      name: "Open Add Element Menu",
    })
    .click();
  await page.getByText("Containers").click();

  const numPreviews = (await page.getByText("I'm a container:").all()).length;
  await page
    .getByRole("button", {
      name: "Add Container Element",
      exact: true,
    })
    .click();

  const numPreviewsAfterAdd = (await page.getByText("I'm a container:").all())
    .length;
  await expect(numPreviewsAfterAdd).toEqual(numPreviews + 1);
});
