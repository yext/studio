import {
  NestedPropType,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import PropValueHelpers from "../../src/utils/PropValueHelpers";

describe("getDefaultPropVal", () => {
  it("can generate default PropVal for complex object prop type", () => {
    const propType: NestedPropType = {
      type: PropValueType.Object,
      shape: {
        bool: { type: PropValueType.boolean, required: false },
        arr: {
          type: PropValueType.Array,
          required: true,
          itemType: { type: PropValueType.string },
        },
        obj: {
          type: PropValueType.Object,
          required: true,
          shape: {
            num: { type: PropValueType.number, required: false },
            color: { type: PropValueType.HexColor, required: true },
            union: {
              type: PropValueType.string,
              required: true,
              unionValues: ["1", "2"],
            },
          },
        },
      },
    };
    const expectedPropVal: PropVal = {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Object,
      value: {
        arr: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Array,
          value: [],
        },
        obj: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            color: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.HexColor,
              value: "#FFFFFF",
            },
            union: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.string,
              value: "1",
            },
          },
        },
      },
    };
    expect(PropValueHelpers.getDefaultPropVal(propType)).toEqual(
      expectedPropVal
    );
  });
});
