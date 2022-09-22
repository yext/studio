import { PropStateTypes, PropTypes } from '../types'

export type PageState = {
  layoutState: ComponentState,
  componentsState: ComponentState[]
}

export type ComponentState = {
  name: string,
  props: PropState,
  uuid: string,
  moduleName: PossibleModuleNames,
  isFragment?: true,
  parentUUID?: string
} | SymbolState
type SymbolState = {
  uuid: string,
  symbolUUID: string
}

export type PropState = {
  [propName: string]: PropStateTypes
}

export type ModuleNameToComponentMetadata = {
  [moduleName in PossibleModuleNames]: ModuleMetadata
}
export type PossibleModuleNames = 'localComponents' | 'localLayouts' | 'builtIn'
export type ModuleMetadata = {
  [componentName: string]: ComponentMetadata
}

export type SymbolMetadata = {
  content: ComponentS
}

export type ComponentMetadata = StandardComponentMetaData | GlobalComponentMetaData
type CommonComponentMetaData = {
  propShape?: PropShape,
  editable: boolean,
  importIdentifier: string,
  acceptsChildren: boolean
}
export type StandardComponentMetaData = {
  global?: false,
  initialProps?: PropState
} & CommonComponentMetaData
export type GlobalComponentMetaData = {
  global: true,
  globalProps?: PropState
} & CommonComponentMetaData

export enum SpecialReactProps {
  Children = 'children'
}
export type PropShape = Omit<{
  [propName: string]: PropMetadata
}, SpecialReactProps> & {
  [propName in SpecialReactProps]?: never
}
export type PropMetadata = {
  type: PropTypes,
  doc?: string
}
