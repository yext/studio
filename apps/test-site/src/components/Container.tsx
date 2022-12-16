import { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode
}

export default function Container(props: ContainerProps) {
  return <div>I'm a container: {props.children}</div>;
}
