export type HexColor = `#${string}`
export type StreamsDataPath = string

export type SpecialTypes = HexColor | StreamsDataPath // union of all types listed here
export const specialTypesArray = ['HexColor', 'StreamsDataPath'] // array of all listed types as strings

