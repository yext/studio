import { MessageID, ResponseEventMap, StudioEventMap } from "@yext/studio-plugin";
import { v4 } from 'uuid';

type ListenerMap = {
  [uuid: string]: (payload: ResponseEventMap[MessageID]) => void
}

const messageIdToPendingMessages = Object.values(MessageID).reduce((listeners, messageID) => {
  listeners[messageID] = {} as ListenerMap;
  return listeners;
}, {} as Record<MessageID, ListenerMap>);

Object.values(MessageID).forEach((messageID) => {
  import.meta.hot?.on(messageID, (payload: ResponseEventMap[MessageID]) => {
    const callback = messageIdToPendingMessages[messageID][payload.uuid];
    console.log(messageIdToPendingMessages, callback, messageID, payload.uuid)
    callback(payload);
  })
})

export default async function sendMessage<T extends MessageID>(
  messageId: T,
  payload: StudioEventMap[T]
): Promise<string> {
  const uuid = v4();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import.meta.hot?.send(messageId, {
    uuid,
    payload: payload 
  } as any);

  return new Promise((resolve, reject) => {
    const listenerMap = messageIdToPendingMessages[messageId as MessageID]
    listenerMap[uuid] = (payload) => {
      if (payload.type === 'success') {
        resolve(payload.msg);
      } else {
        reject(payload.msg);
      }
    }
    console.log(messageIdToPendingMessages)
  })
}
