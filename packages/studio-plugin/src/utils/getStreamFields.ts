/**
 * These are stream properties that will throw an error if specified within
 * a "Stream.fields", with the exception of `id` (at the time of writing),
 * and should always be present in localData even if not specifically asked for.
 */
export const NON_CONFIGURABLE_STREAM_PROPERTIES = [
  "__",
  "businessId",
  "id",
  "key",
  "locale",
  "meta",
  "siteDomain",
  "siteId",
  "siteInternalHostName",
  "uid",
];

/**
 * The strategy for merging fields in a PagesJS Stream Config. This strategy overwrites all
 * existing fields, except for 'slug' (if present). Additionally, any top-level Stream
 * Config attributes are filtered out of the returned fields. De-duplication is also performed.
 *
 * @param existingFields - The existing 'fields' attribute in the Config.
 * @param requestedFields - The new fields.
 * @returns - The value of the new 'fields' attribute.
 */
export default function getStreamFields(
  existingFields: string[],
  requestedFields: string[]
): string[] {
  const mergedFields = requestedFields
    .map((field) => (/^([^[]+)/.exec(field) as RegExpExecArray)[1])
    .filter((field) => {
      if (NON_CONFIGURABLE_STREAM_PROPERTIES.includes(field)) {
        return false;
      }

      const isSubfield = field.includes(".");
      if (isSubfield) {
        const parentField = (/^([^.]+)/.exec(field) as RegExpExecArray)[1];
        return !requestedFields.includes(parentField);
      }

      return true;
    });
  existingFields.includes("slug") && mergedFields.push("slug");

  return [...new Set(mergedFields)];
}
