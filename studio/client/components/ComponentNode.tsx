import classNames from 'classnames'
import { isEqual } from 'lodash'
import { useRef, useCallback } from 'react'
import { ComponentState, PageState } from '../../shared/models'
import CustomContextMenu from './CustomContextMenu'
import { getComponentState } from './getComponentState'
import { useStudioStore } from './Studio'
import { useStudioContext } from './useStudioContext'
// import { useComponentsStore, usePagesStore } from './Studio'

interface ComponentNodeProps {
  componentState: ComponentState,
  /** The below are props from {@link RenderParams} */
  depth: number,
  isOpen: boolean,
  hasChild: boolean,
  onToggle(): void,
  isDropTarget: boolean
}

export default function ComponentNode(props: ComponentNodeProps) {
  const {
    depth,
    isOpen,
    hasChild,
    componentState,
    onToggle,
    isDropTarget
  } = props

  const ref = useRef<HTMLDivElement>(null)
  const {
    pageStateOnFile
  } = useStudioContext()

  const moduleNameToComponentMetadata = useStudioStore(s => s.modules.moduleNameToMetadata)
  const [activeComponentUUID, setActiveComponentUUID] = useStudioStore(s => [s.pages.activeComponentUUID, s.pages.setActiveComponentUUID])

  const updateActiveComponent = useCallback(() => {
    if (activeComponentUUID !== componentState.uuid) {
      setActiveComponentUUID(componentState.uuid)
    } else {
      setActiveComponentUUID(undefined)
    }
  }, [activeComponentUUID, componentState.uuid, setActiveComponentUUID])

  const className = classNames('flex border-solid border-2 cursor-grab select-none p-2', {
    'border-indigo-600': activeComponentUUID === componentState.uuid,
    'border-transparent': activeComponentUUID !== componentState.uuid,
    'bg-lime-100': isDropTarget
  })

  const moduleMetadata = moduleNameToComponentMetadata[componentState.moduleName]
  const isGlobal = moduleMetadata.components[componentState.name].global

  return (
    <div
      key={componentState.uuid}
      className={className}
      style={{ marginLeft: `${depth}em` }}
      ref={ref}
      onClick={updateActiveComponent}
    >
      {!isGlobal && <CustomContextMenu elementRef={ref} componentUUID={componentState.uuid} />}
      {componentState.name} {componentState.uuid.substring(0, 3)}
      {hasUnsavedChanges(componentState, pageStateOnFile) && <div className='red'>*</div>}
      {hasChild && <div className='cursor-pointer' onClick={onToggle}>&nbsp;{isOpen ? '[-]' : '[+]'}</div>}
    </div>
  )
}

function hasUnsavedChanges(componentState: ComponentState, pageStateOnFile: PageState) {
  const initialComponentState: ComponentState | undefined =
    getComponentState(componentState.uuid, pageStateOnFile.componentsState)
  return !isEqual(componentState.props, initialComponentState?.props)
}
