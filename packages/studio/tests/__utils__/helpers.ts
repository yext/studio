import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function checkTooltipFunctionality(
  tooltipText: string,
  hoverEl: HTMLElement
) {
  const queryForTooltip = () => screen.queryByRole("tooltip", { name: tooltipText });
  expect(queryForTooltip()).toBeNull();
  await userEvent.hover(hoverEl);
  const tooltip = await waitFor(queryForTooltip);
  expect(tooltip).toBeDefined();
}
