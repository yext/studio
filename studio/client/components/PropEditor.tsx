import { TSPropShape } from '../../shared/models'
import { HexColor, SpecialTypes } from '../../types'

interface PropEditorProps {
  propState: PropState,
  propShape: TSPropShape,
  setPropState: (val: PropState) => void
}

export type PropState = Record<string, string | number | boolean | SpecialTypes>

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
          const propType = propShape[propName].type
          const propDoc = propShape[propName].doc
          const propValue = propState[propName] as any
          const sharedProps ={
            key: propName,
            propName,
            propValue,
            propDoc,
            onChange: val => updatePropState(propName, val)
          }
          if (propType === 'boolean') {
            return <BoolProp {...sharedProps} />
          } else if (propType === 'string') {
            return <StrProp {...sharedProps} />
          } else if (propType === 'number') {
            return <NumProp {...sharedProps} />
          } else if (propType === 'HexColor') {
            return <HexColorProp {...sharedProps} />
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
  propDoc?: string,
  onChange: (val: boolean) => void
}) {
  return (
    <div className='flex'>
      <label className='peer label'>{props.propName}:</label>
      {props.propDoc && <ToolTip message={props.propDoc}/>}
      <input className='checkbox' type='checkbox' onChange={e => props.onChange(e.target.checked)} checked={props.propValue ?? false}/>
    </div>
  )
}

function StrProp(props: {
  propName: string,
  propValue: string,
  propDoc?: string,
  onChange: (val: string) => void
}) {
  return (
    <div className='flex'>
      <label className='peer label'>{props.propName}:</label>
      {props.propDoc && <ToolTip message={props.propDoc}/>}
      <input className='input-sm' onChange={e => props.onChange(e.target.value)} value={props.propValue ?? ''}/>
    </div>
  )
}

function NumProp(props: {
  propName: string,
  propValue: number,
  propDoc?: string,
  onChange: (val: number) => void
}) {
  return (
    <div className='flex'>
      <label className='peer label'>{props.propName}:</label>
      {props.propDoc && <ToolTip message={props.propDoc}/>}
      <input className='input-sm' onChange={e => props.onChange(parseFloat(e.target.value))} value={props.propValue ?? ''}/>
    </div>
  )
}

function HexColorProp(props: {
  propName: string,
  propValue: HexColor,
  propDoc?: string,
  onChange: (val: HexColor) => void
}) {
  return (
    <div className='flex'>
      <label className='peer label'>{props.propName}:</label>
      {props.propDoc && <ToolTip message={props.propDoc}/>}
      <input type='color' className='input-sm' onChange={e => props.onChange(e.target.value as HexColor)} value={props.propValue ?? '#ffffff'}/>
    </div>
  )
}

function ToolTip(props: {
  message: string
}) {
  return (
    <div className='invisible peer-hover:visible'>
      <div className='absolute z-10 whitespace-nowrap rounded shadow-lg p-3 text-sm bg-gray-600 text-white'>{props.message}</div>
    </div>
  )
}
