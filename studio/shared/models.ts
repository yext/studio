import studioConfig from '../../src/studio'
import { PropStateTypes, PropTypes } from '../types'

export type PageState = {
  layoutState: ComponentState,
  componentsState: ComponentState[]
}

export interface ComponentState {
  name: string,
  props: PropState,
  uuid: string,
  moduleName: PossibleModuleNames | 'builtIn'
}

export type PropState = {
  [propName: string]: PropStateTypes
}

export type ModuleNameToComponentMetadata = {
  [moduleName in PossibleModuleNames]: ModuleMetadata
}
export type PossibleModuleNames = keyof typeof studioConfig['npmComponents'] | 'localComponents' | 'localLayouts'
export type ModuleMetadata = {
  [componentName: string]: ComponentMetadata
}

export type ComponentMetadata = StandardComponentMetaData | GlobalComponentMetaData
type CommonComponentMetaData = {
  propShape?: PropShape,
  editable: boolean,
  importIdentifier: string
}
export type StandardComponentMetaData = {
  global: false,
  initialProps?: PropState
} & CommonComponentMetaData
export type GlobalComponentMetaData = {
  global: true,
  globalProps?: PropState
} & CommonComponentMetaData

export type PropShape = {
  [propName: string]: PropMetadata
}
export type PropMetadata = {
  type: PropTypes,
  doc?: string
}
