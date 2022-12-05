import { CustomEventMap } from 'vite'
import { PageState, PropState } from './models'

export enum MessageID {
  UpdatePageComponentProps = 'studio:UpdatePageComponentProps',
  UpdateSiteSettingsProps = 'studio:UpdateSiteSettingsProps',
  TEST = 'studio:thisisatest'
}

export interface StudioEventMap extends CustomEventMap {
  [MessageID.UpdatePageComponentProps]: {
    state: PageState,
    pageFile: 'index.tsx'
  },
  [MessageID.UpdateSiteSettingsProps]: {
    state: PropState,
    path: 'src/siteSettings.ts'
  }
}

export type ResponseEventMap = CustomEventMap & {
  [key in MessageID]: {
    type: 'success' | 'error',
    msg: string
  }
}
