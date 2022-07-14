import { SpecialTypes } from '../types'

export type PageComponentsState = {
  name: string,
  props: Record<string, number | string | boolean | SpecialTypes>
  uuid: string
}[]

export type TSPropType = 'string' | 'number' | 'boolean' | 'HexColor'

export type TSPropMetadata = {
  type: TSPropType,
  doc?: string
}

export type TSPropShape = Record<string, TSPropMetadata>
