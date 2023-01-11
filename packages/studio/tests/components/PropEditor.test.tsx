import { fireEvent, render, screen } from "@testing-library/react";
import { PropEditor } from "../../src/components/PropEditor";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";

describe("trigger onChange from input interaction", () => {
  it('constructs expression PropVal type when click "Expression" button', async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propName="age"
        propMetadata={{ type: PropValueType.number }}
        onPropChange={onPropChange}
      />
    );
    await userEvent.click(screen.getByText("Expression"));
    const inputValue = "doc.age";
    await userEvent.type(screen.getByLabelText("age"), inputValue);
    Array.from(inputValue).forEach((char) => {
      expect(onPropChange).toBeCalledWith("age", {
        kind: PropValueKind.Expression,
        valueType: PropValueType.number,
        value: char,
      });
    });
  });

  it("constructs string PropVal on type", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propName="title"
        propMetadata={{ type: PropValueType.string }}
        onPropChange={onPropChange}
      />
    );
    await userEvent.type(screen.getByLabelText("title"), "y");
    expect(onPropChange).toBeCalledWith("title", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: "y",
    });
  });

  it("constructs number PropVal on type", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propName="age"
        propMetadata={{ type: PropValueType.number }}
        onPropChange={onPropChange}
      />
    );
    await userEvent.type(screen.getByLabelText("age"), "4");
    expect(onPropChange).toBeCalledWith("age", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.number,
      value: 4,
    });
  });

  it("constructs boolean PropVal on click", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propName="is Yext employee?"
        propMetadata={{ type: PropValueType.boolean }}
        onPropChange={onPropChange}
      />
    );
    await userEvent.click(screen.getByLabelText("is Yext employee?"));
    expect(onPropChange).toBeCalledWith("is Yext employee?", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.boolean,
      value: true,
    });
  });

  it("constructs HexColor PropVal on select", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propName="background color"
        propMetadata={{ type: PropValueType.HexColor }}
        onPropChange={onPropChange}
      />
    );
    // userEvent doesn't support interaction with input of type "color"
    fireEvent.input(screen.getByLabelText("background color"), {
      target: { value: "#abcdef" },
    });
    expect(onPropChange).toBeCalledWith("background color", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.HexColor,
      value: "#abcdef",
    });
  });
});
