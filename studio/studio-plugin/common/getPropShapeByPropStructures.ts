import { JSDocableNodeStructure, PropertyNamedNodeStructure, TypedNodeStructure } from 'ts-morph'
import { PropTypes } from '../../types'
import parseImports from '../ts-morph/parseImports'
import { resolve } from 'path'
import { PropShape, SpecialReactProps } from '../../shared/models'

export interface ParseablePropertyStructure extends
  JSDocableNodeStructure, TypedNodeStructure, PropertyNamedNodeStructure {}

/**
 * Returns the {@link PropShape} and also whether or not the component accepts React children.
 */
export function getPropShapeByPropStructures(
  properties: ParseablePropertyStructure[],
  filePath: string
): { propShape: PropShape, acceptsChildren: boolean } {
  const propShape: PropShape = {}

  let imports: Record<string, string[]>
  let acceptsChildren = false
  properties.forEach(p => {
    if (Object.values(SpecialReactProps).includes(p.name as SpecialReactProps)) {
      if (p.name === SpecialReactProps.Children) {
        acceptsChildren = true
      }
      return
    }
    const jsdoc = p.docs?.map(doc => typeof doc === 'string' ? doc : doc.description).join('\n')
    const propType = p.type
    if (!isPropType(propType) || !isRecognized(propType)) {
      console.error(`Prop type ${propType} is not one of the recognized PropTypes. Skipping.`)
      return
    }
    propShape[p.name] = {
      type: propType,
      ...(jsdoc && { doc: jsdoc })
    }
  })
  return { propShape, acceptsChildren }

  function isRecognized(type: PropTypes): boolean {
    if (!imports) {
      imports = parseImports(filePath)
    }

    if ([PropTypes.string, PropTypes.boolean, PropTypes.number].includes(type)) {
      return true
    }
    const isValidProp = !!Object.entries(imports).find(([path, names]) => {
      if (names.some(name => name === type)) {
        return resolve(filePath, '..', path) === resolve(__dirname, '../../types')
      }
      return false
    })
    if (!isValidProp) {
      console.error(`Skipping prop type ${type} because it was not imported from the Studio's types.ts.`)
    }
    return isValidProp
  }

  function isPropType(type: unknown): type is PropTypes {
    if (typeof type !== 'string') {
      return false
    }
    const propTypes = Object.values(PropTypes)
    return propTypes.includes(type as PropTypes)
  }
}