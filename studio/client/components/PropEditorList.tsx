import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Dispatch, SetStateAction, useState, forwardRef, ReactNode } from 'react';
import DraggablePropEditor from './DraggablePropEditor';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { PageComponentsState } from '../../shared/models';
import { useStudioContext } from './useStudioContext';
import { PropState } from './PropEditor';

export default function PropEditorList() {
  const { pageComponentsState, setPageComponentsState, componentsToPropShapes } = useStudioContext()
  const items = pageComponentsState.map(c => c.uuid)
  const setItems = updatedOrder => {
    updatedOrder = typeof updatedOrder === 'function' ? updatedOrder(items) : updatedOrder
    const updatedState = updatedOrder.map(uuid => {
      return pageComponentsState.find(c => c.uuid === uuid)
    }) as PageComponentsState
    setPageComponentsState(updatedState)
  }

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

  return (
    <DndContext
      // sensors={sensors}
      // collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {pageComponentsState.map(c => {
          const uuid = c.uuid;
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

          return <DraggablePropEditor uuid={c.uuid} key={c.uuid} propState={c.props} propShape={componentsToPropShapes[c.name]} setPropState={setPropState}/>
        })}
      </SortableContext>
    </DndContext>
  );

  function handleDragEnd(event) {
    console.log('handleDragEnd', event)
    const { active, over } = event;

    if (active.id !== over.id) {
      console.log('setting items')
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        console.log(arrayMove(items, oldIndex, newIndex))

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}
