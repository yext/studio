import { Locator, Page, expect } from "@playwright/test";

export default class ToastActionButton {
  private readonly successToast: Locator;
  readonly button: Locator;

  constructor(
    private page: Page,
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
    await this.button.click();
    await expect(() => expect(this.successToast).toHaveCount(1)).toPass({
      timeout: 10_000,
    });
    await this.successToast.click();
    await expect(this.successToast).toHaveCount(0);
  }
}
