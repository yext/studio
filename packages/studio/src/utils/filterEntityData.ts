import { PropType, PropValueType, TypeGuards } from "@yext/studio-plugin";

/**
 * Filters the given entity data down to fields that match a certain type.
 * When fieldType is {@link PropValueType.Array}, all item types are supported.
 */
export default function filterEntityData(
  fieldType: PropType | PropValueType.Array,
  entityData: Record<string, unknown> = {}
): Record<string, unknown> {
  const filteredEntries = Object.entries(entityData)
    .filter(([field]) => field !== "__")
    .map(([field, value]) => {
      const isObjectField =
        typeof value === "object" && !Array.isArray(value) && value !== null;
      const allowAnyArray = fieldType === PropValueType.Array;

      if (isObjectField) {
        const filteredSubObject = filterEntityData(
          fieldType,
          value as Record<string, unknown>
        );
        return Object.keys(filteredSubObject).length === 0
          ? null
          : [field, filteredSubObject];
      } else if (allowAnyArray) {
        if (Array.isArray(value)) {
          return [field, value];
        }
      } else if (TypeGuards.valueMatchesPropType(fieldType, value)) {
        return [field, value];
      }
      return null;
    })
    .filter((n): n is [string, unknown[] | string] => !!n);
  return Object.fromEntries(filteredEntries);
}
