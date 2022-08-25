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
                insertAutocompleteValue(options[autocompleteIndex])
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

  function insertAutocompleteValue(value: string) {
    if (propValue === '') {
      onChange(value)
      return
    }
    const selectionStart = getSelectionStart(inputRef)
    if (!selectionStart) {
      return
    }

    if (isTemplateString(propValue)) {
      const openBraceIndex = getOpenBraceIndex(propValue, selectionStart)
      if (!openBraceIndex) {
        return
      }
      const prefix = propValue.substring(0, openBraceIndex)
      const closeBraceIndex = openBraceIndex + propValue.substring(openBraceIndex, propValue.length - 1).indexOf('}')
      const valueToAutocomplete = propValue.substring(openBraceIndex, closeBraceIndex)
      const secondHalf = propValue.substring(closeBraceIndex)
      const valueToSearch = closeBraceIndex === -1 ? secondHalf : secondHalf.substring(0, closeBraceIndex)
      const dotIndex = valueToSearch
    }

    // let startIndex = 0
    // if (isTemplateString(propValue)) {
    //   startIndex = getOpenBraceIndex(propValue, selectionStart) ?? 0
    // }
    const newValue = getUpdatedValue(propValue, value, selectionStart)

    onChange(newValue)
  }
}

/**
 * Given a certain `streamsDataExpression` like `'document.addr'` that needs the last part of the
 * expression to be autocompleted to a certain `newValue` like `'address'`, return the updated value.
 * For the above example `'document.address'` would be returned.
 */
function getUpdatedValue(streamsDataExpression: string, newValue: string, selectionStart: number) {
  const firstHalf = streamsDataExpression.substring(0, selectionStart)
  let firstHalfTruncated = firstHalf.substring(0, firstHalf.lastIndexOf('.'))
  if (firstHalf.includes('.')) {
    firstHalfTruncated += '.'
  }
  const secondHalf = streamsDataExpression.substring(selectionStart)
  return firstHalfTruncated + newValue + secondHalf
}

/**
 * Returns the stream autocomplete options available given a certain string value.
 */
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
      const openBraceIndex = getOpenBraceIndex(propValue, selectionStart)
      if (openBraceIndex === undefined) {
        return []
      }
      const secondHalf = propValue.substring(openBraceIndex, propValue.length - 1).split(' ')[0]
      const closeBraceIndex = secondHalf.indexOf('}')
      const valueToSearch = closeBraceIndex === -1 ? secondHalf : secondHalf.substring(0, closeBraceIndex)
      return getStreamDocumentOptions(valueToSearch, streamDocument)
    }
    return getStreamDocumentOptions(propValue, streamDocument)
  }, [inputRef, propValue, streamDocument])

  return options
}

/**
 * Returns the index of the text cursor (aka caret) within the input element, if such a selection exists.
 */
function getSelectionStart(inputRef: RefObject<HTMLInputElement>) {
  if (!inputRef.current) {
    return null
  }
  return inputRef.current.selectionStart
}

/**
 * Returns the index AFTER the last `${` style open brace that is before the cursor selection.
 */
function getOpenBraceIndex(
  value: string,
  selectionStart: number
): number | undefined {
  const firstHalf = value.substring(0, selectionStart)
  const lastOpenBraceIndex = firstHalf.lastIndexOf('${')
  if (lastOpenBraceIndex < 0) {
    return
  }
  const lastCloseBraceIndex = firstHalf.lastIndexOf('}')
  if (lastCloseBraceIndex >= 0 && lastCloseBraceIndex > lastOpenBraceIndex) {
    console.warn('last close brace after last open brace', lastCloseBraceIndex, lastOpenBraceIndex)
    return
  }
  return lastOpenBraceIndex + 2
}

/**
 * Returns the available stream document autocomplete options, given a certain value.
 */
function getStreamDocumentOptions(
  value: string,
  streamDocument: Record<string, any>
): string[] {
  console.log('getting options for ', value)
  if ('document'.startsWith(value)) {
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