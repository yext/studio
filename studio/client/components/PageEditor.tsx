import { ComponentMetadata, ComponentState, PropState } from '../../shared/models'
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
    const copy = [...pageState.componentsState]
    if (componentMetadata.global) {
      // update propState for other instances of the same global functional component
      copy.forEach((c, i) => {
        if (c.name === activeComponentState.name) {
          copy[i].props = val
        }
      })
    } else {
      const i = copy.findIndex(c => c.uuid === activeComponentState.uuid)
      copy[i].props = val
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
