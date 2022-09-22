import { useStudioContext } from './useStudioContext'
import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import useRootClose from '@restart/ui/useRootClose'
import { isTemplateString } from '../../shared/isTemplateString'
import getAutocompleteOptions from '../utils/getAutocompleteOptions'
import getExpressionEndIndex from '../utils/getExpressionEndIndex'
import getTemplateExpressionIndex from '../utils/getTemplateExpressionIndex'
import { useSiteSettings } from '../utils/useSiteSettings'

export default function ExpressionProp(props: {
  propValue: string | undefined,
  onChange: (val: string) => void
}): JSX.Element {
  const { propValue, onChange } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const options = useAutocompleteOptions(propValue, inputRef)
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
    <div className='flex flex-col relative flex-grow' style={{ fontFamily: '"Courier New", monospace' }}>
      <div className='flex '>
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
            if (options.length === 0) {
              return
            }
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

    if (isTemplateString(propValue)) {
      const expressionStartIndex = getTemplateExpressionIndex(propValue, selectionStart)
      if (expressionStartIndex === null) {
        return
      }
      const prefix = propValue.substring(0, expressionStartIndex)
      const alreadyHasClosingBrace = propValue.substring(expressionStartIndex).split(' ')[0].includes('}')
      const expressionEndIndex = getExpressionEndIndex(propValue, expressionStartIndex)
      const dataExpression = propValue.substring(expressionStartIndex, expressionEndIndex)
      const suffix = propValue.substring(expressionEndIndex)

      let newValue = prefix + getUpdatedValue(dataExpression, value)
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
 * Given a certain expression like `'document.addr'` that needs the last part of the
 * expression to be autocompleted to a certain `newValue` like `'address'`, return the updated value.
 * For the above example `'document.address'` would be returned.
 */
function getUpdatedValue(expression: string, newValue: string) {
  const lastDotIndex = expression.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return newValue
  }
  return expression.substring(0, lastDotIndex) + '.' + newValue
}

/**
 * Returns the autocomplete options available given a certain string value.
 */
function useAutocompleteOptions(
  propValue: string | undefined,
  inputRef: RefObject<HTMLInputElement>
): string[] {
  const { streamDocument } = useStudioContext()
  const siteSettingsObj = useSiteSettings()

  const options = useMemo(() => {
    const options = {
      document: streamDocument,
      siteSettings: siteSettingsObj
    }
    if (isTemplateString(propValue)) {
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
      return getAutocompleteOptions(valueToSearch, options)
    }
    return getAutocompleteOptions(propValue, options)
  }, [inputRef, propValue, siteSettingsObj, streamDocument])

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

