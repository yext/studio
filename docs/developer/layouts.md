# Layouts

Layout support is a WIP. Currently, Studio is hardcoded to use the `src/layouts/Layout.tsx` file as the layout for the page.
The only restriction on a layout is that it needs to have `props.children` as props. Here is an example layout.

```tsx
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
```