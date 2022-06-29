import { PropsWithChildren } from 'react';

export default function Layout(props: PropsWithChildren<{}>) {
  return (
    <div>{props.children}</div>
  )
}