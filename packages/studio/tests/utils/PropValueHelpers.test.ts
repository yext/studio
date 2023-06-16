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
          required: false,
          itemType: { type: PropValueType.string },
        },
        obj: {
          type: PropValueType.Object,
          required: true,
          shape: {
            num: { type: PropValueType.number, required: true },
            color: { type: PropValueType.HexColor, required: false },
          },
        },
      },
    };
    const expectedPropVal: PropVal = {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Object,
      value: {
        bool: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: false,
        },
        arr: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Array,
          value: [],
        },
        obj: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            num: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.number,
              value: 0,
            },
            color: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.HexColor,
              value: "#FFFFFF",
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
