import { ComponentState } from '../../shared/models'

type Handler = (c: ComponentState) => void

export default function iterateOverComponentsState(
  componentsState: ComponentState[],
  handler: Handler
): void {
  componentsState.forEach(c => handleComponentState(c, handler))
}

function handleComponentState(componentState: ComponentState, handler: Handler) {
  handler(componentState)
  if (componentState.children) {
    iterateOverComponentsState(componentState.children, handler)
  }
}