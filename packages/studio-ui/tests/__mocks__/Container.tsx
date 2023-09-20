import { ReactNode } from "react";

export interface ContainerProps {
  text?: string;
  children: ReactNode;
}

export default function Container(props: ContainerProps) {
  return (
    <div>
      {props.text}
      {props.children}
    </div>
  );
}
