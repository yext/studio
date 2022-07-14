import PropEditor, { PropState } from './PropEditor'
import { useStudioContext } from './useStudioContext'
import DndContainer from './DndContainer'
import { PageComponentsState } from '../../shared/models'

export default function PropEditors() {
  const { pageComponentsState, setPageComponentsState, componentsToPropShapes } = useStudioContext()
  const items = pageComponentsState.map(c => c.uuid)
  
  return (
    <DndContainer
      items={items}
      setItems={updatedOrder => {
        updatedOrder = typeof updatedOrder === 'function' ? updatedOrder(items) : updatedOrder
        const updatedState = updatedOrder.map(uuid => pageComponentsState.find(c => c.uuid === uuid)) as PageComponentsState
        setPageComponentsState(updatedState)
      }}
      renderItem={uuid => {
        const c = pageComponentsState.find(c => c.uuid === uuid)
        if (!c) {
          console.error('couldnt find component with uuid:', uuid)
          return null
        }

        const setPropState = (val: PropState) => {
          const copy = [...pageComponentsState]
          const i = copy.findIndex(c => c.uuid === uuid)
          copy[i].props = val
          setPageComponentsState(copy)
        }
        if (!(c.name in componentsToPropShapes)) {
          console.error('unknown component', c.name, 'gracefully skipping for now.')
          return null
        }

        return (
          <PropEditor
            key={uuid}
            propShape={componentsToPropShapes[c.name]}
            propState={c.props}
            setPropState={setPropState}
          />
        )
      }}
    />
  )
}
