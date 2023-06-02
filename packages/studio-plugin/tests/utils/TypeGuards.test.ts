import { PropValueKind, PropValueType } from "../../src/types";
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

describe("isValidPropValue", () => {
  it("requires object props to recursively have valueType specified", () => {
    const invalidPropVal = {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Object,
      value: {
        kind: PropValueKind.Literal,
        value: "some string",
      },
    };
    expect(TypeGuards.isValidPropValue(invalidPropVal)).toBeFalsy();
  });

  it("requires array props to recursively be valid", () => {
    const invalidPropVal = {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Array,
      value: [
        {
          kind: PropValueKind.Literal,
          valueType: PropValueType.string,
          value: "some string",
        },
        {
          kind: PropValueKind.Literal,
          valueType: PropValueType.string,
          value: 3,
        },
      ],
    };
    expect(TypeGuards.isValidPropValue(invalidPropVal)).toBeFalsy();
  });
});
