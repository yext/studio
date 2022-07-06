import React from 'react'
import { Studio } from './components/Studio'
import SSRProvider from 'react-bootstrap/SSRProvider'
import { createRoot } from 'react-dom/client'

//@ts-ignore TODO what's the best way to handle typescript and virtual modules? global.d.ts file?
import virtualStudioContext from 'virtual:yext-studio'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../dist/output.css'

export function Main() {
  return (
    <React.StrictMode>
      <SSRProvider>
        <Studio {...virtualStudioContext} />
      </SSRProvider>
    </React.StrictMode>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
