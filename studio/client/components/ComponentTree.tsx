import classNames from 'classnames'
import { isEqual } from 'lodash'
import { useCallback, useRef } from 'react'
import { ComponentState, PageState } from '../../shared/models'
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

  const className = classNames('flex cursor-pointer select-none border-solid border-2 ml-4', {
    'border-indigo-600': activeComponentUUID === c.uuid,
    'border-transparent': activeComponentUUID !== c.uuid
  })

  const isGlobal = moduleNameToComponentMetadata.localComponents[c.name].global

  return (
    <div
      ref={ref}
      key={c.uuid}
      className={className}
      onClick={updateActiveComponent}
    >
      {!isGlobal && <CustomContextMenu elementRef={ref} componentUUID={c.uuid} />}
      {c.name}
      {hasUnsavedChanges(c, pageStateOnFile) && <div className='red'>*</div>}
    </div>
  )
}

function hasUnsavedChanges(c: ComponentState, pageStateOnFile: PageState) {
  const initialProps = pageStateOnFile.componentsState.find(({ uuid }) => uuid === c.uuid)?.props
  return !isEqual(c.props, initialProps)
}