import { SpecialTypes } from '../types'

export type PageComponentsState = {
  name: string,
  props: Record<string, number | string | boolean | SpecialTypes>
}[]

export type TSPropShape = Record<string, string | number | boolean | SpecialTypes>