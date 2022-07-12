export type PageComponentsState = {
  name: string,
  props: Record<string, number | string | boolean>
}[]

export type TSPropShape = Record<string, 'string' | 'number' | 'boolean'>