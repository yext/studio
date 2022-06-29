import { PropsWithChildren, useState } from "react";
import { LeftNav } from "./LeftNav";
import { PropEditorContext, TSPropShape } from './PropEditor'
import { Preview } from "./Preview";

export interface StudioProps {
  componentsToPropShapes: Record<string, TSPropShape>
}

export function Studio (props: PropsWithChildren<StudioProps>) {
  const [componentName, setComponentName ] = useState('');
  function updateActiveComponent(name: string) {
    console.log(props)
    setPropShape(props.componentsToPropShapes[name]);
    setComponentName(name);
  }
  const [ propShape, setPropShape ] = useState<TSPropShape>({})

  return (
    <div className='h-screen w-screen flex flex-row'>
      <PropEditorContext.Provider value={{
        propShape, setPropShape, componentName, updateActiveComponent}}>
        <LeftNav/>
      </PropEditorContext.Provider>
      <Preview>
        {props.children}
      </Preview>
    </div>
  );
}