import { JsxOpeningElement, JsxSelfClosingElement, ts, JsxAttribute } from 'ts-morph'
import { ComponentMetadata, PropState } from '../../shared/models'
import { getPropName, getJsxAttributeValue, validatePropState } from '../common'

export default function parseJsxAttributes(
  n: JsxOpeningElement | JsxSelfClosingElement,
  componentMetaData: ComponentMetadata
): PropState {
  const props = {}
  n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach((jsxAttribute: JsxAttribute) => {
    const propName = getPropName(jsxAttribute)
    if (!propName) {
      throw new Error('Could not parse jsx attribute prop name: ' + jsxAttribute.getFullText())
    }
    const propType = componentMetaData.propShape?.[propName]?.type
    if (!propType) {
      throw new Error('Could not find prop type for: ' + jsxAttribute.getFullText())
    }
    const propValue = getJsxAttributeValue(jsxAttribute)
    const propState = {
      type: propType,
      value: propValue
    }
    if (!validatePropState(propState)) {
      throw new Error(`Could not validate propState ${JSON.stringify(propState, null, 2)}`)
    }
    props[propName] = propState
  })
  return props
}
