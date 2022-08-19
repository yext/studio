import { ViteDevServer, WebSocketCustomListener, WebSocketClient } from 'vite'
import { MessageID, StudioEventMap, ResponseEventMap } from '../shared/messages'
import updatePageFile from './ts-morph/updatePageFile'
import updateSiteSettingsFile from './ts-morph/updateSiteSettingsFile'
import getPagePath from './getPagePath'

export default function configureStudioServer(server: ViteDevServer) {
  /** Register a listener for the given messageId, infer it's payload type, and perform error handling */
  function registerListener<T extends MessageID>(
    messageId: T,
    listener: (data: StudioEventMap[typeof messageId]) => string
  ) {
    const handleRes: WebSocketCustomListener<StudioEventMap[typeof messageId]> = (data, client) => {
      try {
        const msg = listener(data)
        sendClientMsg(client, messageId, { type: 'success', msg })
      } catch (e: any) {
        const msg = e.toString()
        console.error(e)
        sendClientMsg(client, messageId, { type: 'error', msg })
      }
    }
    server.ws.on(messageId, handleRes)
  }

  registerListener(MessageID.UpdatePageComponentProps, data => {
    const pagePath = getPagePath(data.pageFile)
    updatePageFile(data.state, pagePath)
    return 'successfully edited: ' + pagePath
  })

  registerListener(MessageID.UpdateSiteSettingsProps, data => {
    updateSiteSettingsFile(data.state, data.path)
    return 'successfully edited: ' + data.path
  })
}

function sendClientMsg(
  client: WebSocketClient,
  messageId: MessageID,
  payload: ResponseEventMap[typeof messageId]
) {
  client.send(messageId, payload)
}
