/* eslint-disable no-template-curly-in-string */
import { render, screen } from "@testing-library/react";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";
import PropInput from "../../src/components/PropInput";
import userEvent from "@testing-library/user-event";

it("converts brackets into ${document. usages", async () => {
  const onChange = jest.fn();
  renderExpressionPropInput("`[[address]`", onChange);
  const textbox = screen.getByRole("textbox");

  await userEvent.type(textbox, "]");
  expect(onChange).toHaveBeenCalledWith("`${document.address}`");
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("renders ${document. usages as brackets", () => {
  renderExpressionPropInput("`${document.address}`");
  const textbox = screen.getByRole("textbox");
  expect(textbox).toHaveValue("[[address]]");
});

it("requires backticks for template string expressions", () => {
  jest.spyOn(console, "error").mockImplementation(jest.fn());
  expect(() =>
    renderExpressionPropInput("${document.without.backticks}")
  ).toThrow("Unable to remove backticks from: ${document.without.backticks}");
});

it("correctly renders String Union Prop", () => {
  render(
    <PropInput
      propType={{ type: PropValueType.string }}
      propValue="c"
      propKind={PropValueKind.Literal}
      onChange={jest.fn()}
      unionValues={["a", "b", "c"]}
    />
  );
  expect(
    (screen.getByRole("option", { name: "c" }) as HTMLOptionElement).selected
  ).toBe(true);
  expect(
    (screen.getByRole("option", { name: "a" }) as HTMLOptionElement).selected
  ).toBe(false);
  expect(
    (screen.getByRole("option", { name: "b" }) as HTMLOptionElement).selected
  ).toBe(false);
  expect(screen.getAllByRole("option").length).toBe(3);
});

function renderExpressionPropInput(propValue: string, onChange = jest.fn()) {
  render(
    <PropInput
      propType={{ type: PropValueType.string }}
      propKind={PropValueKind.Expression}
      onChange={onChange}
      propValue={propValue}
    />
  );
}
