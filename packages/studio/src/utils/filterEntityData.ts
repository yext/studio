/**
 * Filters the entity data using the provided fieldFilter function.
 */
export default function filterEntityData(
  fieldFilter: (value: unknown) => boolean,
  entityData: Record<string, unknown> = {}
): Record<string, unknown> {
  const filteredEntries = Object.entries(entityData)
    .filter(([field]) => field !== "__")
    .map(([field, value]) => {
      const isObjectField =
        typeof value === "object" && !Array.isArray(value) && value !== null;

      if (isObjectField) {
        const filteredSubObject = filterEntityData(
          fieldFilter,
          value as Record<string, unknown>
        );
        return Object.keys(filteredSubObject).length === 0
          ? null
          : [field, filteredSubObject];
      } else {
        return fieldFilter(value) ? [field, value] : null;
      }
    })
    .filter((n): n is [string, unknown[] | string] => !!n);
  return Object.fromEntries(filteredEntries);
}
