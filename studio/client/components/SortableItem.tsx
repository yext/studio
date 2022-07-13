import { PropsWithChildren } from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {
  UniqueIdentifier
} from '@dnd-kit/core';

export default function SortableItem(props: PropsWithChildren<{
  id: UniqueIdentifier
}>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </li>
  );
}