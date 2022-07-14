import PropEditor from './PropEditor'
import sendMessage from '../messaging/sendMessage'
import { MessageID } from '../../shared/messages'
import AddComponentButton from './AddComponentButton'
import { useStudioContext } from './useStudioContext'
import DndropEditorList from './DndPropEditorList'

export function PageEditor(): JSX.Element {
  const { pageComponentsState } = useStudioContext()
  return (
    <>
      <AddComponentButton />
      <DndropEditorList />
      <button className='btn' onClick={() => sendMessage(MessageID.UpdatePageComponentProps, {
        path: 'src/pages/index.tsx',
        state: pageComponentsState
      })}>
        Update Component Props
      </button>
    </>
  )
}
