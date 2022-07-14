import { SpecialTypes } from '../types'

export type PageComponentsState = {
  name: string,
  props: PropState
  uuid: string
}[]

export type PropState = Record<string, string | number | boolean | SpecialTypes>

export type TSPropMetadata = {
  type: TSPropType,
  doc?: string
}

export type TSPropType = 'string' | 'number' | 'boolean' | 'HexColor'

export type TSPropShape = Record<string, TSPropMetadata>
