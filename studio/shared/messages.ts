import { CustomEventMap as BuiltInViteEvents } from 'vite'
import { ComponentMetadata, ComponentState, PageState, PropShape, PropState } from './models'

export enum MessageID {
  UpdatePageComponentProps = 'studio:UpdatePageComponentProps',
  UpdateSiteSettingsProps = 'studio:UpdateSiteSettingsProps',
  CreateComponent = 'studio:CreateComponent'
}

export interface StudioEventMap extends BuiltInViteEvents {
  [MessageID.UpdatePageComponentProps]: {
    state: PageState,
    pageFile: 'index.tsx'
  },
  [MessageID.UpdateSiteSettingsProps]: {
    state: PropState,
    path: 'src/siteSettings.ts'
  },
  [MessageID.CreateComponent]: {
    name: string,
    propShape: PropShape,
    acceptsChildren: boolean,
    childrenStates: ComponentState[]
  }
}

export type ResponseEventMap = BuiltInViteEvents & {
  [key in MessageID]: {
    type: 'success' | 'error',
    msg: string
  }
}
