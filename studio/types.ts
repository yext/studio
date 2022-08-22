export enum PropTypes {
  StreamsString = 'StreamsString',
  StreamsData = 'StreamsData',
  HexColor = 'HexColor',
  number = 'number',
  string = 'string',
  boolean = 'boolean'
}

export type PropStateTypes =
  StreamsStringState | StreamsDataState | HexColorState | NumberState | BooleanState | StringState

// When a StreamsString is used by a component it is a string type
export type StreamsString = string
// A StreamsString is represented within Studio as either a string containing a template string
// that accesses the streams document, or a StreamsDataExpression
export type StreamsStringExpression = `\`${string}\`` | StreamsDataExpression
export type StreamsStringState = {
  type: PropTypes.StreamsString,
  value: StreamsStringExpression
}

// When StreamsData is used by a component it can be any streams document property
export type StreamsData<T = unknown> = T
// StreamsData is represented within studio as a StreamsDataExpression, which describes the path
// in the streams document to the desired data. We do not support bracket notation for property access
// except for indexing an array.
export type StreamsDataExpression = `document.${string}`
export type StreamsDataState = {
  type: PropTypes.StreamsData,
  value: StreamsDataExpression
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
