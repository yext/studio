import { ReactNode } from "react";

export interface ContainerProps {
  className?: string;
  children: ReactNode;
}

export default function Container(props: ContainerProps) {
  return (
    <div className={props.className}>I'm a container: {props.children}</div>
  );
}
