import { MessageID, ResponseEventMap } from "@yext/studio-plugin"
import { useEffect } from "react"
import registerMessageListener from "../messaging/registerMessageListener"

export default function useMessageListener<T extends MessageID>(
  messageID: T,
  cb: (payload: ResponseEventMap[T]) => void
) {
  useEffect(() => {
    let isUnmounted = false
    registerMessageListener(messageID, (payload) => {
      if (isUnmounted) return
      cb(payload)
    })
    return () => { isUnmounted = true }
  }, [cb, messageID])
}