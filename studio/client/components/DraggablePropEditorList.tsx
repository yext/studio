import { DndContext, DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import DraggablePropEditor from './DraggablePropEditor'
import { useStudioContext } from './useStudioContext'
import { useEffect, useState } from 'react'
import CustomPointerSensor from '../dragAndDrop/CustomPointerSensor'
import { PropState } from '../../shared/models'

export default function DraggablePropEditorList() {
  const { pageComponentsState, setPageComponentsState, componentsToPropShapes } = useStudioContext()
  const [listState, setListState] = useState(pageComponentsState)

  // Update the listState if any other component adds or removes components
  useEffect(() => {
    if (pageComponentsState.length !== listState.length) {
      setListState(pageComponentsState)
    }
  }, [pageComponentsState, listState.length])

  function getUpdatedListState(activeId: UniqueIdentifier, overId: UniqueIdentifier ) {
    const oldIndex = listState.findIndex(c => c.uuid === activeId)
    const newIndex = listState.findIndex(c => c.uuid === overId)
    const updatedListState = arrayMove(listState, oldIndex, newIndex)
    return updatedListState
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      return
    }
    const updatedListState = getUpdatedListState(active.id, over.id)
    setListState(updatedListState)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) {
      return
    }
    const updatedListState = getUpdatedListState(active.id, over.id)
    setPageComponentsState(updatedListState)
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      sensors={[{ sensor: CustomPointerSensor, options: {} }]}
    >
      <SortableContext items={listState.map(c => c.uuid)} strategy={verticalListSortingStrategy}>
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
