import { CustomEventMap as BuiltInViteEvents } from 'vite'
import { PageState, PropState } from './models'

export enum MessageID {
  UpdatePageComponentProps = 'studio:UpdatePageComponentProps',
  UpdateSiteSettingsProps = 'studio:UpdateSiteSettingsProps'
}

export interface StudioEventMap extends BuiltInViteEvents {
  [MessageID.UpdatePageComponentProps]: {
    state: PageState,
    pageFile: 'index.tsx'
  },
  [MessageID.UpdateSiteSettingsProps]: {
    state: PropState,
    path: 'src/siteSettings.ts'
  }
}

export type ResponseEventMap = BuiltInViteEvents & {
  [key in MessageID]: {
    type: 'success' | 'error',
    msg: string
  }
}
