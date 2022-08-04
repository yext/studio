export type HexColor = `#${string}`

export type SpecialTypes = HexColor // union of all types listed here
export const specialTypesArray = ['HexColor', 'StreamsDataPath'] // array of all listed types as strings

export type StreamsDataPath = string
