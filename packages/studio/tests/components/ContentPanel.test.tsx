import {
  PropMetadata,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { getPropValueKind } from "../../src/components/ContentPanel";

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
