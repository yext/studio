import { LiteralProp, PropVal, PropValueKind, PropValues, PropValueType } from '@yext/studio-plugin';

/**
 * Given a raw value, create the LiteralProp wrapper object.
 */
export default function createLiteralProp<T = PropValues>(rawValue: string | number | boolean | T): LiteralProp<T> {
  if (typeof rawValue === 'string') {
    return {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: rawValue
    }
  } else if (typeof rawValue === 'number') {
    return {
      kind: PropValueKind.Literal,
      valueType: PropValueType.number,
      value: rawValue
    }
  } else if (typeof rawValue === 'boolean') {
    return {
      kind: PropValueKind.Literal,
      valueType: PropValueType.boolean,
      value: rawValue
    }
  } else {
    return {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Object,
      value: rawValue
    }
  }
}