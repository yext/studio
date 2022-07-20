import { PropState, ComponentMetadata } from '../../shared/models'
import { HexColor } from '../../types'

export interface PropEditorProps {
  propState: PropState,
  componentMetadata: ComponentMetadata,
  setPropState: (val: PropState) => void
}

export default function PropEditor({
  propState,
  setPropState,
  componentMetadata
}: PropEditorProps) {
  if (!componentMetadata) {
    console.error('Error rendering prop editor for', propState)
    return null
  }
  function updatePropState(propName, propValue) {
    setPropState({
      ...propState,
      [propName]: propValue
    })
  }
  const { propShape } = componentMetadata
  return (
    <div className='flex flex-col'>
      {
        Object.keys(propShape).map((propName, index) => {
          const propType = propShape[propName].type
          const propDoc = propShape[propName].doc
          const propValue = propState[propName] as any
          const key = propName + '-' + index
          const sharedProps ={
            key: propName,
            propName,
            propValue,
            propDoc,
            onChange: val => updatePropState(propName, val)
          }
          if (propType === 'boolean') {
            return <BoolProp {...sharedProps} key={key}/>
          } else if (propType === 'string') {
            return <StrProp {...sharedProps} key={key}/>
          } else if (propType === 'number') {
            return <NumProp {...sharedProps} key={key}/>
          } else if (propType === 'HexColor') {
            return <HexColorProp {...sharedProps} key={key}/>
          }
          return null
        })
      }
    </div>
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
      <input className='input-sm' type="number" onChange={e => props.onChange(parseFloat(e.target.value))} value={props.propValue ?? ''}/>
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
