import ComponentTree from './ComponentTree'
import AddComponentButton from './AddComponentButton'
import StreamDocPicker from './StreamDocPicker'
import SaveButton from './SaveButton'

export default function LeftSidebar() {
  return (
    <div className='w-1/5 flex flex-grow flex-col bg-slate-500'>
      <StreamDocPicker/>
      <AddComponentButton />
      <ComponentTree/>
      <SaveButton/>
    </div>
  )
}