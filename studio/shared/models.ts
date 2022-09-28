import { PropStateTypes, PropTypes } from '../types'

export type PageState = {
  layoutState: ComponentState,
  componentsState: JsxElementState[]
}

export type JsxElementState = ComponentState | SymbolState
export enum ElementStateType {
  Component = 'component',
  Symbol = 'symbol'
}
export type ComponentState = {
  type?: ElementStateType.Component
  name: string,
  props: PropState,
  uuid: string,
  moduleName: PossibleModuleNames,
  isFragment?: true,
  parentUUID?: string
}
export type SymbolState = {
  type: ElementStateType.Symbol
  name: string,
  props: {},
  uuid: string,
  parentUUID?: string
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
  content: JsxElementState[]
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
