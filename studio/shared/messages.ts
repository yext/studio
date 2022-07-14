import { CustomEventMap } from 'vite'
import { PageComponentsState } from './models'

export enum MessageID {
  UpdatePageComponentProps = 'studio:UpdatePageComponentProps',
  UpdateSiteSettingsProps = 'studio:UpdateSiteSettingsProps'
}

export interface StudioEventMap extends CustomEventMap {
  [MessageID.UpdatePageComponentProps]: {
    state: PageComponentsState,
    path: 'src/pages/index.tsx'
  }
}

export type ResponseEventMap = CustomEventMap & {
  [key in MessageID]: {
    type: 'success' | 'error',
    msg: string
  }
}