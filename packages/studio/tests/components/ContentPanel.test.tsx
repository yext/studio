import {
  PropMetadata,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { render, screen } from "@testing-library/react";
import ContentPanel, {
  getPropValueKind,
} from "../../src/components/ContentPanel";
import { mockRepeaterActiveComponent } from "../__utils__/mockRepeaterActiveComponent";

describe("getPropValueKind works as expected", () => {
  it("returns Literal for string union prop", () => {
    const stringUnionMetadata: PropMetadata = {
      required: false,
      type: PropValueType.string,
      unionValues: ["a", "b"],
    };

    expect(getPropValueKind(stringUnionMetadata)).toBe(PropValueKind.Literal);
  });

  it("returns Expression for simple string prop", () => {
    const stringMetadata: PropMetadata = {
      required: false,
      type: PropValueType.string,
    };

    expect(getPropValueKind(stringMetadata)).toBe(PropValueKind.Expression);
  });
});

it("renders repeated component's props for a Repeater", () => {
  mockRepeaterActiveComponent();
  render(<ContentPanel />);
  screen.getByText("text");
  expect(screen.getAllByRole("textbox")[0]).toHaveValue("test");
});
