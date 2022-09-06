import { useStudioContext } from './useStudioContext'
import sendMessage from '../messaging/sendMessage'
import { MessageID } from '../../shared/messages'
import { isEqual } from 'lodash'

export default function SaveButton() {
  const { pageState, initialPageState } = useStudioContext()

  if (isEqual(pageState, initialPageState)) {
    return null
  }

  return (
    <button className='btn' onClick={() => sendMessage(MessageID.UpdatePageComponentProps, {
      pageFile: 'index.tsx',
      state: pageState
    })}>
      Save Changes
    </button>
  )
}