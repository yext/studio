import { PropsWithChildren } from 'react';
import { provideHeadless, SearchHeadlessProvider } from '@yext/search-headless-react'

const config = {
  apiKey: '2d8c550071a64ea23e263118a2b0680b',
  locale: 'en',
  experienceKey: 'slanswers'
}
const searcher = provideHeadless(config);

export default function TestLayout(props: PropsWithChildren<{}>) {
  return (
    <div>
      <p className='text-white bg-violet-600 text-center'>This is a Test Layout!</p>
      <SearchHeadlessProvider searcher={searcher}>
        {props.children}
      </SearchHeadlessProvider>
    </div>
  )
}