import { ToolTip } from './PropEditor'
import { useStudioContext } from './useStudioContext'
import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import useRootClose from '@restart/ui/useRootClose'
import { PropTypes } from '../../types'
import { KGLogo } from './KGLogo'
import isTemplateString from '../utils/isTemplateString'
import getStreamDocumentOptions from '../utils/getStreamDocumentOptions'
import getExpressionEndIndex from '../utils/getExpressionEndIndex'
import getTemplateExpressionIndex from '../utils/getTemplateExpressionIndex'

export default function StreamsProp(props: {
  propName: string,
  propValue: string | undefined,
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
    <div className='flex' style={{ fontFamily: '"Courier New", monospace' }}>
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
              } else if (e.key === 'Enter' && options.length > 0) {
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
                    cursor: 'pointer'
                  }}
                  onClick={() => insertAutocompleteValue(k)}
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
    if (!propValue) {
      onChange(value)
      return
    }
    const selectionStart = getSelectionStart(inputRef)
    if (!selectionStart) {
      return
    }

    if (propType === PropTypes.StreamsString && isTemplateString(propValue)) {
      const expressionStartIndex = getTemplateExpressionIndex(propValue, selectionStart)
      if (expressionStartIndex === null) {
        return
      }
      const prefix = propValue.substring(0, expressionStartIndex)
      const alreadyHasClosingBrace = propValue.substring(expressionStartIndex).split(' ')[0].includes('}')
      const expressionEndIndex = getExpressionEndIndex(propValue, expressionStartIndex)
      const streamsDataExpression = propValue.substring(expressionStartIndex, expressionEndIndex)
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
  propValue: string | undefined,
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
      const templateExprIndex = getTemplateExpressionIndex(propValue, selectionStart)
      if (templateExprIndex === null) {
        return []
      }
      const secondHalf = propValue.substring(templateExprIndex, propValue.length - 1).split(' ')[0]
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

