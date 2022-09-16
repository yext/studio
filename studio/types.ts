export enum PropTypes {
  StreamsString = 'StreamsString',
  HexColor = 'HexColor',
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  ReactNode = 'ReactNode'
}

export type PropStateTypes =
  (StreamsStringState |
  HexColorState |
  NumberState |
  BooleanState |
  StringState)
  & { expressionSource?: never } |
  ExpressionState

// When a StreamsString is used by a component it is a string type
export type StreamsString = string
// A StreamsString is represented within Studio as either a string containing a template string
// that accesses the streams document, or a StreamsDataExpression
export type StreamsStringExpression = `\`${string}\`` | StreamsDataExpression
export type StreamsStringState = {
  type: PropTypes.StreamsString,
  value: StreamsStringExpression
}

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

export type ExpressionState = UnknownExpressionState | SiteSettingsExpressionState | StreamDataExpressionState

export type UnknownExpressionState = {
  type: PropTypes,
  value: string,
  expressionSource: ExpressionSourceType.Unknown
}

export type SiteSettingsExpressionState = {
  type: PropTypes,
  value: `siteSettings.${string}`,
  expressionSource: ExpressionSourceType.SiteSettings
}

export type StreamDataExpressionState = {
  type: PropTypes,
  value: `document.${string}`,
  expressionSource: ExpressionSourceType.Stream
}

export enum ExpressionSourceType {
  Unknown = 'unknown',
  SiteSettings = 'siteSettings',
  Stream = 'stream'
}

// // When StreamsData is used by a component it can be any streams document property
// export type StreamsData<T = unknown> = T
// StreamsData is represented within studio as a StreamsDataExpression, which describes the path
// in the streams document to the desired data. We do not support bracket notation for property access
// except for indexing an array.
export type StreamsDataExpression = `document.${string}`
