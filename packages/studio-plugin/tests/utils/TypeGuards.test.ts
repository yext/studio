import { PropValueKind, PropValueType, PropType } from "../../src/types";
import TypeGuards from "../../src/utils/TypeGuards";

describe("isSiteSettingsValues", () => {
  it("correctly identifies nested PropValues that match SiteSettingsValues", () => {
    expect(
      TypeGuards.isSiteSettingsValues({
        key1: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            nestedKey1: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.HexColor,
              value: "#AABBCC",
            },
          },
        },
      })
    ).toBeTruthy();
  });

  it("correctly rejects nested PropValues that contain expressions", () => {
    expect(
      TypeGuards.isSiteSettingsValues({
        key1: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            nestedKey1: {
              kind: PropValueKind.Expression,
              valueType: PropValueType.HexColor,
              value: "document.myColor",
            },
          },
        },
      })
    ).toBeFalsy();
  });
});

describe("isValidPropVal", () => {
  it("requires object props to recursively have valueType specified", () => {
    const invalidPropVal = {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Object,
      value: {
        kind: PropValueKind.Literal,
        value: "some string",
      },
    };
    expect(TypeGuards.isValidPropVal(invalidPropVal)).toBeFalsy();
  });
});

describe("valueMatchesPropType", () => {
  it("requires array props to recursively be valid", () => {
    const propType: PropType = {
      type: PropValueType.Array,
      itemType: {
        type: PropValueType.Object,
        shape: {
          str: {
            required: true,
            type: PropValueType.string,
          },
          nums: {
            required: false,
            type: PropValueType.Array,
            itemType: {
              type: PropValueType.number,
            },
          },
        },
      },
    };
    const invalidValue = [
      {
        str: "some string",
        nums: [1],
      },
      {
        str: "other string",
        nums: [2, "3"],
      },
    ];
    expect(TypeGuards.valueMatchesPropType(propType, invalidValue)).toBeFalsy();
  });

  it("checks for specific values for string union", () => {
    const propType: PropType = {
      type: PropValueType.string,
      unionValues: ["some string"],
    };
    expect(
      TypeGuards.valueMatchesPropType(propType, "other string")
    ).toBeFalsy();
  });
});
