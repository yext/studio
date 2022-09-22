import { ComponentState, JsxElementState } from '../../shared/models'

export function getComponentState(
  uuid: string,
  componentsState: JsxElementState[]
): JsxElementState | undefined {
  return componentsState.find(c => c.uuid === uuid)
}

export function getComponentStateOrThrow(
  uuid: string,
  componentsState: JsxElementState[]
): JsxElementState {
  const state = getComponentState(uuid, componentsState)
  if (!state) {
    throw new Error('Could not find ComponentState for uuid: ' + uuid)
  }
  return state
}