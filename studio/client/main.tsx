import React from 'react'
import Studio from './components/Studio'
import Toast from './components/Toast'
import { createRoot } from 'react-dom/client'

import '@yext/search-ui-react/bundle.css'

//@ts-ignore TODO what's the best way to handle typescript and virtual modules? global.d.ts file?
import virtualStudioContext from 'virtual:yext-studio'

import '../../dist/output.css'

export function Main() {
  return (
    <>
      <Toast />
      <Studio {...virtualStudioContext} />
    </>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)