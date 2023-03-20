/* eslint-disable no-template-curly-in-string */
import { render, screen } from "@testing-library/react";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";
import PropInput from "../../src/components/PropInput";
import userEvent from "@testing-library/user-event";

it("converts brackets into ${document. usages", async () => {
  const onChange = jest.fn();
  renderPropInput("`[[address]`", onChange);
  const textbox = screen.getByRole("textbox");

  await userEvent.type(textbox, "]");
  expect(onChange).toHaveBeenCalledWith("`${document.address}`");
  expect(onChange).toHaveBeenCalledTimes(1);
});

it("renders ${document. usages as brackets", () => {
  renderPropInput("`${document.address}`");
  const textbox = screen.getByRole("textbox");
  expect(textbox).toHaveValue("[[address]]");
});

it("requires backticks for template string expressions", () => {
  jest.spyOn(console, "error").mockImplementation(jest.fn());
  expect(() => renderPropInput("${document.without.backticks}")).toThrow(
    "Unable to remove backticks from: ${document.without.backticks}"
  );
});

function renderPropInput(propValue: string, onChange = jest.fn()) {
  render(
    <PropInput
      propType={PropValueType.string}
      propKind={PropValueKind.Expression}
      onChange={onChange}
      propValue={propValue}
    />
  );
}
