import { ComponentState } from '../../shared/models'

export default function findComponentState(
  componentStateToFind: Pick<ComponentState, 'uuid' | 'parentUUIDsFromRoot' | 'props'>,
  componentsState: ComponentState[]
): ComponentState | undefined {
  let parentComponentState: ComponentState | undefined
  const uuids = [...componentStateToFind.parentUUIDsFromRoot ?? [], componentStateToFind.uuid]
  for (const uuid of uuids) {
    parentComponentState = getComponentState(uuid)
    if (!parentComponentState) {
      return undefined
    }
  }
  return parentComponentState

  function getComponentState(uuid: string) {
    return parentComponentState?.children?.find(c => c.uuid === uuid) ??
      componentsState.find(c => c.uuid === uuid)
  }
}