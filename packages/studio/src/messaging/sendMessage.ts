import { MessageID, ResponseEventMap, StudioEventMap } from "@yext/studio-plugin";
import { v4 } from 'uuid';

type ListenerMap = {
  [uuid: string]: (payload: ResponseEventMap[MessageID]) => void
}

const messageIdToPendingMessages = Object.keys(MessageID).reduce((listeners, messageID) => {
  listeners[messageID] = {} as ListenerMap;
  return listeners;
}, {} as Record<MessageID, ListenerMap>);

console.log(messageIdToPendingMessages)

Object.keys(MessageID).forEach((messageId) => {
  import.meta.hot?.on(messageId, (payload: ResponseEventMap[MessageID]) => {
    const listenerMap = messageIdToPendingMessages[messageId];
    const callback = listenerMap[payload.uuid];
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
  const listenerMap: ListenerMap = messageIdToPendingMessages[messageId];
  console.log({ listenerMap })
  return new Promise((resolve, reject) => {
    listenerMap[uuid] = (payload) => {
      if (payload.type === 'success') {
        resolve(payload.msg);
      } else {
        reject(payload.msg);
      }
    }
  })
}
