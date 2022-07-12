import { TSPropShape } from '../../shared/models'

interface PropEditorProps {
  propState: PropState,
  propShape: TSPropShape,
  setPropState: (val: PropState) => void
}

export type PropState = Record<string, string | number | boolean>

export default function PropEditor({
  propState,
  setPropState,
  propShape
}: PropEditorProps) {
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
          const propValue = propState[propName] as any
          const sharedProps ={
            key: propName,
            propName,
            propValue,
            onChange: val => updatePropState(propName, val)
          }
          if (propType === 'boolean') {
            return <BoolProp {...sharedProps}/>
          } else if (propType === 'string') {
            return <StrProp {...sharedProps}/>
          } else if (propType === 'number') {
            return <NumProp {...sharedProps}/>
          }
          return null
        })
      }
    </>
  )
}

function BoolProp(props: {
  propName: string,
  propValue: boolean,
  onChange: (val: boolean) => void
}) {
  return (
    <div className='flex'>
      <label className='label'>{props.propName}:</label>
      <input className='checkbox' type='checkbox' onChange={e => props.onChange(e.target.checked)} checked={props.propValue ?? false}/>
    </div>
  )
}

function StrProp(props: {
  propName: string,
  propValue: string,
  onChange: (val: string) => void
}) {
  return (
    <div className='flex'>
      <label className='label'>{props.propName}:</label>
      <input className='input-sm' onChange={e => props.onChange(e.target.value)} value={props.propValue ?? ''}/>
    </div>
  )
}

function NumProp(props: {
  propName: string,
  propValue: number,
  onChange: (val: number) => void
}) {
  return (
    <div className='flex'>
      <label className='label'>{props.propName}:</label>
      <input className='input-sm' onChange={e => props.onChange(parseFloat(e.target.value))} value={props.propValue ?? ''}/>
    </div>
  )
}