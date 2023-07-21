import { Locator, Page, expect } from "@playwright/test";

export default class ToastActionButton {
  private readonly successToast: Locator;
  readonly button: Locator;

  constructor(
    page: Page,
    successToastText: string,
    buttonAriaLabel: string
  ) {
    this.successToast = page
      .getByRole("alert")
      .filter({ hasText: successToastText });

    this.button = page.getByRole("button", {
      name: buttonAriaLabel,
    });
  }

  async click() {
    await this.button.click({ timeout: 3000 });
    await expect(() => expect(this.successToast).toHaveCount(1)).toPass({
      timeout: 15_000,
    });
    await this.successToast.click();
    await expect(this.successToast).toHaveCount(0);
  }
}
