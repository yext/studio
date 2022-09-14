import { ComponentState } from '../../shared/models';
import { useStudioContext } from './useStudioContext';

export default function getComponentStateOrThrow(
  uuid: string,
  uuidToComponentState: Record<string, ComponentState>
): ComponentState {
  const state: ComponentState | undefined = uuidToComponentState[uuid]
  if (!state) {
    throw new Error('Could not find ComponentState for uuid: ' + uuid)
  }
  return state
}