import { ComponentMetadata, PropState } from '../../shared/models'
import { getComponentStateOrThrow } from './getComponentState'
import PropEditor from './PropEditor'
import { useStudioStore } from './Studio'
import { useStudioContext } from './useStudioContext'
// import { useComponentsStore, usePagesStore } from './Studio'

export function PageEditor(): JSX.Element | null {
  const moduleNameToComponentMetadata = useStudioStore(s => s.modules.moduleNameToMetadata)
  const [pageState, setPageState] = useStudioStore(s => [s.pages.getActivePageState(), s.pages.setActivePageState])
  const activeComponentUUID = useStudioStore(s => s.pages.activeComponentUUID)
  const updateActiveComponentProps = useStudioStore(s => s.pages.setActiveComponentProps)
  if (!activeComponentUUID) {
    return null
  }
  const { moduleName, name, props } = getComponentStateOrThrow(activeComponentUUID, pageState.componentsState)

  const componentMetadata: ComponentMetadata =
    moduleNameToComponentMetadata[moduleName].components[name]

  const setPropState = (val: PropState) => {
    // TODO(oshi): we cannot use cloneDeep here over the spread operator.
    // If we do then activeComponentState will get out of sync and point to a ComponentState BEFORE the clone.
    // We should probably switch to using Redux instead of simple Context since the state is becoming complex.
    const componentsStateShallowCopy = [...pageState.componentsState]
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
    setPageState({
      ...pageState,
      componentsState: componentsStateShallowCopy
    })
  }
  return <PropEditor
    propState={props}
    setPropState={updateActiveComponentProps}
    componentMetadata={componentMetadata}
  />
}
