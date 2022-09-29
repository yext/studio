import { ComponentState } from '../../shared/models'
import { useStudioContext } from './useStudioContext'

export function getComponentState(
  uuid: string,
  componentsState: ComponentState[]
): ComponentState | undefined {
  return componentsState.find(c => c.uuid === uuid)
}

export function getComponentStateOrThrow(
  uuid: string,
  componentsState: ComponentState[]
): ComponentState {
  const state = getComponentState(uuid, componentsState)
  if (!state) {
    throw new Error('Could not find ComponentState for uuid: ' + uuid)
  }
  return state
}

export function useActiveComponentStateOrThrow(): ComponentState | null {
  const { activeComponentUUID, activeComponentsState } = useStudioContext()
  console.log(activeComponentUUID, activeComponentsState)
  const activeComponentState = activeComponentUUID
    ? getComponentStateOrThrow(activeComponentUUID, activeComponentsState)
    : null
  return activeComponentState
}