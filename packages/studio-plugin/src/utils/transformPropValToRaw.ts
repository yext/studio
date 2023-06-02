import { PropVal, PropValues, PropValueType } from "../types";

/**
 * Given a PropValues object, parse the object into its raw values.
 */
export function transformPropValuesToRaw(
  values: PropValues
): Record<string, unknown> {
  const transformedValues = {};
  Object.keys(values).forEach((key) => {
    transformedValues[key] = transformPropValToRaw(values[key]);
  });
  return transformedValues;
}

/**
 * Given a PropVal object, parse the object into its raw value.
 */
export function transformPropValToRaw({ value, valueType }: PropVal) {
  if (valueType === PropValueType.Object) {
    return transformPropValuesToRaw(value);
  } else if (valueType === PropValueType.Array && Array.isArray(value)) {
    return value.map((itemVal) => transformPropValToRaw(itemVal));
  } else {
    return value;
  }
}
