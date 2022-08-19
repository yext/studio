import { PropState, ComponentMetadata } from '../../shared/models'
import { HexColor, PropTypes, StreamsDataExpression, StreamsStringExpression } from '../../types'
import kgLogoUrl from '../images/kg-logo.jpeg'

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
  if (!componentMetadata || !componentMetadata.propShape) {
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
          const sharedProps = {
            key: propName,
            propName,
            propValue,
            propDoc,
            onChange: val => updatePropState(propName, val)
          }
          switch (propType) {
            case PropTypes.boolean:
              return <BoolProp {...sharedProps} key={key}/>
            case PropTypes.string:
              return <StrProp {...sharedProps} key={key}/>
            case PropTypes.number:
              return <NumProp {...sharedProps} key={key}/>
            case PropTypes.HexColor:
              return <HexColorProp {...sharedProps} key={key}/>
            case PropTypes.StreamsString:
              return <StreamsStringProp {...sharedProps} key={key} />
            case PropTypes.StreamsData:
              return <StreamsDataProp {...sharedProps} key={key} />
            default:
              console.error('Unknown prop type', propType)
              return null
          }
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

function StreamsStringProp(props: {
  propName: string,
  propValue: StreamsStringExpression,
  propDoc?: string,
  onChange: (val: string) => void
}) {
  return (
    <div className='flex'>
      <label className='peer label'>{props.propName}:</label>
      {props.propDoc && <ToolTip message={props.propDoc}/>}
      <input
        className='input-sm'
        onChange={e => props.onChange(e.target.value)}
        value={props.propValue ?? ''}
      />
      <img
        src={kgLogoUrl}
        alt='this input uses streams'
        className='h-8'
        style={{ filter: 'sepia(100%) saturate(300%) brightness(70%) hue-rotate(80deg)' }}
      />
    </div>
  )
}
function StreamsDataProp(props: {
  propName: string,
  propValue: StreamsDataExpression,
  propDoc?: string,
  onChange: (val: string) => void
}) {
  return (
    <div className='flex'>
      <label className='peer label'>{props.propName}:</label>
      {props.propDoc && <ToolTip message={props.propDoc}/>}
      <input
        className='input-sm'
        onChange={e => props.onChange(e.target.value)}
        value={props.propValue ?? ''}
      />
      <img src={kgLogoUrl} alt='this input uses streams' className='h-8'/>
    </div>
  )
}