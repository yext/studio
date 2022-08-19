import studioConfig from '../../src/studio'
import { HexColor, StreamsDataPath, StreamsTemplatePath } from '../types'

export type PageState = {
  layoutState: ComponentState,
  componentsState: ComponentState[]
}
export interface ComponentState<PS extends PropShape = Record<string, never>> {
  name: string,
  props: PropState<typeof uuid>,
  uuid: string,
  moduleName: PossibleModuleNames | 'builtIn'
}

class ConcreteComponentState {
  constructor(
    public name: string,
    public props: PropState,
    public uuid: string,
    public moduleName: PossibleModuleNames | 'builtIn'
  ){}
}
const bob = new ConcreteComponentState(
  'Banner',
  {},
  '1',
  'localComponents'
)

type PropTypeToStudioStateType<PT extends PropType> =
  PT extends 'number' ? number :
    PT extends 'string' ? string :
      PT extends 'boolean' ? boolean :
        PT extends 'HexColor' ? HexColor :
          PT extends 'StreamsData' ? StreamsDataPath :
            PT extends 'StreamsTemplateString' ? StreamsTemplatePath : never
// export type PropState<S extends PropShape> = {
//   [propName in keyof S]?: PropTypeToStudioStateType<S[propName]['type']>
// }
export type PropState = Record<string, string | number | boolean>

class TComponentMetadata {
  constructor() {

  }
}

export type ModuleNameToComponentMetadata = {
  [moduleName in PossibleModuleNames]: ModuleMetadata
}
export type PossibleModuleNames = keyof typeof studioConfig['npmComponents'] | 'localComponents' | 'localLayouts'
export type ModuleMetadata = {
  [componentName: string]: ComponentMetadata
}
export type ComponentMetadata<PS extends PropShape> = {
  propShape?: PS,
  initialProps?: PropState<PS>,
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
export type PropType = 'string' | 'number' | 'boolean' | 'HexColor' | 'StreamsTemplateString' | 'StreamsData'

