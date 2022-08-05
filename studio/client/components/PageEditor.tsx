import sendMessage from '../messaging/sendMessage'
import { MessageID } from '../../shared/messages'
import AddComponentButton from './AddComponentButton'
import { useStudioContext } from './useStudioContext'
import DndropEditorList from './DraggablePropEditorList'

export function PageEditor(): JSX.Element {
  const { pageComponentsState } = useStudioContext()
  return (
    <>
      <AddComponentButton />
      <DndropEditorList />
      <button className='btn' onClick={() => sendMessage(MessageID.UpdatePageComponentProps, {
        pageFile: 'index.tsx',
        state: pageComponentsState
      })}>
        Update Component Props
      </button>
    </>
  )
}
