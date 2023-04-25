import { fireEvent, render, screen } from "@testing-library/react";
import PropEditor from "../../src/components/PropEditor";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";

describe("trigger onChange from input interaction", () => {
  it("constructs expression PropVal type", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propKind={PropValueKind.Expression}
        propName="age"
        propMetadata={{ type: PropValueType.number, required: false }}
        onPropChange={onPropChange}
      />
    );
    const inputValue = "doc.age";
    await userEvent.type(screen.getByLabelText("age"), inputValue);
    Array.from(inputValue).forEach((char) => {
      expect(onPropChange).toBeCalledWith("age", {
        kind: PropValueKind.Expression,
        valueType: PropValueType.number,
        value: "`" + char + "`",
      });
    });
  });

  it("constructs string PropVal on type", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propKind={PropValueKind.Literal}
        propName="title"
        propMetadata={{ type: PropValueType.string, required: false }}
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
        propKind={PropValueKind.Literal}
        propName="age"
        propMetadata={{ type: PropValueType.number, required: false }}
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
        propKind={PropValueKind.Literal}
        propName="is Yext employee?"
        propMetadata={{ type: PropValueType.boolean, required: false }}
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
    jest.useFakeTimers();
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propKind={PropValueKind.Literal}
        propName="background color"
        propMetadata={{ type: PropValueType.HexColor, required: false }}
        onPropChange={onPropChange}
      />
    );
    // userEvent doesn't support interaction with input of type "color"
    fireEvent.input(screen.getByLabelText("background color"), {
      target: { value: "#abcdef" },
    });
    await screen.findByDisplayValue("#abcdef");
    jest.advanceTimersByTime(100); //debounce time
    expect(onPropChange).toBeCalledWith("background color", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.HexColor,
      value: "#abcdef",
    });
  });
  jest.useRealTimers();
});
