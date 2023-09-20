import { render, screen } from "@testing-library/react";
import TailwindPropInput from "../../src/components/TailwindPropInput";
import userEvent from "@testing-library/user-event";

it("can render a custom tailwind class", async () => {
  renderPropInput("text-medium");
  const pill = await screen.findByText("text-medium");
  expect(pill).toBeDefined();
});

it("can add a tailwind class", async () => {
  const onChange = jest.fn();
  renderPropInput("text-medium", onChange);
  const pickerIcon = await screen.findByRole("button", {
    name: "Toggle pill picker",
  });
  expect(screen.queryByText("bg-primary")).toBeNull();
  await userEvent.click(pickerIcon);
  const dropdownOption = await screen.findByText("bg-primary");
  expect(onChange).toHaveBeenCalledTimes(0);
  await userEvent.click(dropdownOption);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith("text-medium bg-primary");
});

it("can remove a tailwind class", async () => {
  const onChange = jest.fn();
  renderPropInput("text-medium bg-primary", onChange);
  const pill = await screen.findByText("text-medium");
  expect(onChange).toHaveBeenCalledTimes(0);
  await userEvent.click(pill);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith("bg-primary");
});

function renderPropInput(
  value: string,
  onChange = jest.fn(),
  disabled = false
) {
  render(
    <TailwindPropInput value={value} onChange={onChange} disabled={disabled} />
  );
}
