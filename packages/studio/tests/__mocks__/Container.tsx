import { ReactNode } from "react";

export interface ContainerProps {
  text?: string;
  children: ReactNode;
}

export default function Container(props: ContainerProps) {
  return (
    <div data-testid={props.text}>
      {props.text}
      {props.children}
    </div>
  );
}
