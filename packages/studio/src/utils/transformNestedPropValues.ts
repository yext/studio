import { PropValueKind, PropValues, PropValueType } from "@yext/studio-plugin";

/**
 * Given a PropValues object, parse the object into its raw values.
 */
export default function transformPropValuesToRaw(
  values: PropValues
): Record<string, unknown> {
  const transformedValues = {};
  Object.keys(values).forEach((key) => {
    const { value, valueType, kind } = values[key];
    if (valueType === PropValueType.Object && kind === PropValueKind.Literal) {
      transformedValues[key] = transformPropValuesToRaw(value);
    } else {
      transformedValues[key] = value;
    }
  });
  return transformedValues;
}
