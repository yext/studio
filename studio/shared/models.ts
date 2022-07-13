import { SpecialTypes } from '../types'

export type PageComponentsState = {
  name: string,
  props: Record<string, number | string | boolean | SpecialTypes>
}[]

export type TSPropMetadata = {
  type: string | number | boolean | SpecialTypes,
  doc?: string
}

export type TSPropShape = Record<string, TSPropMetadata>
