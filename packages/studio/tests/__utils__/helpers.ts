import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function checkTooltipFunctionality(
  tooltipText: string,
  hoverEl: HTMLElement
) {
  expect(screen.queryByRole("tooltip", { name: tooltipText })).toBeNull();
  await userEvent.hover(hoverEl);
  const findTooltip = () => screen.findByRole("tooltip", { name: tooltipText });
  await waitFor(findTooltip, {
    timeout: 2500
  });
}
