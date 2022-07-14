import { PropsWithChildren } from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {
  UniqueIdentifier
} from '@dnd-kit/core';
import PropEditor, { PropEditorProps } from './PropEditor';

interface DraggablePropEditorProps extends PropEditorProps {
  uuid: string
}

export default function DraggablePropEditor(props: DraggablePropEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef
  } = useSortable({id: props.uuid})

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} >
      <PropEditor {...props}/>
      <button ref={setActivatorNodeRef} {...listeners} {...attributes}>drag me!</button>
    </div>
  )
}