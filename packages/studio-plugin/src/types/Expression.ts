export type TemplateStringExpression = `\`${string}\``;

/**
 * Describes the path in the streams document to the desired data. Bracket
 * notation for property access is not supported, except for indexing an array.
 */
export type StreamsDataExpression = `document.${string}`;

/** Describes the path in site settings configuration to the desired data.  */
export type SiteSettingsExpression = `siteSettings.${string}`;
