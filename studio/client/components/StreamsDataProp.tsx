import { KGLogo, ToolTip } from './PropEditor'
import { useStudioContext } from './useStudioContext'
import lodashGet from 'lodash/get.js'
import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import useRootClose from '@restart/ui/useRootClose';

export function StreamsDataProp(props: {
  propName: string,
  propValue: string,
  propDoc?: string,
  onChange: (val: string) => void
}): JSX.Element {
  const { propName, propValue, propDoc, onChange } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const options = useAutocompleteOptions(propValue, inputRef)
  useRootClose(inputRef, () => setAutocompleteIsVisible(false))

  const [autocompleteIndex, setAutocompleteIndex] = useState(0)
  const [autocompleteIsVisible, setAutocompleteIsVisible] = useState(false)

  useEffect(() => {
    setAutocompleteIndex(0)
  }, [propValue])

  return (
    <div className='flex'>
      <label className='peer label'>{propName}:</label>
      {propDoc && <ToolTip message={propDoc} />}
      <div className='flex flex-col relative flex-grow'>
        <div className='flex'>
          <input
            ref={inputRef}
            style={{
              flexGrow: 1,
              fontSize: '16px',
              padding: '0.25em 0.5em'
            }}
            onClick={() => setAutocompleteIsVisible(true)}
            onChange={e => {
              setAutocompleteIsVisible(true)
              onChange(e.target.value)
            }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setAutocompleteIndex((autocompleteIndex + 1) % options.length)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setAutocompleteIndex((options.length + autocompleteIndex - 1) % options.length)
              } else if (e.key === 'Enter') {
                insertAtSelection(options[autocompleteIndex])
                setAutocompleteIsVisible(false)
              }
            }}
            value={propValue ?? ''}
          />
          <KGLogo />
        </div>
        {
          autocompleteIsVisible && <ul style={{
            position: 'absolute',
            width: '100%',
            marginTop: '1px',
            top: '2em'
          }}>
            {options.map((k, i) => {
              return (
                <li key={k} onClick={() => onChange(k)} style={{
                  backgroundColor: i === autocompleteIndex ? 'rgb(223, 224, 246)' : 'white',
                  padding: '0.25em 1em',
                  cursor: 'pointer'
                }}>
                  <button>{k}</button>
                </li>
              )
            })}
          </ul>
        }
      </div>
    </div>
  )

  function insertAtSelection(value: string) {
    const selectionStart = getSelectionStart(inputRef)
    if (!selectionStart) {
      return
    }
    if (isTemplateString(value)) {
      const truncationIndex = getTemplateStringTruncationIndex(value, selectionStart)
      if (truncationIndex === undefined) {
        return
      }

    } else {
      const firstHalf = propValue.substring(0, selectionStart)
      let firstHalfTruncated = firstHalf.substring(0, firstHalf.lastIndexOf('.'))
      if (firstHalf.includes('.')) {
        firstHalfTruncated += '.'
      }
      const secondHalf = propValue.substring(selectionStart)
      const newValue = firstHalfTruncated + value + secondHalf
      onChange(newValue)
    }
  }
}

function useAutocompleteOptions(
  propValue: string,
  inputRef: RefObject<HTMLInputElement>
): string[] {
  const { streamDocument } = useStudioContext()

  const options = useMemo(() => {
    if (isTemplateString(propValue)) {
      const selectionStart = getSelectionStart(inputRef)
      if (!selectionStart) {
        return []
      }
      const truncationIndex = getTemplateStringTruncationIndex(propValue, selectionStart)
      if (truncationIndex === undefined) {
        return []
      }
      return getStreamDocumentOptions(propValue.substring(truncationIndex), streamDocument)
    }
    return getStreamDocumentOptions(propValue, streamDocument)
  }, [inputRef, propValue, streamDocument])

  return options
}

function getSelectionStart(inputRef: RefObject<HTMLInputElement>) {
  if (!inputRef.current) {
    return null
  }
  return inputRef.current.selectionStart
}

function getTemplateStringTruncationIndex(
  value: string,
  selectionStart: number
): number | undefined {
  const firstHalf = value.substring(0, selectionStart)
  const lastOpenBraceIndex = firstHalf.lastIndexOf('${')
  if (lastOpenBraceIndex < 0) {
    return
  }
  const lastCloseBraceIndex = firstHalf.lastIndexOf('}')
  if (lastCloseBraceIndex > 0 && lastCloseBraceIndex < lastOpenBraceIndex) {
    return
  }
  return lastOpenBraceIndex + 2
}

function getStreamDocumentOptions(
  value: string,
  streamDocument: Record<string, any>
): string[] {
  console.log('getting options for ', value)
  if ('document.'.startsWith(value)) {
    return ['document.']
  } else if (!value.startsWith('document.')) {
    return []
  }
  const currentSuffix = value.split('.').pop() ?? ''
  const parentPath = value.substring(0, value.lastIndexOf('.'))
  const documentNode = lodashGet({ document: streamDocument }, value)
    ?? lodashGet({ document: streamDocument }, parentPath, streamDocument)

  if (Array.isArray(documentNode)) {
    return []
  }

  return Object.keys(documentNode)
    .filter(d => d.startsWith(currentSuffix))
    .filter((_, i) => i < 10)
}

function isTemplateString(value: string): boolean {
  return value.startsWith('`') && value.endsWith('`') && value.length >= 2
}