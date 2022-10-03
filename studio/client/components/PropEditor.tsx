import classNames from 'classnames'
import { ChangeEvent, useCallback } from 'react'
import { PropState, ComponentMetadata } from '../../shared/models'
import { validatePropState } from '../../shared/validatePropState'
import { getExpressionSources } from '../../shared/getExpressionSources'
import { ExpressionSourceType, PropStateTypes, PropTypes } from '../../types'
import { ExpressionLogo } from './ExpressionLogo'
import ExpressionProp from './ExpressionProp'
import { KGLogo } from './KGLogo'

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
  const { propShape } = componentMetadata
  const className = classNames('flex flex-col flex-grow m-2 px-2 py-2 border-4', {
    'border-black': componentMetadata.global
  })
  function updatePropState(propName: string, newPropValue: Omit<PropStateTypes, 'type'>) {
    const mergedPropState = {
      type: propShape[propName].type,
      ...newPropValue
    }
    if (validatePropState(mergedPropState)) {
      setPropState({
        ...propState,
        [propName]: mergedPropState
      })
    } else {
      console.warn('Unable to update prop state. Invalid new prop state:', mergedPropState)
    }
  }

  return (
    <div className={className}>
      {
        Object.keys(propShape).map((propName, index) => {
          const propDoc = propShape[propName].doc
          const propType = propShape[propName].type
          const value = propState[propName]?.value
          const isExpression = propState[propName]?.isExpression
          const key = propName + '-' + index
          const sharedProps = {
            propType,
            key,
            propName,
            propValue: value,
            propDoc,
            isExpression,
            onChange: updatePropState
          }
          switch (propType) {
            case PropTypes.boolean:
              return <InputProp {...sharedProps} htmlType='checkbox'/>
            case PropTypes.string:
              return <InputProp {...sharedProps}/>
            case PropTypes.number:
              return <InputProp {...sharedProps} htmlType='number'/>
            case PropTypes.HexColor:
              return <InputProp {...sharedProps} htmlType='color' defaultValue='#ffffff'/>
            default:
              console.error('Unknown prop type', propType, 'for propName', propName, 'in propState', propState)
              return null
          }
        })
      }
    </div>
  )
}

// TODO(oshi): move to separate file
export function InputProp<T extends string | number | boolean>(props: {
  propType: PropTypes,
  propName: string,
  propValue: T,
  defaultValue?: T,
  propDoc?: string,
  htmlType?: string,
  isExpression?: boolean,
  onChange: (propName: string, newPropState: Omit<PropStateTypes, 'type'>) => void
}): JSX.Element {
  const { propType, propName, propValue, propDoc, onChange, htmlType = 'text', defaultValue, isExpression } = props
  const inputType = isExpression ? 'expression' : htmlType
  const onExpressionPropChange = useCallback((value: string | undefined = '') => {
    onChange(propName, {
      value,
      isExpression: true
    })
  }, [onChange, propName])

  const onSimpleInputPropChange = useCallback((value: T) => {
    onChange(propName, { value })
  }, [onChange, propName])

  const onInputTypeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    e.target.value === 'expression'
      ? onExpressionPropChange(propValue?.toString())
      : onSimpleInputPropChange(propValue)
  }, [onExpressionPropChange, onSimpleInputPropChange, propValue])

  return (
    <div className='flex flex-col'>
      <div className='flex mb-2 items-center'>
        <label className='peer label'>{propName}:</label>
        <select className="text-center h-fit ml-auto" onChange={onInputTypeChange} value={inputType}>
          {['expression', htmlType].map(inputType => <option key={inputType}>{inputType}</option>)}
        </select>
      </div>
      {propDoc && <ToolTip message={propDoc}/>}
      <div className='flex'>
        {inputType === 'expression'
          ? <ExpressionProp
            propValue={propValue?.toString()}
            onChange={onExpressionPropChange}
          />
          : <SimpleInputEditor
            propValue={propValue}
            propType={propType}
            htmlType={htmlType}
            defaultValue={defaultValue}
            onChange={onSimpleInputPropChange}
          />
        }
        {isExpression && (getExpressionSources(propValue)
          .every(s => s === ExpressionSourceType.Stream) ? <KGLogo /> : <ExpressionLogo />)}
      </div>
    </div>
  )
}

function SimpleInputEditor<T extends string | number | boolean>(props: {
  propValue: T,
  propType: PropTypes,
  htmlType?: string,
  defaultValue?: T,
  onChange: (val: T) => void
}): JSX.Element {
  const { propValue, onChange, htmlType = 'text', defaultValue } = props
  return htmlType === 'checkbox'
    ? <input
      className='checkbox'
      type='checkbox'
      onChange={e => onChange(e.target.checked as T)}
      checked={propValue as boolean ?? defaultValue ?? false}
    />
    : <input
      className={ htmlType === 'color' ? 'input-sm' : 'input-sm flex-grow' }
      type={htmlType}
      onChange={e => onChange((htmlType === 'number' ? e.target.valueAsNumber : e.target.value) as T)}
      value={propValue as string | number ?? defaultValue ?? ''}
    />
}

export function ToolTip(props: {
  message: string
}): JSX.Element {
  return (
    <div className='invisible peer-hover:visible'>
      <div className='absolute z-10 whitespace-nowrap rounded shadow-lg p-3 text-sm bg-gray-600 text-white'>{props.message}</div>
    </div>
  )
}