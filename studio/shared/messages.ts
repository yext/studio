import { CustomEventMap } from 'vite'
import { PageComponentsState } from './models'

export enum MessageID {
  UpdatePageComponentProps = 'studio:UpdatePageComponentProps'
}

export interface StudioEventMap extends CustomEventMap {
  [MessageID.UpdatePageComponentProps]: PageComponentsState
}