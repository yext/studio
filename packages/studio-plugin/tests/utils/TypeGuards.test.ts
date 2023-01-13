import { PropValueKind, PropValueType } from '../../src/types';
import TypeGuards from "../../src/utils/TypeGuards"

describe('isSiteSettingsValues', () => {
  it('correctly identifies nested PropValues that match SiteSettingsValues', () => {
    expect(TypeGuards.isSiteSettingsValues({
      key1: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: {
          nestedKey1: {
            kind: PropValueKind.Literal,
            valueType: PropValueType.HexColor,
            value: "#AABBCC"
          }
        }
      }
    })).toBeTruthy()
  });

  it('correctly rejects nested PropValues that contain expressions', () => {
    expect(TypeGuards.isSiteSettingsValues({
      key1: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: {
          nestedKey1: {
            kind: PropValueKind.Expression,
            valueType: PropValueType.HexColor,
            value: "document.myColor"
          }
        }
      }
    })).toBeFalsy()
  });
});