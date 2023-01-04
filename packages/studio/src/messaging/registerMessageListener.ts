import { MessageID, ResponseEventMap } from "@yext/studio-plugin"

export default function registerMessageListener<T extends MessageID>(
  messageID: T,
  cb: (payload: ResponseEventMap[T]) => void
) {
  import.meta.hot?.on(messageID, cb)
}