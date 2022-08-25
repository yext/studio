import { ToolTip } from './PropEditor'
import { useStudioContext } from './useStudioContext'
import lodashGet from 'lodash/get.js'
import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import useRootClose from '@restart/ui/useRootClose'
import { PropTypes } from '../../types'
import { KGLogo } from './KGLogo'

export default function StreamsProp(props: {
  propName: string,
  propValue: string,
  propDoc?: string,
  propType: PropTypes.StreamsData | PropTypes.StreamsString,
  onChange: (val: string) => void
}): JSX.Element {
  const { propName, propValue, propDoc, propType, onChange } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const options = useAutocompleteOptions(propValue, propType, inputRef)
  useRootClose(inputRef, () => setAutocompleteVisibility(false))
  const [selectionRangeUpdate, triggerSelectionRangeUpdate] = useState<number>()

  const [autocompleteIndex, setAutocompleteIndex] = useState(0)
  const [autocompleteIsVisible, setAutocompleteVisibility] = useState(false)

  useEffect(() => {
    setAutocompleteIndex(0)
  }, [propValue])

  useEffect(() => {
    if (selectionRangeUpdate !== undefined) {
      inputRef.current?.setSelectionRange(selectionRangeUpdate, selectionRangeUpdate)
    }
  }, [selectionRangeUpdate])

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
            onBlur={() => setAutocompleteVisibility(false)}
            onClick={() => setAutocompleteVisibility(true)}
            onFocus={() => setAutocompleteVisibility(true)}
            onChange={e => {
              setAutocompleteVisibility(true)
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
              }
            }}
            value={propValue ?? ''}
          />
          <KGLogo style={{
            filter: propType === PropTypes.StreamsString ? 'sepia(100%) saturate(300%) brightness(70%) hue-rotate(80deg)' : ''
          }}/>
        </div>
        {
          autocompleteIsVisible && options.length > 0 && <ul style={{
            position: 'absolute',
            width: '100%',
            marginTop: '1px',
            top: '2em',
            zIndex: 1
          }}>
            {options.map((k, i) => {
              return (
                <li key={k}
                  style={{
                    backgroundColor: i === autocompleteIndex ? 'rgb(223, 224, 246)' : 'white',
                    padding: '0.25em 1em',
                    cursor: 'text'
                  }}
                >
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

    if (propType === PropTypes.StreamsString && isTemplateString(propValue)) {
      const templateSpanIndex = getTemplateSpanIndex(propValue, selectionStart)
      if (!templateSpanIndex) {
        return
      }
      const prefix = propValue.substring(0, templateSpanIndex)
      const alreadyHasClosingBrace = propValue.substring(templateSpanIndex).includes('}')
      const expressionEndIndex = alreadyHasClosingBrace
        ? templateSpanIndex + propValue.substring(templateSpanIndex).indexOf('}')
        : propValue.length - 1
      const streamsDataExpression = propValue.substring(templateSpanIndex, expressionEndIndex)
      const suffix = propValue.substring(expressionEndIndex)
      let newValue = prefix + getUpdatedValue(streamsDataExpression, value)
      const newSelectionIndex = newValue.length
      if (!alreadyHasClosingBrace) {
        newValue += '}'
      }
      newValue += suffix
      onChange(newValue)
      triggerSelectionRangeUpdate(newSelectionIndex)
    } else {
      const newValue = getUpdatedValue(propValue, value)
      onChange(newValue)
    }
  }
}

/**
 * Given a certain `streamsDataExpression` like `'document.addr'` that needs the last part of the
 * expression to be autocompleted to a certain `newValue` like `'address'`, return the updated value.
 * For the above example `'document.address'` would be returned.
 */
function getUpdatedValue(streamsDataExpression: string, newValue: string) {
  const lastDotIndex = streamsDataExpression.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return newValue
  }
  return streamsDataExpression.substring(0, lastDotIndex) + '.' + newValue
}

/**
 * Returns the stream autocomplete options available given a certain string value.
 */
function useAutocompleteOptions(
  propValue: string,
  propType: PropTypes,
  inputRef: RefObject<HTMLInputElement>
): string[] {
  const { streamDocument } = useStudioContext()

  const options = useMemo(() => {
    if (propType === PropTypes.StreamsString && isTemplateString(propValue)) {
      const selectionStart = getSelectionStart(inputRef)
      if (!selectionStart) {
        return []
      }
      const templateSpanIndex = getTemplateSpanIndex(propValue, selectionStart)
      if (templateSpanIndex === undefined) {
        return []
      }
      const secondHalf = propValue.substring(templateSpanIndex, propValue.length - 1).split(' ')[0]
      const closeBraceIndex = secondHalf.indexOf('}')
      const valueToSearch = closeBraceIndex === -1 ? secondHalf : secondHalf.substring(0, closeBraceIndex)
      return getStreamDocumentOptions(valueToSearch, streamDocument)
    }
    return getStreamDocumentOptions(propValue, streamDocument)
  }, [inputRef, propValue, streamDocument, propType])

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
 * Returns the index AFTER the last `${` style open brace that is still before the cursor selection.
 */
function getTemplateSpanIndex(
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

  if (Array.isArray(documentNode) || typeof documentNode !== 'object') {
    return []
  }

  return Object.keys(documentNode)
    .filter(d => d.startsWith(currentSuffix))
    .filter((_, i) => i < 10)
}

function isTemplateString(value: string): boolean {
  return value.startsWith('`') && value.endsWith('`') && value.length >= 2
}
