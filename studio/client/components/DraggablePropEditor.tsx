import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCallback, useEffect, useRef, useState } from 'react'
import PropEditor, { PropEditorProps } from './PropEditor'
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu'
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

  const { pageComponentsState, setPageComponentsState } = useStudioContext()
  const [contextMenuAnchor, setContextMenuAnchor] = useState({ x: 0, y: 0 })
  const [contextMenuProps, toggleContextMenu] = useMenuState()
  const ref = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setContextMenuAnchor({ x: e.x, y: e.y })
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
    return (() => {
      if (element) {
        element.removeEventListener(
          'contextmenu',
          handleContextMenu
        )
      }
    })
  }, [handleContextMenu])

  function deleteComponent() {
    setPageComponentsState(pageComponentsState.filter(element => {
      return element.uuid !== props.uuid
    }))
  }

  return (
    <div ref={ref}>
      <ControlledMenu
        {...contextMenuProps}
        anchorPoint={contextMenuAnchor}
        onClose={() => toggleContextMenu(false)}
      >
        <MenuItem
          onClick={deleteComponent}
          className='px-3 py-1 rounded-md bg-white select-none cursor-pointer'
        >
          Delete
        </MenuItem>
      </ControlledMenu>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <PropEditor {...props} />
      </div>
    </div>
  )
}
