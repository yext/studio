import { useStudioContext } from './useStudioContext'
import sendMessage from '../messaging/sendMessage'
import { MessageID } from '../../shared/messages'
import { cloneDeep, isEqual } from 'lodash'
import { useMemo } from 'react'
import useMessageListener from './useMessageListener'

export default function SaveButton() {
  const { pageState, pageStateOnFile, setPageStateOnFile } = useStudioContext()

  const listenerOpts = useMemo(() => ({
    onSuccess: () => setPageStateOnFile(cloneDeep(pageState))
  }), [pageState, setPageStateOnFile])
  useMessageListener(MessageID.UpdatePageComponentProps, listenerOpts)

  if (isEqual(pageState, pageStateOnFile)) {
    return null
  }

  return (
    <button className='btn' onClick={() => {
      sendMessage(MessageID.UpdatePageComponentProps, {
        pageFile: 'index.tsx',
        state: pageState
      })
    }}>
      Save Changes
    </button>
  )
}