import { test, expect } from "@playwright/test";

test("can add a container component", async ({ page }) => {
  await page.goto("./");

  const previews = page.getByText("I'm a container:");
  await expect.poll(() => previews.count).toBe(1);

  await page
    .getByRole("button", {
      exact: true,
      name: "Open Add Element Menu",
    })
    .click();
  await page.getByText("Containers").click();

  await page
    .getByRole("button", {
      name: "Add Container Element",
      exact: true,
    })
    .click();

  await expect.poll(() => previews.count).toBe(2);
});
