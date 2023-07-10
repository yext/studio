import { render, screen } from "@testing-library/react";
import UndefinedMenuButton from "../../src/components/UndefinedMenuButton";
import { PropVal, PropValueKind, PropValueType } from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";

describe("prop with undefined value", () => {
  it("correctly renders menu when icon is clicked", async () => {
    renderUndefinedMenuButton(true);
    await userEvent.click(screen.getByLabelText("Toggle undefined value menu"));
    expect(screen.getByText("Reset to Default")).toBeDefined();
  });

  it("updates value to a default when menu is clicked", async () => {
    const updateProp = jest.fn();
    renderUndefinedMenuButton(true, updateProp);
    await userEvent.click(screen.getByLabelText("Toggle undefined value menu"));
    await userEvent.click(screen.getByText("Reset to Default"));
    expect(updateProp).toBeCalledTimes(1);
    const defaultPropVal: PropVal = {
      kind: PropValueKind.Literal,
      valueType: PropValueType.boolean,
      value: false,
    };
    expect(updateProp).toBeCalledWith(defaultPropVal);
  });
});

describe("prop with defined value", () => {
  it("correctly renders menu when icon is clicked", async () => {
    renderUndefinedMenuButton(false);
    await userEvent.click(screen.getByLabelText("Toggle undefined value menu"));
    expect(screen.getByText("Set as Undefined")).toBeDefined();
  });

  it("updates value to undefined when menu is clicked", async () => {
    const updateProp = jest.fn();
    renderUndefinedMenuButton(false, updateProp);
    await userEvent.click(screen.getByLabelText("Toggle undefined value menu"));
    await userEvent.click(screen.getByText("Set as Undefined"));
    expect(updateProp).toBeCalledTimes(1);
    expect(updateProp).toBeCalledWith(undefined);
  });
});

it("closes menu when clicking outside menu", async () => {
  renderUndefinedMenuButton(true, jest.fn(), <>Test</>);
  await userEvent.click(screen.getByLabelText("Toggle undefined value menu"));
  expect(screen.getByText("Reset to Default")).toBeDefined();
  await userEvent.click(screen.getByText("Test"));
  expect(screen.queryByText("Reset to Default")).toBeFalsy();
});

function renderUndefinedMenuButton(
  isUndefined: boolean,
  updateProp = jest.fn(),
  children?: ReactNode
) {
  render(
    <UndefinedMenuButton
      propType={{ type: PropValueType.boolean }}
      isUndefined={isUndefined}
      updateProp={updateProp}
    >
      {children}
    </UndefinedMenuButton>
  );
}
