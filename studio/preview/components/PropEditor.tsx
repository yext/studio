import { createContext, useContext, useState } from "react"

export type TSPropShape = Record<string, 'TSStringKeyword' | 'TSNumberKeyword' | 'TSBooleanKeyword'>;

export const PropEditorContext = createContext<{
  propShape: TSPropShape,
  setPropShape: (val: TSPropShape) => void,
  componentName: string,
  updateActiveComponent: (val: string) => void
}>({
  propShape: {},
  setPropShape: () => { throw new Error('PropEditorContext not set')},
  componentName: '',
  updateActiveComponent: () => { throw new Error() }
});

interface PropEditorProps {
  // initialState: PropState
}

type PropState = Record<string, string | number | boolean>
// type PropState<T extends TSPropShape> = {
//   [arg in keyof T]:
//     T[arg] extends 'TSStringKeyword' ? string :
//     T[arg] extends 'TSNumberKeyword' ? number :
//     T[arg] extends 'TSBooleanKeyword' ? boolean : never;
// }

export default function PropEditor(props: PropEditorProps) {
  const { propShape } = useContext(PropEditorContext);
  const [propState, setPropState] = useState<PropState>({});

  function updatePropState(propName, propValue) {
    setPropState({
      ...propState,
      [propName]: propValue
    })
  }

  return (
    <>
      {
        Object.keys(propShape).map(propName => {
          const propType = propShape[propName]
          const sharedProps ={
            key: propName, 
            propName,
            onChange: val => updatePropState(propName, val)
          }
          if (propType === 'TSBooleanKeyword') {
            return <BoolProp {...sharedProps}/>
          } else if (propType === 'TSStringKeyword') {
            return <StrProp {...sharedProps}/>
          } else if (propType === 'TSNumberKeyword') {
            return <NumProp {...sharedProps}/>
          }
        })
      }
    </>
  )
}

function BoolProp(props: {
  propName: string
  onChange: (val: boolean) => void
}) {
  return (
    <div>
      <label>{props.propName}</label>
      <input type='checkbox' onChange={e => props.onChange(e.target.checked)}/>
    </div>
  )
}

function StrProp(props: {
  propName: string,
  onChange: (val: string) => void
}) {
  return (
    <div>
      <label>{props.propName}</label>
      <input onChange={e => props.onChange(e.target.value)}/>
    </div>
  )
}

function NumProp(props: {
  propName: string,
  onChange: (val: number) => void
}) {
  return (
    <div>
      <label>{props.propName}</label>
      <input onChange={e => props.onChange(parseFloat(e.target.value))}/>
    </div>
  )
}