if (import.meta.hot) {
  import.meta.hot.on('my:ack', (data) => {
    console.log('my:ack', data.msg)
  })
}

export function sendFromClient() {
  import.meta.hot?.send('my:from-client', { msg: 'Hey!' })
}