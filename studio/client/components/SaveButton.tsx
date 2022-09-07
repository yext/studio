import { useStudioContext } from './useStudioContext'
import sendMessage from '../messaging/sendMessage'
import { MessageID } from '../../shared/messages'
import { cloneDeep, isEqual } from 'lodash'

export default function SaveButton() {
  const { pageState, pageStateOnFile, setPageStateOnFile } = useStudioContext()

  if (isEqual(pageState, pageStateOnFile)) {
    return null
  }

  return (
    <button className='btn' onClick={() => {
      sendMessage(MessageID.UpdatePageComponentProps, {
        pageFile: 'index.tsx',
        state: pageState
      })
      setPageStateOnFile(cloneDeep(pageState))
    }}>
      Save Changes
    </button>
  )
}