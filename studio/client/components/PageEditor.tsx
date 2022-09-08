import { ComponentMetadata, PropState } from '../../shared/models'
import findComponentState from '../utils/findComponentState'
import iterateOverComponentsState from '../utils/iterateOverComponentsState'
import PropEditor from './PropEditor'
import { useStudioContext } from './useStudioContext'

export function PageEditor(): JSX.Element | null {
  const { pageState, setPageState, moduleNameToComponentMetadata, activeComponentState } = useStudioContext()
  if (!activeComponentState) {
    return null
  }

  const componentMetadata: ComponentMetadata =
    moduleNameToComponentMetadata[activeComponentState.moduleName][activeComponentState.name]

  const setPropState = (val: PropState) => {
    // TODO(oshi): we cannot use cloneDeep here over the spread operator.
    // If we do then activeComponentState will get out of sync and point to a ComponentState BEFORE the clone.
    // We should probably switch to using Redux instead of simple Context since the state is becoming complex.
    const copy = [...pageState.componentsState]
    if (componentMetadata.global) {
      // update propState for other instances of the same global functional component
      iterateOverComponentsState(copy, c => {
        if (c.name === activeComponentState.name) {
          c.props = val
        }
      })
    } else {
      const c = findComponentState(activeComponentState, copy)
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
    propState={activeComponentState.props}
    setPropState={setPropState}
    componentMetadata={componentMetadata}
  />
}
