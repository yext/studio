import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function checkTooltipFunctionality(
  tooltipText: string,
  hoverEl: HTMLElement
) {
  expect(screen.queryByRole("tooltip", { name: tooltipText })).toBeNull();
  await userEvent.hover(hoverEl);
  const queryForTooltip = () => screen.queryByRole("tooltip", { name: tooltipText });
  const tooltip = await waitFor(queryForTooltip);
  expect(tooltip).toBeDefined();
}
