/**
 * Filters a given stream document down to fields that match a certain type.
 * When fieldType is "array", all item types are supported.
 */
export default function filterStreamDocument(
  fieldType: "string" | "array",
  streamDocument: Record<string, unknown> = {}
): Record<string, unknown> {
  const filteredEntries = Object.entries(streamDocument)
    .filter(([field]) => field !== "__")
    .map(([field, value]) => {
      const isObjectField =
        typeof value === "object" && !Array.isArray(value) && value !== null;

      if (isObjectField) {
        const filteredSubObject = filterStreamDocument(
          fieldType,
          value as Record<string, unknown>
        );
        return Object.keys(filteredSubObject).length === 0
          ? null
          : [field, filteredSubObject];
      }

      switch (fieldType) {
        case "string":
          if (typeof value === "string") {
            return [field, value];
          }
          break;
        case "array":
          if (Array.isArray(value)) {
            return [field, value];
          }
          break;
      }
      return null;
    })
    .filter((n): n is [string, unknown[] | string] => !!n);
  return Object.fromEntries(filteredEntries);
}
