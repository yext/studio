import { ComponentState, JsxElementState } from '../../shared/models'
import { useStudioContext } from './useStudioContext'

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

export function useActiveComponentStateOrThrow(): JsxElementState | null {
  const { activeComponentUUID, pageState } = useStudioContext()
  const activeComponentState = activeComponentUUID
    ? getComponentStateOrThrow(activeComponentUUID, pageState.componentsState)
    : null
  return activeComponentState
}