import { DndContext, DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import DraggablePropEditor from './DraggablePropEditor'
import { useStudioContext } from './useStudioContext'
import { useEffect, useMemo, useState } from 'react'
import CustomPointerSensor from '../dragAndDrop/CustomPointerSensor'
import { ComponentMetadata, PropState } from '../../shared/models'
import PropEditor from './PropEditor'

export default function DraggablePropEditorList() {
  const { pageState, setPageState, moduleNameToComponentMetadata } = useStudioContext()
  const [listState, setListState] = useState(pageState.componentsState)

  // Update the listState if any other component adds or removes components
  useEffect(() => {
    if (pageState.componentsState.length !== listState.length) {
      setListState(pageState.componentsState)
    }
  }, [pageState.componentsState, listState.length])

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
    setPageState({
      ...pageState,
      componentsState: updatedListState
    })
  }

  const componentNames = useMemo(() => {
    const names =
      Object.values(moduleNameToComponentMetadata)
        .flatMap(nameToMetadata => Object.keys(nameToMetadata))
    return new Set(names)
  }, [moduleNameToComponentMetadata])

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
            const copy = [...pageState.componentsState]
            const i = copy.findIndex(c => c.uuid === uuid)
            copy[i].props = val
            setPageState({
              ...pageState,
              componentsState: copy
            })
          }
          if (!componentNames.has(c.name)) {
            // console.error('unknown component', c.name, 'gracefully skipping for now.')
            return null
          }
          const componentMetadata: ComponentMetadata = moduleNameToComponentMetadata[c.moduleName][c.name]
          return componentMetadata.global
            ? (<div key={c.uuid} className='border-4 border-black m-2 px-2 py-2'>
              <PropEditor
                propState={c.props}
                setPropState={setPropState}
                componentMetadata={componentMetadata}
              />
            </div>)
            : (<DraggablePropEditor
              uuid={c.uuid}
              key={c.uuid}
              propState={c.props}
              componentMetadata={componentMetadata}
              setPropState={setPropState}
            />)
        })}
      </SortableContext>
    </DndContext>
  )
}
