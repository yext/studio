import AddComponentButton from './AddComponentButton'
import ComponentTree from './ComponentTree'
import SaveButton from './SaveButton'
import StreamDocPicker from './StreamDocPicker'
import SymbolEditor from './SymbolEditor'
import { useStudioContext } from './useStudioContext'

export default function LeftSidebar() {
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

