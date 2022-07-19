import React, { useEffect, useState } from 'react'
import Studio from './components/Studio'
import Toast from './components/Toast'
import { createRoot } from 'react-dom/client'
// import { SearchBar } from '@yext/answers-react-components'
import { AnswersHeadlessProvider } from '@yext/answers-headless-react'

import '@yext/answers-react-components/bundle.css'

//@ts-ignore TODO what's the best way to handle typescript and virtual modules? global.d.ts file?
import virtualStudioContext from 'virtual:yext-studio'

import '../../dist/output.css'

const promise = import('@yext/answers-react-components')

export function Main() {
  const [Comp, setComp] = useState<any>(null)

  useEffect(() => {
    (async () => {
      const { SearchBar } = await promise
      setComp(() => SearchBar)
      // console.log(SearchBar({}))
    })()
  }, [])

  console.log('comp', Comp)
  return (
    <>
      <Toast />
      <Studio {...virtualStudioContext} />
      <AnswersHeadlessProvider {...{
        apiKey: '2d8c550071a64ea23e263118a2b0680b',
        locale: 'en',
        experienceKey: 'slanswers'
      }}>
        {Comp && <Comp {...{}}/>}
      </AnswersHeadlessProvider>
    </>
  )
}

// import(`@yext/answers-react-components`).then(module => {
//   console.log(module)
// })

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
