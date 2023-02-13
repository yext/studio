import {
  MessageID,
  ResponseEventMap,
  StudioEventMap,
} from "@yext/studio-plugin";
import { v4 } from "uuid";

/**
 * A map of pending message UUID to its Promise resolution callback for
 * the Promise returned by {@link sendMessage}.
 */
type ListenerMap = {
  [uuid: string]: (payload: ResponseEventMap[MessageID]) => void;
};

/**
 * A mapping of MessageID to ListenerMap.
 */
const messageIdToPendingMessages = Object.values(MessageID).reduce(
  (listeners, messageID) => {
    listeners[messageID] = {} as ListenerMap;
    return listeners;
  },
  {} as Record<MessageID, ListenerMap>
);
Object.values(MessageID).forEach((messageID) => {
  import.meta.hot?.on(messageID, (payload: ResponseEventMap[MessageID]) => {
    const callback = messageIdToPendingMessages[messageID][payload.uuid];
    if (callback) {
      callback(payload);
    }
  });
});

/**
 * Send a message to the backend, e.g. to save changes to file or deploy changes.
 *
 * @returns A Promise that will be resolved once a response is received from the server.
 */
export default async function sendMessage<T extends MessageID>(
  messageId: T,
  payload: StudioEventMap[T]
): Promise<string> {
  const uuid = v4();
  import.meta.hot?.send(messageId, {
    uuid,
    payload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return new Promise((resolve, reject) => {
    const listenerMap: ListenerMap = messageIdToPendingMessages[messageId];
    listenerMap[uuid] = (payload) => {
      if (payload.type === "success") {
        resolve(payload.msg);
      } else {
        reject(payload.msg);
      }
    };
  });
}
