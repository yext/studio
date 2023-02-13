/**
 * Represents a strategy for merging new and existing fields in a {@link TemplateConfig}.
 */
export type StreamConfigFieldsMerger = (
  existingFields: string[],
  newFields: string[]
) => string[]

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
]

/**
 * The default strategy for merging fields in a {@link TemplateConfig}. It
 * simply overrides the exisitng 'fields' attribute with the new one. It also
 * ensures that no top-level Stream properties are included in the 'fields' attribute.
 * 
 * @param existingFields - The existing 'fields' attribute in the Config.
 * @param newFields - The new fields to add.
 * @returns - The value of the new 'fields' attribute.
 */
export const DEFAULT_STREAM_FIELDS_MERGER: StreamConfigFieldsMerger = (
  existingFields: string[],
  newFields: string[]
): string[] => {
  return newFields.filter(
    documentPath => !NON_CONFIGURABLE_STREAM_PROPERTIES.includes(documentPath)
  )
}

/**
 * The strategy for merging of fields in a PagesJS repo. This strategy behaves in
 * much the same way as the {@link DEFAULT_STREAM_FIELDS_MERGER}. The one difference
 * is that if 'slug' is present in the existing 'fields' attribute, it will be
 * preserved. 
 * 
 * @param existingFields - The existing 'fields' attribute in the Config.
 * @param newFields - The new fields to add.
 * @returns - The value of the new 'fields' attribute.
 */
export const PAGES_JS_STREAM_FIELDS_MERGER: StreamConfigFieldsMerger = (
  existingFields: string[],
  newFields: string[]
): string[] => {
  const mergedFields = DEFAULT_STREAM_FIELDS_MERGER(existingFields, newFields);
  existingFields.includes('slug') && mergedFields.push('slug');

  return mergedFields;
}