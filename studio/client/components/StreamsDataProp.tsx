import { KGLogo, ToolTip } from './PropEditor'
import { useStudioContext } from './useStudioContext'
import lodashGet from 'lodash/get.js'
import { useRef } from 'react'

export function StreamsDataProp(props: {
  propName: string,
  propValue: string,
  propDoc?: string,
  onChange: (val: string) => void
}): JSX.Element {
  const { propName, propValue, propDoc, onChange } = props
  const selectionStartRef = useRef<number>()
  const options = useAutocompleteOptions(propValue)
  return (
    <div className='flex'>
      <label className='peer label'>{propName}:</label>
      {propDoc && <ToolTip message={propDoc} />}
      <div className='flex flex-col'>
        <div className='flex'>
          <input
            className='input-sm'
            onChange={e => {
              // const selection: Selection | null = window.getSelection()
              onChange(e.target.value)
              // if (!selection || selection.rangeCount < 1) {
              //   return
              // }
              if (e.target.selectionStart) {
                console.log(e.target.selectionStart)
                selectionStartRef.current = e.target.selectionStart
              }
              // const range: Range = selection.getRangeAt(0).cloneRange()
              // console.log(range.getClientRects(), range.getBoundingClientRect())
            }}
            value={propValue ?? ''}
          />
          <KGLogo />
        </div>
        <ul className='menu bg-base-100'>
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
}