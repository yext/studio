import StudioSourceFile from './StudioSourceFile'

enum FileMetadataKind {
  Component = 'componentMetadata',
}

type ComponentMetadata = {
  kind: FileMetadataKind.Component,
  initialProps?: PropValues,
  propShape?: PropShape,
  acceptsChildren?: boolean
}

type PropShape = Omit<{
  [propName: string]: PropMetadata
}, SpecialReactProps> & {
    [propName in SpecialReactProps]?: never
  }

enum SpecialReactProps {
  Children = 'children'
}

type PropMetadata = {
  type: PropValueType,
  doc?: string
}

enum PropStateKinds {
  Literal = 'literal'
}

enum PropValueType {
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  ReactNode = 'ReactNode',
  HexColor = 'HexColor',
}

type PropValues = {
  [propName: string]: PropVal
}
type PropVal = LiteralProp

type LiteralProp = {
  kind: PropStateKinds.Literal
} & (NumberProp | StringProp | BooleanProp | HexColorProp)

type NumberProp = {
  valueType: PropValueType.number,
  value: number
}
type StringProp = {
  valueType: PropValueType.string,
  value: string
}
type BooleanProp = {
  valueType: PropValueType.boolean,
  value: boolean
}
type HexColorProp = {
  valueType: PropValueType.HexColor,
  value: string
}

import path from 'path'

export default class ComponentFile {
  private studioSourceFile: StudioSourceFile
  private componentName: string

  constructor(filepath: string) {
    this.componentName = path.basename(filepath, '.tsx')
    this.studioSourceFile = new StudioSourceFile(filepath)
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
    const initialProps = this.studioSourceFile.getExportedObjectLiteralOrThrow
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
      if (!isPropValueType(type)) {
        console.error("Unrecognized prop type", type, "in props interface for", this.componentName)
        return
      }
      if (!isPrimitiveProp(type) && !studioImports.includes(type)) {
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
      initialProps
    }
  }
}

function isPrimitiveProp(propValueType: PropValueType) {
  return [
    PropValueType.boolean,
    PropValueType.string,
    PropValueType.number
  ].includes(propValueType)
}

function isPropValueType(type: string): type is PropValueType {
  const propTypes = Object.values(PropValueType)
  return propTypes.includes(type as PropValueType)
}