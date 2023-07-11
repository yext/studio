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

export async function openUndefinedMenu(hoverElementText: string) {
  await userEvent.hover(screen.getByText(hoverElementText));
  const menuButton = await waitFor(() =>
    screen.getByLabelText("Toggle undefined value menu")
  );
  expect(menuButton).toBeDefined();
  await userEvent.click(menuButton);
}
