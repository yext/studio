import { ViteDevServer, WebSocketCustomListener } from 'vite'
import { MessageID, StudioEventMap } from '../shared/messages'
import getRootPath from './getRootPath'
import updatePageFile from './ts-morph/updatePageFile'

export default function configureStudioServer(server: ViteDevServer) {
  /** Register a listener for the given messageId, infer it's payload type, and perform error handling */
  function registerListener(
    messageId: MessageID,
    listener: WebSocketCustomListener<StudioEventMap[typeof messageId]>
  ) {
    server.ws.on(messageId, (data, client) => {
      try {
        listener(data, client)
      } catch (e: any) {
        if (e?.toString && typeof e.toString === 'function') {
          client.send(messageId, e.toString())
        } else {
          client.send(messageId, 'An unknown error occurred')
        }
      }
    })
  }

  registerListener(MessageID.UpdatePageComponentProps, (data, client) => {
    const fullFilePath = getRootPath('src/pages/index.tsx')
    updatePageFile(data)
    client.send(MessageID.UpdatePageComponentProps, 'successfully edited: ' + fullFilePath)
  })
}
