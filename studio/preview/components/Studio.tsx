import { LeftNav } from "./LeftNav";
import { Preview } from "./Preview";

export interface StudioProps {
  children: React.ReactChild
}

export function Studio (props: StudioProps) {
  return (
    <div className='h-screen w-screen flex flex-row'>
      <LeftNav></LeftNav>
      <Preview>
        {props.children}
      </Preview>
    </div>
  );
}