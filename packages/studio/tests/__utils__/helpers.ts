import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function checkTooltipFunctionality(
  tooltipText: string,
  hoverEl: HTMLElement
) {
  expect(screen.queryByRole("tooltip", { name: tooltipText })).toBeNull();
  await userEvent.hover(hoverEl);
  await screen.findByRole("tooltip", { name: tooltipText }, { timeout: 1000 });
}
