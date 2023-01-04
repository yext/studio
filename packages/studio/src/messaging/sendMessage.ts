import { MessageID, StudioEventMap } from "@yext/studio-plugin";

export default function sendMessage<T extends MessageID>(
  messageId: T,
  payload: StudioEventMap[T]
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import.meta.hot?.send(messageId, payload as any)
}