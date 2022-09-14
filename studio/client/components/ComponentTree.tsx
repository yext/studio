import classNames from 'classnames'
import { isEqual } from 'lodash'
import { useCallback, useRef } from 'react'
import { ComponentState, PageState } from '../../shared/models'
import CustomContextMenu from './CustomContextMenu'
import getComponentStateOrThrow from './getComponentStateOrThrow'
import { useStudioContext } from './useStudioContext'

export default function ComponentTree() {
  const { pageState } = useStudioContext()

  return (
    <div>
      {pageState.componentsState.map(c => <ComponentNode componentState={c} key={c.uuid} />)}
    </div>
  )
}

function ComponentNode({ componentState }: { componentState: ComponentState }) {
  const ref = useRef<HTMLDivElement>(null)
  const {
    activeComponentUUID,
    setActiveComponentUUID,
    pageStateOnFile,
    moduleNameToComponentMetadata,
    pageState
  } = useStudioContext()

  const updateActiveComponent = useCallback(() => {
    if (activeComponentUUID !== componentState.uuid) {
      setActiveComponentUUID(componentState.uuid)
    } else {
      setActiveComponentUUID(undefined)
    }
  }, [activeComponentUUID, componentState.uuid, setActiveComponentUUID])

  const className = classNames('flex border-solid border-2 ', {
    'border-indigo-600': activeComponentUUID === componentState.uuid,
    'border-transparent': activeComponentUUID !== componentState.uuid
  })

  const isGlobal = moduleNameToComponentMetadata.localComponents[componentState.name].global

  return (
    <div
      key={componentState.uuid}
      className='cursor-pointer select-none ml-4'
    >
      <div
        className={className}
        ref={ref}
        onClick={updateActiveComponent}
      >
        {!isGlobal && <CustomContextMenu elementRef={ref} componentUUID={componentState.uuid} />}
        {componentState.name}
        {hasUnsavedChanges(componentState, pageStateOnFile) && <div className='red'>*</div>}
      </div>
      {pageState.componentsState.filter(c => c.parentUUID === componentState.uuid).map(c => {
        return <ComponentNode componentState={c} key={c.uuid}/>
      })}
    </div>
  )
}

function hasUnsavedChanges(componentState: ComponentState, pageStateOnFile: PageState) {
  const initialComponentState: ComponentState | undefined = pageStateOnFile.uuidToComponentState[componentState.uuid]
  return !isEqual(componentState.props, initialComponentState?.props)
}