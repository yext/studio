import { ViteDevServer, WebSocketCustomListener, WebSocketClient } from 'vite'
import { MessageID, ResponseEventMap, StudioEventMap } from './types'
import FileSystemManager from './FileSystemManager'

export default function configureStudioServer(
  server: ViteDevServer,
  fileSystemManager: FileSystemManager
  ) {
  registerListener(server, MessageID.StudioCommitChanges, data => {
    fileSystemManager.updateFileSystem(data)
    return 'Changes saved successfully.'
  })
}

/**
 * Registers a listener for the given messageId,
 * and handle response from server back to client.
 */
function registerListener<T extends MessageID>(
  server: ViteDevServer,
  messageId: T,
  listener: (data: StudioEventMap[T]) => string
) {
  const handleRes: WebSocketCustomListener<StudioEventMap[T]> = (data, client) => {
    try {
      const msg = listener(data)
      sendClientMessage(client, messageId, { type: 'success', msg })
    } catch (error: unknown) {
      let msg = `Error occurred for event ${messageId}`;
      if (typeof error === "string") {
        msg = error.toString()
      } else if (error instanceof Error) {
        msg = error.message
      }
      console.error(error)
      sendClientMessage(client, messageId, { type: 'error', msg })
    }
  }
  server.ws.on(messageId, handleRes)
}

function sendClientMessage<T extends MessageID>(
  client: WebSocketClient,
  messageId: T,
  payload: ResponseEventMap[T]
) {
  client.send(messageId, payload)
}
