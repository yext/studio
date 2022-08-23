import { CSSProperties } from 'react'
import { PropState, ComponentMetadata } from '../../shared/models'
import { PropTypes, StreamsDataExpression, StreamsStringExpression } from '../../types'
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
}: PropEditorProps): JSX.Element | null {
  if (!componentMetadata || !componentMetadata.propShape) {
    console.error('Error rendering prop editor for', propState)
    return null
  }
  function updatePropState(propName, propValue: string | number | boolean) {
    setPropState({
      ...propState,
      [propName]: {
        ...propState[propName],
        value: propValue
      }
    })
  }
  const { propShape } = componentMetadata
  return (
    <div className='flex flex-col'>
      {
        Object.keys(propShape).map((propName, index) => {
          const propDoc = propShape[propName].doc
          const type = propShape[propName].type
          const value = propState[propName]?.value
          const key = propName + '-' + index
          const sharedProps = {
            key,
            propName,
            propValue: value as any,
            propDoc,
            onChange: (val: string | number | boolean) => updatePropState(propName, val)
          }
          switch (type) {
            case PropTypes.boolean:
              return <InputProp {...sharedProps} type='checkbox'/>
            case PropTypes.string:
              return <InputProp {...sharedProps}/>
            case PropTypes.number:
              return <InputProp {...sharedProps} type='number'/>
            case PropTypes.HexColor:
              return <InputProp {...sharedProps} type='color' defaultValue='#ffffff'/>
            case PropTypes.StreamsString:
              return <InputProp {...sharedProps} img={<KGLogo style={{ filter: 'sepia(100%) saturate(300%) brightness(70%) hue-rotate(80deg)' }} />}/>
            case PropTypes.StreamsData:
              return <InputProp {...sharedProps} img={<KGLogo />}/>
            default:
              console.error('Unknown prop type', type, 'for propName', propName, 'in propState', propState)
              return null
          }
        })
      }
    </div>
  )
}

function InputProp<T extends string | number | boolean>(props: {
  propName: string,
  propValue: T,
  defaultValue?: T,
  propDoc?: string,
  type?: string,
  img?: JSX.Element,
  onChange: (val: T) => void
}): JSX.Element {
  const { propName, propValue, propDoc, onChange, type = 'text', defaultValue, img } = props
  return (
    <div className='flex'>
      <label className='peer label'>{propName}:</label>
      {propDoc && <ToolTip message={propDoc}/>}
      {type === 'checkbox'
        ? <input
          className='checkbox'
          type='checkbox'
          onChange={e => onChange(e.target.checked as T)}
          checked={!!propValue ?? defaultValue}
        />
        : <input
          className='input-sm'
          type={type}
          onChange={e => onChange(e.target.value as T)}
          value={propValue as string | number ?? defaultValue}
        />
      }
      {img}
    </div>
  )
}

function ToolTip(props: {
  message: string
}): JSX.Element {
  return (
    <div className='invisible peer-hover:visible'>
      <div className='absolute z-10 whitespace-nowrap rounded shadow-lg p-3 text-sm bg-gray-600 text-white'>{props.message}</div>
    </div>
  )
}

function KGLogo({ style }: { style?: CSSProperties }): JSX.Element {
  return <img
    src={kgLogoUrl}
    alt='this input uses streams'
    className='h-8'
    style={style}
  />
}
