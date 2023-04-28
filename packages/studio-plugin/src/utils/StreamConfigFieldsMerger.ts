/**
 * Represents a strategy for merging new and existing fields in a {@link TemplateConfig}.
 */
export type StreamConfigFieldsMerger = (
  existingFields: string[],
  newFields: string[]
) => string[];

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
 * @param newFields - The new fields.
 * @returns - The value of the new 'fields' attribute.
 */
const pagesJSFieldsMerger: StreamConfigFieldsMerger = (
  existingFields: string[],
  newFields: string[]
): string[] => {
  const mergedFields = newFields.filter(
    (documentPath) => !NON_CONFIGURABLE_STREAM_PROPERTIES.includes(documentPath)
  );
  existingFields.includes("slug") && mergedFields.push("slug");

  return [...new Set(mergedFields)];
};

export default pagesJSFieldsMerger;
