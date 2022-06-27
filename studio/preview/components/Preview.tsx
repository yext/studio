import { PropsWithChildren } from "react";

export interface PreviewProps {}

export function Preview (props: PropsWithChildren<PreviewProps>) {
  return (
    <div className='w-full h-full'>
      {props.children}
    </div>
  );
}