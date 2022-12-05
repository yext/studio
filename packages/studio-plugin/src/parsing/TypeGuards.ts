import { PropVal, PropValueKind, PropValueType } from '../types'

type PrimitivePropValueType = PropValueType.number | PropValueType.string | PropValueType.boolean

/**
 * A static class for housing various typeguards used by Studio.
 */
export default class TypeGuards {
  static isValidPropValue(propValue: {
    kind: PropValueKind,
    valueType: PropValueType,
    value: string | number | boolean
  }): propValue is PropVal {
    const { kind, valueType, value } = propValue
    if (kind === PropValueKind.Expression) {
      return typeof value === 'string'
    }
    switch (valueType) {
      case PropValueType.string:
        return typeof value === 'string'
      case PropValueType.boolean:
        return typeof value === 'boolean'
      case PropValueType.number:
        return typeof value === 'number'
    }
    return false
  }

  static isPrimitiveProp(
    propValueType: PropValueType
  ): propValueType is PrimitivePropValueType {
    return [
      PropValueType.boolean,
      PropValueType.string,
      PropValueType.number
    ].includes(propValueType)
  }
  
  static isPropValueType(type: string): type is PropValueType {
    const propTypes = Object.values(PropValueType)
    return propTypes.includes(type as PropValueType)
  }
}