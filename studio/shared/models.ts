import { SpecialTypes } from '../types'
import studioConfig from '../../src/studio'

// Page state
export type PageState = {
  layoutState: ComponentState,
  componentsState: ComponentState[]
}
export interface ComponentState {
  name: string,
  props: PropState,
  uuid: string,
  moduleName: PossibleModuleNames
}

export type PropState = Record<string, string | number | boolean | SpecialTypes>

// Component prop shapes/other metadata
export type ModuleNameToComponentMetadata = {
  [moduleName in PossibleModuleNames]: ModuleMetadata
}
export type PossibleModuleNames = keyof typeof studioConfig['npmComponents'] | 'localComponents'
export type ModuleMetadata = {
  [componentName: string]: ComponentMetadata
}
export type ComponentMetadata = {
  propShape?: PropShape,
  initialProps?: PropState,
  editable: boolean,
  importIdentifier: string
}
export type PropShape = {
  [propName: string]: PropMetadata
}
export type PropMetadata = {
  type: PropType,
  doc?: string
}
export type PropType = 'string' | 'number' | 'boolean' | 'HexColor'

