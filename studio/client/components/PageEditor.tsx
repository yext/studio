import { ComponentMetadata, PropState } from '../../shared/models'
import getComponentStateOrThrow from './getComponentStateOrThrow'
import PropEditor from './PropEditor'
import { useStudioContext } from './useStudioContext'

export function PageEditor(): JSX.Element | null {
  const { pageState, setPageState, moduleNameToComponentMetadata, activeComponentUUID } = useStudioContext()
  if (!activeComponentUUID) {
    return null
  }
  const { moduleName, name, props } = getComponentStateOrThrow(activeComponentUUID, pageState.componentsState)

  const componentMetadata: ComponentMetadata =
    moduleNameToComponentMetadata[moduleName][name]

  const setPropState = (val: PropState) => {
    // TODO(oshi): we cannot use cloneDeep here over the spread operator.
    // If we do then activeComponentState will get out of sync and point to a ComponentState BEFORE the clone.
    // We should probably switch to using Redux instead of simple Context since the state is becoming complex.
    const copy = [...pageState.componentsState]
    if (componentMetadata.global) {
      // update propState for other instances of the same global functional component
      copy.forEach(c => {
        if (c.name === name) {
          c.props = val
        }
      })
    } else {
      const c = getComponentStateOrThrow(activeComponentUUID, copy)
      if (c) {
        c.props = val
      }
    }
    setPageState({
      ...pageState,
      componentsState: copy
    })
  }
  return <PropEditor
    propState={props}
    setPropState={setPropState}
    componentMetadata={componentMetadata}
  />
}
