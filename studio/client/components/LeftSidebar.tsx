import ComponentTree from './ComponentTree'
import AddComponentButton from './AddComponentButton'
import StreamDocPicker from './StreamDocPicker'
import SaveButton from './SaveButton'
import { useStudioContext } from './useStudioContext'
import { useCallback } from 'react'
import { ComponentStateType, ComponentState } from '../../shared/models'
import { getComponentStateOrThrow, useActiveComponentStateOrThrow } from './getComponentState'
import SymbolEditor from './SymbolEditor'

export default function LeftSidebar() {
  const activeComponentState = useActiveComponentStateOrThrow()
  const { activeSymbolName } = useStudioContext()

  return (
    <div className='w-1/5 flex flex-grow flex-col bg-slate-500'>
      {activeSymbolName ? <SymbolEditor /> : renderForComponent()}
      <SaveButton />
    </div>
  )
}

const renderForComponent = () => {
  return <>
    <StreamDocPicker />
    <AddComponentButton />
    <ComponentTree />
  </>
}

