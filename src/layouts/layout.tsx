import { PropsWithChildren } from 'react';
import { SearchHeadlessProvider } from '@yext/search-headless-react'

export default function Layout(props: PropsWithChildren<{}>) {
  return (
    <SearchHeadlessProvider {...{
      apiKey: '2d8c550071a64ea23e263118a2b0680b',
      locale: 'en',
      experienceKey: 'slanswers'
    }}>
      {props.children}
    </SearchHeadlessProvider>
  )
}