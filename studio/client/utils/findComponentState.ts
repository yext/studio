import { ComponentState } from '../../shared/models'

export default function findComponentState(
  componentStateToFind: Pick<ComponentState, 'uuid' | 'parentUUIDsFromRoot' | 'props'>,
  componentsState: ComponentState[]
): ComponentState | undefined {
  let parentComponentState: ComponentState | undefined
  for (const uuid of componentStateToFind.parentUUIDsFromRoot ?? []) {
    parentComponentState = getComponentState(uuid)
    if (!parentComponentState) {
      console.error(
        'Unable to find parent uuid', uuid, 'for parentUUIDsFromRoot', componentStateToFind.parentUUIDsFromRoot)
      return undefined
    }
  }
  return getComponentState(componentStateToFind.uuid)

  function getComponentState(uuid: string) {
    return parentComponentState?.children?.find(c => c.uuid === uuid) ??
      componentsState.find(c => c.uuid === uuid)
  }
}