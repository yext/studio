import { DndContext, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import DraggablePropEditor from './DraggablePropEditor'
import { useStudioContext } from './useStudioContext'
import { PropState } from './PropEditor'
import { useState } from 'react'

export default function PropEditorList() {
  const { pageComponentsState, setPageComponentsState, componentsToPropShapes } = useStudioContext()
  const [listState, setListState] = useState(pageComponentsState)
  const items = listState.map(c => c.uuid)

  function getUpdatedListState(activeId: string, overId: string ) {
    const oldIndex = listState.findIndex(c => c.uuid === activeId)
    const newIndex = listState.findIndex(c => c.uuid === overId)
    const updatedListState = arrayMove(listState, oldIndex, newIndex)
    return updatedListState
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over?.id || active.id === over.id) {
      return
    }
    const updatedListState = getUpdatedListState(active.id as string, over.id as string)
    setListState(updatedListState)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over?.id) {
      return
    }
    const updatedListState = getUpdatedListState(active.id as string, over.id as string)
    setPageComponentsState(updatedListState)
  }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {listState.map(c => {
          const uuid = c.uuid

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
            <DraggablePropEditor
              uuid={c.uuid}
              key={c.uuid}
              propState={c.props}
              propShape={componentsToPropShapes[c.name]}
              setPropState={setPropState}
            />
          )
        })}
      </SortableContext>
    </DndContext>
  )
}
