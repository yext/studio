import ComponentTree from './ComponentTree'
import AddComponentButton from './AddComponentButton'
import StreamDocPicker from './StreamDocPicker'
import SaveButton from './SaveButton'
import App from './minoru/App'

export default function LeftSidebar() {
  return (
    // <div className='w-1/5 flex flex-grow flex-col bg-slate-500'>
    //   <StreamDocPicker/>
      // <AddComponentButton />
      <>
        {/* <ComponentTree/> */}
        <App/>
      </>
      // <SaveButton/>
    // </div>
  )
}