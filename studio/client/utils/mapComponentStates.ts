import { ComponentState } from '../../shared/models'

type Handler<T> = (c: ComponentState, mappedChildren: T[], index: number) => T

/**
 * Performs an Array.prototype.map over the given {@link ComponentState}s in order of depth, starting
 * with the leaf nodes and working up.
 */
export default function mapComponentStates<T>(
  componentStates: ComponentState[],
  handler: Handler<T>,
  parent?: ComponentState
): T[] {
  return componentStates.filter(c => c.parentUUID === parent?.uuid).map((c, i) => {
    const children = mapComponentStates(componentStates, handler, c)
    return handler(c, children, i)
  })
}
