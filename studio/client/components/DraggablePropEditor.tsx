import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCallback, useEffect, useRef, useState } from 'react'
import PropEditor, { PropEditorProps } from './PropEditor'
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu'
// just for temporary styling
import '@szhsin/react-menu/dist/core.css';
import { useStudioContext } from './useStudioContext'

interface DraggablePropEditorProps extends PropEditorProps {
  uuid: string
}

export default function DraggablePropEditor(props: DraggablePropEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
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

  const [contextMenuAnchor, setContextMenuAnchor] = useState({ x: 0, y: 0 })
  const [contextMenuProps, toggleContextMenu] = useMenuState()

  const ref = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setContextMenuAnchor({ x: e.pageX, y: e.pageY })
    toggleContextMenu(true)
  }, [setContextMenuAnchor, toggleContextMenu])

  useEffect(() => {
    const element: HTMLDivElement | null = ref.current
    if (element) {
      element.addEventListener(
        'contextmenu',
        handleContextMenu
      )
    }
  })

  const { pageComponentsState, setPageComponentsState } = useStudioContext()
  function deleteComponent() {
    setPageComponentsState(pageComponentsState.filter((element) => {
      return element.uuid !== props.uuid
    }))
  }

  return (
    <div ref={ref}>
      <ControlledMenu {...contextMenuProps} anchorPoint={contextMenuAnchor}
        onClose={() => toggleContextMenu(false)}>
        <MenuItem onClick={deleteComponent}>
          Delete
        </MenuItem>
      </ControlledMenu>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <PropEditor {...props} />
      </div>
    </div>
  )
}
