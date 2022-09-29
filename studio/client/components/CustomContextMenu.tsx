import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu'
import { RefObject, useCallback, useEffect, useState } from 'react'
import { useStudioContext } from './useStudioContext'

export default function CustomContextMenu(props: {
  componentUUID: string,
  elementRef: RefObject<HTMLElement>
}) {
  const { activeComponentsState, setActiveComponentsState } = useStudioContext()
  const [contextMenuAnchor, setContextMenuAnchor] = useState({ x: 0, y: 0 })
  const [contextMenuProps, toggleContextMenu] = useMenuState()

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault()
    setContextMenuAnchor({ x: e.x, y: e.y })
    toggleContextMenu(true)
  }, [setContextMenuAnchor, toggleContextMenu])

  useEffect(() => {
    const element: HTMLElement | null = props.elementRef.current
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
  }, [handleContextMenu, props.elementRef])

  function deleteComponent() {
    setActiveComponentsState(activeComponentsState.filter(c => {
      return c.uuid !== props.componentUUID
    }))
  }

  return (
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
  )
}