import StudioSourceFile from './StudioSourceFile'
import path from 'path'
import { ComponentMetadata, FileMetadataKind, PropShape, PropValueKind, PropValues, SpecialReactProps } from '../types'
import TypeGuards from './TypeGuards'

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFile: StudioSourceFile
  private componentName: string

  constructor(filepath: string) {
    this.componentName = path.basename(filepath, '.tsx')
    this.studioSourceFile = new StudioSourceFile(filepath)
  }

  getInitialProps(propShape: PropShape): PropValues {
    const rawValues =
      this.studioSourceFile.parseExportedObjectLiteral('initialProps')
    const propValues: PropValues = {}
    Object.keys(rawValues).forEach(propName => {
      const { value, isExpression } = rawValues[propName]
      const propValue = {
        valueType: propShape[propName].type,
        kind: isExpression ? PropValueKind.Expression : PropValueKind.Literal,
        value,
      }
      if (!TypeGuards.isValidPropValue(propValue)) {
        throw new Error('Invalid prop value: ' + JSON.stringify(propValue, null, 2))
      }
    })
    return propValues
  }

  getComponentMetadata(): ComponentMetadata {
    const propsInterface =
      this.studioSourceFile.getInterfaceByName(`${this.componentName}Props`)
    const properties = propsInterface.getStructure().properties
    if (!properties) {
      return {
        kind: FileMetadataKind.Component,
      }
    }

    const studioImports = this.studioSourceFile.getImportsFromStudio()
    const propShape: PropShape = {}
    let acceptsChildren = false

    properties.forEach(p => {
      const { name: propName, type } = p
      if (typeof type !== 'string') {
        console.error("Unable to parse prop:", propName, "for props interface for", this.componentName)
        return
      }
      if (propName === SpecialReactProps.Children) {
        acceptsChildren = propName === SpecialReactProps.Children
        return
      }
      if (!TypeGuards.isPropValueType(type)) {
        console.error("Unrecognized prop type", type, "in props interface for", this.componentName)
        return
      }
      if (!TypeGuards.isPrimitiveProp(type) && !studioImports.includes(type)) {
        console.error("Missing import for", type, "in props interface for", this.componentName)
      }

      const jsdoc = p.docs?.map(doc => typeof doc === 'string' ? doc : doc.description).join('\n')
      propShape[p.name] = {
        type,
        ...(jsdoc && { doc: jsdoc })
      }
    })

    return {
      kind: FileMetadataKind.Component,
      propShape,
      acceptsChildren,
      initialProps: this.getInitialProps(propShape)
    }
  }
}
