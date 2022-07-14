import { PointerSensor, PointerSensorOptions } from '@dnd-kit/core'
import { PointerEvent } from 'react'

export default class CustomPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler(e: PointerEvent, opts: PointerSensorOptions) {
        const { nativeEvent: event } = e
        const { onActivation } = opts

        if (!event.isPrimary || event.button !== 0 || isInteractiveElement(event.target)) {
          return false
        }

        onActivation?.({ event })
        return true
      },
    },
  ]
}

function isInteractiveElement(element: EventTarget | null) {
  if (!element || !(element instanceof Element) || !element?.tagName) {
    return false
  }

  const interactiveElements = [
    'button',
    'input',
    'textarea',
    'select',
    'option',
  ]

  return interactiveElements.includes(element.tagName.toLowerCase())
}
