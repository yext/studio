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
      propType={{ type: PropValueType.string, unionValues: ["a", "b", "c"] }}
      propValue="c"
      propKind={PropValueKind.Literal}
      onChange={jest.fn()}
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

describe("correctly renders prop inputs with undefined value", () => {
  it("number prop", () => {
    render(
      <PropInput
        propType={{ type: PropValueType.number }}
        propValue={undefined}
        propKind={PropValueKind.Literal}
        onChange={jest.fn()}
      />
    );
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(null);
    expect(input).toBeDisabled();
  });

  it("non-union string prop", () => {
    renderExpressionPropInput(undefined);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");
    expect(input).toBeDisabled();
  });

  it("boolean prop", () => {
    render(
      <PropInput
        propType={{ type: PropValueType.boolean }}
        propValue={undefined}
        propKind={PropValueKind.Literal}
        onChange={jest.fn()}
      />
    );
    const input = screen.getByRole("checkbox");
    expect(input).not.toBeChecked();
    expect(input).toBeDisabled();
  });

  it("string union prop", () => {
    render(
      <PropInput
        propType={{ type: PropValueType.string, unionValues: ["a", "b", "c"] }}
        propValue={undefined}
        propKind={PropValueKind.Literal}
        onChange={jest.fn()}
      />
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("");
    expect(input).toBeDisabled();
  });

  it.only("hex color prop", () => {
    render(
      <div>
        <label>
          <p>color</p>
          <PropInput
            propType={{ type: PropValueType.HexColor }}
            propValue={undefined}
            propKind={PropValueKind.Literal}
            onChange={jest.fn()}
          />
        </label>
      </div>
    );
    expect(screen.getByText("#RRGGBB")).toBeVisible();
    expect(screen.queryByLabelText("color")).toBeNull();
  });
});

function renderExpressionPropInput(
  propValue: string | undefined,
  onChange = jest.fn()
) {
  render(
    <PropInput
      propType={{ type: PropValueType.string }}
      propKind={PropValueKind.Expression}
      onChange={onChange}
      propValue={propValue}
    />
  );
}
