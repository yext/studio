import { DndContext, DragEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DraggablePropEditor from './DraggablePropEditor'
import { PageComponentsState } from '../../shared/models'
import { useStudioContext } from './useStudioContext'
import { PropState } from './PropEditor'
import { useState } from 'react';

export default function PropEditorList() {
  const { pageComponentsState, setPageComponentsState, componentsToPropShapes } = useStudioContext()
  const [listState, setListState] = useState(pageComponentsState)
  const items = listState.map(c => c.uuid)

  function getUpdatedListState({ active, over }: DragEvent) {
    if (over?.id && active.id !== over.id) {
      const oldIndex = listState.findIndex(c => c.uuid === active.id)
      const newIndex = listState.findIndex(c => c.uuid === over.id)
      const updatedListState = arrayMove(listState, oldIndex, newIndex)
      return updatedListState
    }
  }

  function handleDragEnd(event: DragEvent) {
    const updatedListState = getUpdatedListState(event)
    if (!updatedListState) {
      return
    }
    setListState(updatedListState)
  }

  function handleDragOver(event: DragEvent) {
    const updatedListState = getUpdatedListState(event)
    if (!updatedListState) {
      return
    }
    setPageComponentsState(updatedListState)
  }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(uuid => {
          const c = pageComponentsState.find(c => c.uuid === uuid)

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
