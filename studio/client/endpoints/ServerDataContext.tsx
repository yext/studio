import { createContext } from 'react'

export function sendFromClient() {
  import.meta.hot?.send('my:from-client', { msg: 'Hey!' })
}

// const ServerDataContext = createContext();