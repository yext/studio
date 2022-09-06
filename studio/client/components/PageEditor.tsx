import { ComponentMetadata, ComponentState, PropState } from '../../shared/models'
import PropEditor from './PropEditor'
import { useStudioContext } from './useStudioContext'

export function PageEditor(): JSX.Element | null {
  const { pageState, setPageState, moduleNameToComponentMetadata, activeComponentUUID } = useStudioContext()
  const activeComponentState: ComponentState | undefined =
    pageState.componentsState.find(c => c.uuid === activeComponentUUID)

  if (!activeComponentState) {
    return null
  }

  const setPropState = (val: PropState) => {
    const copy = [...pageState.componentsState]
    const i = copy.findIndex(c => c.uuid === activeComponentUUID)
    copy[i].props = val
    setPageState({
      ...pageState,
      componentsState: copy
    })
  }
  const componentMetadata: ComponentMetadata =
    moduleNameToComponentMetadata[activeComponentState.moduleName][activeComponentState.name]

  return <PropEditor
    propState={activeComponentState.props}
    setPropState={setPropState}
    componentMetadata={componentMetadata}
  />
}
