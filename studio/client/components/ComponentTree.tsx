import classNames from 'classnames'
import { isEqual } from 'lodash'
import { useRef } from 'react'
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
    activeComponentUUID,
    setActiveComponentUUID,
    pageStateOnFile,
    moduleNameToComponentMetadata
  } = useStudioContext()

  const updateActiveComponent = (uuid: string) => {
    if (activeComponentUUID !== uuid) {
      setActiveComponentUUID(uuid)
    } else {
      setActiveComponentUUID(undefined)
    }
  }
  const className = classNames('flex cursor-pointer select-none border-solid border-2', {
    'border-indigo-600': activeComponentUUID === c.uuid,
    'border-transparent': activeComponentUUID !== c.uuid
  })

  const isGlobal = moduleNameToComponentMetadata.localComponents[c.name].global

  return (
    <div
      ref={ref}
      key={c.uuid}
      className={className}
      onClick={() => updateActiveComponent(c.uuid)}
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