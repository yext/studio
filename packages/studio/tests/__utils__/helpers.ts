import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function checkTooltipFunctionality(
  tooltipText: string,
  hoverEl: HTMLElement
) {
  const tooltip = screen.getByRole("tooltip", { name: tooltipText });
  const tooltipClasses = tooltip.className;
  await userEvent.hover(hoverEl);
  await waitFor(() => expect(tooltipClasses).not.toEqual(tooltip.className));
}
