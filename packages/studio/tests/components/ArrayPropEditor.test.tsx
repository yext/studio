import { render, screen } from "@testing-library/react";
import { PropVal, PropValueKind, PropValueType } from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";
import ArrayPropEditor from "../../src/components/ArrayPropEditor";
import { checkTooltipFunctionality } from "../__utils__/helpers";
import mockStore from "../__utils__/mockStore";

it("renders correctly when prop has no value", () => {
  renderArrayPropEditor();
  const textbox = screen.getByRole("textbox");
  expect(textbox).toHaveValue("");
  expect(textbox).toBeEnabled();
});

it("renders tooltip correctly when prop has doc", async () => {
  renderArrayPropEditor(undefined, jest.fn(), "some strings");
  await checkTooltipFunctionality("some strings", screen.getByText("arrProp"));
});

describe("expression value", () => {
  it("renders correctly", () => {
    renderArrayPropEditor("document.strings");
    const textbox = screen.getByRole("textbox");
    expect(textbox).toHaveValue("document.strings");
    expect(textbox).toBeEnabled();
  });

  it("updates value on type", async () => {
    const onPropChange = jest.fn();
    renderArrayPropEditor("document.strings", onPropChange);
    await userEvent.type(screen.getByRole("textbox"), "s");
    expect(onPropChange).toBeCalledWith("arrProp", {
      kind: PropValueKind.Expression,
      valueType: PropValueType.Array,
      value: "document.stringss",
    });
  });

  it("updates value with field picker", async () => {
    mockStore({ pages: { activeEntityData: { strings: [], words: [] } } });
    const onPropChange = jest.fn();
    renderArrayPropEditor("document.strings", onPropChange);
    await userEvent.click(
      screen.getByRole("button", { name: "Toggle field picker" })
    );
    await userEvent.click(screen.getByText("Words"));
    expect(onPropChange).toBeCalledWith("arrProp", {
      kind: PropValueKind.Expression,
      valueType: PropValueType.Array,
      value: "document.words",
    });
  });
});

describe("literal value", () => {
  const literalValue: PropVal[] = [
    {
      kind: PropValueKind.Expression,
      valueType: PropValueType.string,
      value: "document.name",
    },
    {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: "literal",
    },
  ];

  it("renders correctly when prop has empty array", () => {
    renderArrayPropEditor([]);
    const textbox = screen.getByRole("textbox");
    expect(textbox).toHaveValue("");
    expect(textbox).toBeEnabled();
  });

  it("renders correctly when prop has items in array", async () => {
    renderArrayPropEditor(literalValue);

    expect(screen.getByRole("textbox", { name: "Item 1" })).toHaveValue(
      "[[name]]"
    );
    expect(screen.getByRole("textbox", { name: "Item 2" })).toHaveValue(
      "literal"
    );
    const expressionInput = screen.getByRole("textbox", {
      name: (text) => text.startsWith("arrProp"),
    });
    expect(expressionInput).toBeDisabled();
    await checkTooltipFunctionality(
      "Disabled while items are present below",
      expressionInput
    );
  });

  it("updates value on type", async () => {
    const onPropChange = jest.fn();
    renderArrayPropEditor(literalValue, onPropChange);
    await userEvent.type(screen.getByRole("textbox", { name: "Item 2" }), "!");
    expect(onPropChange).toBeCalledWith("arrProp", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Array,
      value: [
        literalValue[0],
        {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "`literal!`",
        },
      ],
    });
  });
});

function renderArrayPropEditor(
  propValue?: string | PropVal[],
  onPropChange = jest.fn(),
  doc?: string
) {
  render(
    <ArrayPropEditor
      propName="arrProp"
      propMetadata={{
        type: PropValueType.Array,
        itemType: { type: PropValueType.string },
        required: false,
        doc,
      }}
      propValue={propValue}
      onPropChange={onPropChange}
    />
  );
}
