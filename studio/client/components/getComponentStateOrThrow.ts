import { ComponentState } from '../../shared/models'

export default function getComponentStateOrThrow(
  uuid: string,
  componentsState: ComponentState[]
): ComponentState {
  const state: ComponentState | undefined = componentsState.find(c => c.uuid === uuid)
  if (!state) {
    throw new Error('Could not find ComponentState for uuid: ' + uuid)
  }
  return state
}