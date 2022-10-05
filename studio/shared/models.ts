import { PropStateTypes, PropTypes } from '../types'

export type PageState = {
  layoutState: RegularComponentState,
  componentsState: ComponentState[]
}

export type ComponentState = RegularComponentState | SymbolState
export enum ComponentStateType {
  Regular = 'regular',
  Symbol = 'symbol'
}
export type RegularComponentState = {
  type?: ComponentStateType.Regular,
  name: string,
  props: PropState,
  uuid: string,
  moduleName: string,
  isFragment?: true,
  parentUUID?: string
}
export type SymbolState = {
  type: ComponentStateType.Symbol,
  name: string,
  props: Record<string, never>,
  uuid: string,
  parentUUID?: string
}

export type PropState = {
  [propName: string]: PropStateTypes
}

export type ModuleNameToComponentMetadata = {
  [moduleName in InternalModuleNames]: ModuleMetadata
} & {
  [npmModuleName: string]: ModuleMetadata
}

export enum InternalModuleNames {
  LocalComponents = 'localComponents',
  LocalLayouts = 'localLayouts',
  BuiltIn = 'builtIn'
}

export interface ModuleMetadata {
  cssImports?: string[],
  components: Record<string, ComponentMetadata>
}

export type SymbolMetadata = {
  content: ComponentState[]
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
