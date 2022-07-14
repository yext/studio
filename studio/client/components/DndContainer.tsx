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
import SortableItem from './SortableItem';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

export default function DndContainer(props: {
  items: string[],
  setItems: Dispatch<SetStateAction<string[]>>
  renderItem: (id: string) => ReactNode
}) {
  const { items, setItems, renderItem } = props

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {props.items.map(id => (
          <SortableItem id={id} key={id}>
            {renderItem(id)}
          </SortableItem>)
        )}
      </SortableContext>
    </DndContext>
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        console.log(arrayMove(items, oldIndex, newIndex))

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}
