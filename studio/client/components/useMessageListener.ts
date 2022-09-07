import { useEffect } from 'react'
import { MessageID, ResponseEventMap } from '../../shared/messages'

type MessageListener = (payload: ResponseEventMap[MessageID]) => void
type ListenerOptions = {
  onSuccess?: MessageListener,
  onError?: MessageListener
}

export default function useMessageListener(messageID: MessageID, options: ListenerOptions) {
  useEffect(() => {
    let isUnmounted = false
    const payloadHandler = (payload: ResponseEventMap[MessageID]) => {
      if (isUnmounted) return
      if (payload.type === 'error') {
        options.onError?.(payload)
        console.error(payload.msg)
      } else {
        options.onSuccess?.(payload)
      }
    }
    import.meta.hot?.on(messageID, payloadHandler)
    return () => { isUnmounted = true }
  }, [options, messageID])

}