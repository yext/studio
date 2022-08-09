import sendMessage from '../messaging/sendMessage'
import { MessageID } from '../../shared/messages'
import AddComponentButton from './AddComponentButton'
import { useStudioContext } from './useStudioContext'
import DndropEditorList from './DraggablePropEditorList'

export function PageEditor(): JSX.Element {
  const { pageState } = useStudioContext()
  return (
    <>
      <AddComponentButton />
      <DndropEditorList />
      <button className='btn' onClick={() => sendMessage(MessageID.UpdatePageComponentProps, {
        path: 'src/pages/index.tsx',
        state: pageState
      })}>
        Update Component Props
      </button>
    </>
  )
}
