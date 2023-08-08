import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DOMRectProperties from "../../src/store/models/DOMRectProperties";

export async function checkTooltipFunctionality(
  tooltipText: string,
  hoverEl: HTMLElement
) {
  const queryForTooltip = () =>
    screen.queryByRole("tooltip", { name: tooltipText });
  expect(queryForTooltip()).toBeNull();
  await userEvent.hover(hoverEl);
  const tooltip = await waitFor(queryForTooltip);
  expect(tooltip).toBeDefined();
}

export function domRect(x, y, width, height) {
  return {
    x,
    y,
    width,
    height,
    top: y,
    bottom: y + height,
    left: x,
    right: x + width,
  } as DOMRectProperties;
}
