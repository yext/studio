export type PageComponentsState = {
  name: string,
  props: Record<string, number | string | boolean>
}[]

export type TSPropMetadata = {
  type: 'string' | 'number' | 'boolean',
  doc?: string
}

export type TSPropShape = Record<string, TSPropMetadata>