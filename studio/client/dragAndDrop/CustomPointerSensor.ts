import { PointerSensor, PointerSensorOptions } from '@dnd-kit/core'
import { PointerEvent } from 'react'

export default class CustomPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler(e: PointerEvent, opts: PointerSensorOptions) {
        const { nativeEvent: event } = e
        const { onActivation } = opts

        if (
          !event.isPrimary ||
          event.button !== 0 ||
          !elementShouldBeDraggable(event.target)
        ) {
          return false
        }

        onActivation?.({ event })
        return true
      },
    },
  ]
}

function elementShouldBeDraggable(element: EventTarget | null) {
  if (!element || !(element instanceof HTMLElement) || !element?.tagName) {
    return false
  }

  const interactiveElements = [
    'button',
    'input',
    'textarea',
    'select',
    'option',
  ]

  if (interactiveElements.includes(element.tagName.toLowerCase())) {
    return false
  }

  return window.getComputedStyle(element)['cursor'] === 'grab'
}
