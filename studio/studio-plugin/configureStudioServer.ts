import { ViteDevServer } from 'vite';

export default function configureStudioServer(server: ViteDevServer) {
  server.ws.on('my:from-client', (data, client) => {
    console.log('Message from client:', data.msg) // Hey!
    // reply only to the client (if needed)
    client.send('my:ack', { msg: 'Hi! I got your message!' })
  })
}