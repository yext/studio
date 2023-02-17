import { test, expect } from "@playwright/test";

test("page appears as expected on load", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveScreenshot();

  const saveButton = page.getByRole("button", {
    exact: true,
    name: "Save Changes to Repository",
  });
  await expect(saveButton).toBeDisabled();
});