export enum PropTypes {
  HexColor = 'HexColor',
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  ReactNode = 'ReactNode'
}

export type PropStateTypes =
  (HexColorState | NumberState | BooleanState | StringState) & { isExpression?: false } | ExpressionState

// A hex color is represented within Studio and used in a component outside studio as the same type, HexColor
export type HexColor = `#${string}`
export type HexColorState = {
  type: PropTypes.HexColor,
  value: HexColor
}

export type NumberState = {
  type: PropTypes.number,
  value: number
}

export type StringState = {
  type: PropTypes.string,
  value: string
}

export type BooleanState = {
  type: PropTypes.boolean,
  value: boolean
}

export type ExpressionState = {
  type: PropTypes,
  value: string,
  isExpression: true
}

export enum ExpressionSourceType {
  Unknown = 'unknown',
  SiteSettings = 'siteSettings',
  Stream = 'stream'
}

export type TemplateStringExpression = `\`${string}\``

// Describes the path in site settings configuration to the desired data.
export type SiteSettingsExpression = `siteSettings.${string}`

// Describes the path in the streams document to the desired data.
// We do not support bracket notation for property access except for indexing an array.
export type StreamsDataExpression = `document.${string}`
