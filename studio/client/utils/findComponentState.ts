import { ComponentState } from '../../shared/models'

export default function findComponentState(
  componentStateToFind: Pick<ComponentState, 'uuid' | 'parentUUIDsFromRoot' | 'props'>,
  componentsState: ComponentState[]
): ComponentState | undefined {
  let initialComponentState: ComponentState | undefined
  componentStateToFind.parentUUIDsFromRoot?.forEach(uuid => {
    initialComponentState = getComponentState(uuid)
  })
  return getComponentState(componentStateToFind.uuid)

  function getComponentState(uuid: string) {
    return initialComponentState?.children?.find(c => c.uuid === uuid) ??
      componentsState.find(c => c.uuid === uuid)
  }
}