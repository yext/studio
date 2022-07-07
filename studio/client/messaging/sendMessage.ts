import { MessageID, StudioEventMap } from '../../shared/messages'

export default function sendMessage(
  messageId: MessageID,
  payload: StudioEventMap[typeof messageId]
) {
  import.meta.hot?.send(messageId, payload)
}