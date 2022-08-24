import { KGLogo, ToolTip } from './PropEditor'
import { useStudioContext } from './useStudioContext'
import lodashGet from 'lodash/get.js'
import { useRef, useState } from 'react'

export function StreamsDataProp(props: {
  propName: string,
  propValue: string,
  propDoc?: string,
  onChange: (val: string) => void
}): JSX.Element {
  const { propName, propValue, propDoc, onChange } = props
  // const [selectionStart, setSelectionStart] = useState<number>(0)
  const options = useAutocompleteOptions(propValue)
  return (
    <div className='flex'>
      <label className='peer label'>{propName}:</label>
      {propDoc && <ToolTip message={propDoc} />}
      <div className='flex flex-col relative'>
        <div className='flex'>
          <input
            style={{
              fontSize: '16px',
              // paddingLeft: '12px'
            }}
            onChange={e => {
              onChange(e.target.value)
              // e.target.selectionStart && setSelectionStart(e.target.selectionStart)
            }}
            value={propValue ?? ''}
          />
          <KGLogo />
        </div>
        <ul style={{
          backgroundColor: 'white',
          position: 'absolute',
          top: '2em',
          left: `${getAutocompleteOffset(propValue) * 8}px`,
          // marginLeft: '12px'
        }}>
          {options.map(k => {
            return (
              <li key={k} onClick={() => onChange(k)}>
                <button>{k}</button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function useAutocompleteOptions(propValue: string): string[] {
  const { streamDocument } = useStudioContext()
  if (!propValue.startsWith('document.')) {
    return ['document.']
  }
  const currentSuffix = propValue.split('.').pop() ?? ''
  const documentNode = lodashGet({ document: streamDocument }, propValue, streamDocument)

  return Object.keys(documentNode)
    .filter(d => d.startsWith(currentSuffix))
    .filter((_, i) => i < 10)
}

function getAutocompleteOffset(propValue: string): number {
  if (!propValue.startsWith('document.')) {
    return 0
  }
  const parentSubstring = propValue.substring(0, propValue.lastIndexOf('.') + 2)
  return parentSubstring.length
}