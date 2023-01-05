import { MessageID, ResponseEventMap } from "@yext/studio-plugin"

export type ListenerCallbackFn<T extends MessageID> = (payload: ResponseEventMap[T]) => void

export default function registerMessageListener<T extends MessageID>(
  messageID: T,
  cb: ListenerCallbackFn<T>
) {
  import.meta.hot?.on(messageID, cb)
}