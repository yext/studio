import { ReactNode } from "react";

export interface ContainerProps {
  children?: ReactNode;
}

export default function Container(props: ContainerProps) {
  return (
    <div className="p-2 text-lg border-4 border-red-600">
      I'm a container: {props.children}
    </div>
  );
}
