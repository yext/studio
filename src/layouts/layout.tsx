import { PropsWithChildren } from 'react';
import { AnswersHeadlessProvider } from '@yext/answers-headless-react'

export default function Layout(props: PropsWithChildren<{}>) {
  return (
    <AnswersHeadlessProvider {...{
      apiKey: '2d8c550071a64ea23e263118a2b0680b',
      locale: 'en',
      experienceKey: 'slanswers'
    }}>
      {props.children}
    </AnswersHeadlessProvider>
  )
}