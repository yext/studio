import { KGLogo, ToolTip } from './PropEditor'
import { useStudioContext } from './useStudioContext'
import lodashGet from 'lodash/get.js'
import { useMemo, useRef, useState } from 'react'
import Select, { GroupBase, OptionsOrGroups } from 'react-select'
import { MenuList } from 'react-select/dist/declarations/src/components/Menu'

export function StreamsDataProp(props: {
  propName: string,
  propValue: string,
  propDoc?: string,
  onChange: (val: string) => void
}): JSX.Element {
  const { propName, propValue, propDoc, onChange } = props
  const options = useAutocompleteOptions(propValue)

  const [inputValue, setInputValue] = useState('')

  return (
    <div className='flex'>
      <label className='peer label'>{propName}:</label>
      {propDoc && <ToolTip message={propDoc} />}
      <div className='flex flex-col relative'>
        <div className='flex'>
          <Select
            options={options}
            isClearable={true}
            isSearchable={true}
            // inputValue={propValue}
            // value={propValue}
            onInputChange={(val, actionMeta) => {
              console.log('onInputChange', val, actionMeta, propValue)
              if (actionMeta.action !== 'input-change') {
                return
              }
              // onChange(val)
            }}
            filterOption={() => true}
            onChange={(option, actionMeta) => {
              console.log('onChange', option, actionMeta)
              // onChange(option?.value ?? '')
            }}
          />~
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
        <ul>
          {options.map(o => {
            const k = o.value
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

function useAutocompleteOptions(propValue: string): { value: string, label: string }[] {
  const { streamDocument } = useStudioContext()

  const options = useMemo(() => {
    const currentSuffix = propValue.split('.').pop() ?? ''
    const parentPath = propValue.substring(0, propValue.lastIndexOf('.'))
    const documentNode = lodashGet({ document: streamDocument }, propValue)
      ?? lodashGet({ document: streamDocument }, parentPath, streamDocument)

    if (!propValue.startsWith('document.')) {
      return [{ value: 'document.', label: 'document.' }]
    }
    return Object.keys(documentNode)
      .filter(d => d.startsWith(currentSuffix))
      .filter((_, i) => i < 10)
      .map(d => {
        return {
          value: `${parentPath}.${d}`,
          // label: d
          label: `${parentPath}.${d}`,
        }
      })
  }, [propValue, streamDocument])
  return options
}