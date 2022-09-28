import ComponentTree from './ComponentTree'
import AddComponentButton from './AddComponentButton'
import StreamDocPicker from './StreamDocPicker'
import SaveButton from './SaveButton'
import { useStudioContext } from './useStudioContext'
import { useCallback } from 'react'
import { ElementStateType, JsxElementState } from '../../shared/models'
import { getComponentStateOrThrow, useActiveComponentStateOrThrow } from './getComponentState'
import SymbolEditor from './SymbolEditor'

export default function LeftSidebar() {
  const activeComponentState = useActiveComponentStateOrThrow()

  return (
    <div className='w-1/5 flex flex-grow flex-col bg-slate-500'>
      {activeComponentState?.type === ElementStateType.Symbol ? renderForSymbol() : renderForComponent()}
      <SaveButton />
    </div>
  )
}

const renderForComponent = () => {
  const { pageState, setPageState } = useStudioContext()

  const setComponentsState = useCallback((componentsState: JsxElementState[]) => {
    setPageState({
      ...pageState,
      componentsState
    })
  }, [pageState, setPageState])
  return <>
    <StreamDocPicker />
    <AddComponentButton />
    <ComponentTree componentsState={pageState.componentsState} setComponentsState={setComponentsState} />
  </>
}

const renderForSymbol = () => {
  const { setActiveComponentUUID } = useStudioContext()

  return <>
    <button className='btn' onClick={() => setActiveComponentUUID(undefined)}>return to full component tree</button>
    <SymbolEditor/>
  </>
}
