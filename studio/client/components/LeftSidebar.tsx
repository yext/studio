import ComponentTree from './ComponentTree'
import AddComponentButton from './AddComponentButton'
import StreamDocPicker from './StreamDocPicker'
import SaveButton from './SaveButton'
import { useStudioContext } from './useStudioContext'
import { useCallback } from 'react'
import { JsxElementState } from '../../shared/models'

export default function LeftSidebar() {
  const { pageState, setPageState } = useStudioContext()
  const setComponentsState = useCallback((componentsState: JsxElementState[]) => {
    setPageState({
      ...pageState,
      componentsState
    })
  }, [pageState, setPageState])
  return (
    <div className='w-1/5 flex flex-grow flex-col bg-slate-500'>
      <StreamDocPicker/>
      <AddComponentButton />
      <ComponentTree componentsState={pageState.componentsState} setComponentsState={setComponentsState}/>
      <SaveButton/>
    </div>
  )
}