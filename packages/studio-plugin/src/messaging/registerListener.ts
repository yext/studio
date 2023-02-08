import { ViteDevServer, WebSocketCustomListener, WebSocketClient } from "vite";
import { MessageID, ResponseEventMap, StudioEventMap } from "../types";

type WebSocketListener<T extends MessageID> = WebSocketCustomListener<{
  payload: StudioEventMap[T],
  uuid: string
}>

/**
 * Registers a listener for the given messageId,
 * and handle response from server back to client.
 */
export function registerListener<T extends MessageID>(
  server: ViteDevServer,
  messageId: T,
  listener: (data: StudioEventMap[T]) => string | Promise<string>
) {
  const handleRes: WebSocketListener<T> = async (
    data,
    client
  ) => {
    try {
      const msg = await listener(data.payload);
      sendClientMessage(client, messageId, { type: "success", msg, uuid: data.uuid });
    } catch (error: unknown) {
      let msg = `Error occurred for event ${messageId}`;
      if (typeof error === "string") {
        msg = error.toString();
      } else if (error instanceof Error) {
        msg = error.message;
      }
      console.error(error);
      sendClientMessage(client, messageId, { type: "error", msg, uuid: data.uuid });
    }
  };
  server.ws.on(messageId, handleRes);
}

function sendClientMessage<T extends MessageID>(
  client: WebSocketClient,
  messageId: T,
  payload: ResponseEventMap[T]
) {
  client.send(messageId, payload);
}
