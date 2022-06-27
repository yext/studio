import { PropsWithChildren } from "react";
import { LeftNav } from "./LeftNav";
import { Preview } from "./Preview";

export interface StudioProps {
}

export function Studio (props: PropsWithChildren<StudioProps>) {
  return (
    <div className='h-screen w-screen flex flex-row'>
      <LeftNav></LeftNav>
      <Preview>
        {props.children}
      </Preview>
    </div>
  );
}