export type HexColor = `#${string}`
export type StreamsTemplateString = string
export type StreamsDataPath = string

export type SpecialTypes =
  HexColor |
  StreamsTemplateString |
  StreamsDataPath

export const specialTypesArray = ['HexColor', 'StreamsTemplateString', 'StreamsDataPath']

