import classNames from 'classnames'
import { isEqual } from 'lodash'
import { useCallback, useRef } from 'react'
import { ComponentState, PageState } from '../../shared/models'
import findComponentState from '../utils/findComponentState'
import CustomContextMenu from './CustomContextMenu'
import { useStudioContext } from './useStudioContext'

export default function ComponentTree() {
  const { pageState, } = useStudioContext()

  return (
    <div>
      {pageState.componentsState.map(c => <ComponentNode c={c} key={c.uuid} />)}
    </div>
  )
}

function ComponentNode({ c }: { c: ComponentState }) {
  const ref = useRef<HTMLDivElement>(null)
  const {
    activeComponentState,
    setActiveComponentState,
    pageStateOnFile,
    moduleNameToComponentMetadata
  } = useStudioContext()
  const activeComponentUUID = activeComponentState?.uuid

  const updateActiveComponent = useCallback(() => {
    if (activeComponentUUID !== c.uuid) {
      setActiveComponentState(c)
    } else {
      setActiveComponentState(undefined)
    }
  }, [activeComponentUUID, c, setActiveComponentState])

  const className = classNames('flex border-solid border-2 ', {
    'border-indigo-600': activeComponentUUID === c.uuid,
    'border-transparent': activeComponentUUID !== c.uuid
  })

  const isGlobal = moduleNameToComponentMetadata.localComponents[c.name].global

  return (
    <div
      key={c.uuid}
      className='cursor-pointer select-none ml-4'
    >
      <div
        className={className}
        ref={ref}
        onClick={updateActiveComponent}
      >
        {!isGlobal && <CustomContextMenu elementRef={ref} componentUUID={c.uuid} />}
        {c.name}
        {hasUnsavedChanges(c, pageStateOnFile) && <div className='red'>*</div>}
      </div>
      {c.children?.map(c => <ComponentNode c={c} key={c.uuid}/>)}
    </div>
  )
}

function hasUnsavedChanges(componentState: ComponentState, pageStateOnFile: PageState) {
  const initialComponentState = findComponentState(componentState, pageStateOnFile.componentsState)
  return !isEqual(componentState.props, initialComponentState?.props)
}