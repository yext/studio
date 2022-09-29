import { ComponentMetadata, ElementStateType, PropState } from '../../shared/models'
import ComponentTree from './ComponentTree'
import { getComponentStateOrThrow } from './getComponentState'
import PropEditor from './PropEditor'
import { useStudioContext } from './useStudioContext'

export function PageEditor(): JSX.Element | null {
  const { activeComponentsState, setActiveComponentsState, moduleNameToComponentMetadata, activeComponentUUID, symbolNameToMetadata } = useStudioContext()
  if (!activeComponentUUID) {
    return null
  }
  const activeComponentState = getComponentStateOrThrow(activeComponentUUID, activeComponentsState)
  if (activeComponentState.type === ElementStateType.Symbol) {
    console.log(activeComponentState, symbolNameToMetadata)
    return (
      <div>
        TODO - display content tree
      </div>
    )
  }
  const { name, moduleName, props } = activeComponentState

  const componentMetadata: ComponentMetadata =
    moduleNameToComponentMetadata[moduleName][name]

  const setPropState = (val: PropState) => {
    // TODO(oshi): we cannot use cloneDeep here over the spread operator.
    // If we do then activeComponentState will get out of sync and point to a ComponentState BEFORE the clone.
    // We should probably switch to using Redux instead of simple Context since the state is becoming complex.
    const componentsStateShallowCopy = [...activeComponentsState]
    if (componentMetadata.global) {
      // update propState for other instances of the same global functional component
      componentsStateShallowCopy.forEach(c => {
        if (c.name === name) {
          c.props = val
        }
      })
    } else {
      const c = getComponentStateOrThrow(activeComponentUUID, componentsStateShallowCopy)
      if (c) {
        c.props = val
      }
    }
    setActiveComponentsState(componentsStateShallowCopy)
  }
  return <PropEditor
    propState={props}
    setPropState={setPropState}
    componentMetadata={componentMetadata}
  />
}
