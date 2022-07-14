import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import PropEditor, { PropEditorProps } from './PropEditor'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'

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
  } = useSortable({ id: props.uuid })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    border: 'white 4px solid',
    borderRadius: '4px',
    margin: '8px',
    padding: '8px 4px'
  }

  return (
    <div ref={setNodeRef} style={style}>
      <PropEditor {...props}/>
      <button ref={setActivatorNodeRef} {...listeners} {...attributes} className='flex-grow'>
        <DragIndicatorIcon sx={{ fontSize: 40 }}/>
      </button>
    </div>
  )
}