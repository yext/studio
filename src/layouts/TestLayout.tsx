import { PropsWithChildren } from 'react';
import { AnswersHeadlessProvider } from '@yext/answers-headless-react'

export default function TestLayout(props: PropsWithChildren<{}>) {
  return (
    <div>
        <p className='text-white bg-violet-600 text-center'>This is a Test Layout!</p>
        <AnswersHeadlessProvider {...{
          apiKey: '2d8c550071a64ea23e263118a2b0680b',
          locale: 'en',
          experienceKey: 'slanswers'
        }}>
        {props.children}
      </AnswersHeadlessProvider>
    </div>
  )
}