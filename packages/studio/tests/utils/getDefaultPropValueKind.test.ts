import {
  PropMetadata,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";

import getDefaultPropValueKind from "../../src/utils/getDefaultPropValueKind";

describe("getDefaultPropValueKind works as expected", () => {
  it("returns Literal for string union prop", () => {
    const stringUnionMetadata: PropMetadata = {
      required: false,
      type: PropValueType.string,
      unionValues: ["a", "b"],
    };

    expect(getDefaultPropValueKind(stringUnionMetadata)).toBe(
      PropValueKind.Literal
    );
  });

  it("returns Expression for simple string prop", () => {
    const stringMetadata: PropMetadata = {
      required: false,
      type: PropValueType.string,
    };

    expect(getDefaultPropValueKind(stringMetadata)).toBe(
      PropValueKind.Expression
    );
  });
});
