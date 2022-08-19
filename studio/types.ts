export type HexColor = `#${string}`

// When StreamsTemplateString is used by a component it is a string
export type StreamsTemplateString = string
// A StreamsTemplateString is represented within Studio as either a template string or StreamDataPath
export type StreamsTemplatePath = `\`${string}\``

// When StreamsData is used by a component it can be any streams document property
export type StreamsData<T = unknown> = T
// StreamsData is represented within studio as a StreamsDataPath
export type StreamsDataPath = `document.${string}`

export const specialTypesArray = ['HexColor', 'StreamsTemplateString', 'StreamsData']

