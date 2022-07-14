import { TSPropShape, TSPropType } from '../../shared/models'
import getRootPath from '../getRootPath'
import { Project, ts } from 'ts-morph'
import { tsCompilerOptions } from './common'
import { specialTypesArray } from '../../types'
import parseImports from './parseImports'
import { resolve } from 'path'

export default function parsePropInterface(filePath: string, componentPropsName: string): TSPropShape {
  const file = getRootPath(filePath)
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  const propsInterface = sourceFile.getDescendantsOfKind(ts.SyntaxKind.InterfaceDeclaration).find(n => {
    return n.getName() === componentPropsName
  })
  if (!propsInterface) {
    throw new Error(`No interface found with name "${componentPropsName}" in file "${filePath}"`)
  }
  const structure = propsInterface.getStructure()
  const properties = structure.properties ?? []
  const props: TSPropShape = {}
  properties.forEach(p => {
    const jsdoc = p.docs?.map(doc => typeof doc === 'string' ? doc : doc.description).join('\n')

    if (isPropType(p.type)) {
      if (validateProp(p.type, filePath)) {
        props[p.name] = {
          type: p.type,
          ...(jsdoc && { doc: jsdoc })
        }
      }
    } else {
      console.error(`Prop type ${p.type} is not recognized. Skipping gracefully.`)
    }
  })
  return props
}

function isPropType(type: unknown): type is TSPropType {
  const types = ['string', 'number', 'boolean'].concat(specialTypesArray)
  return types.some(t => t === type)
}

function validateProp(type: TSPropType, filePath: string): boolean {
  const imports = parseImports(filePath)
  let isValidProp = true
  if (!['string', 'boolean', 'number'].some(t => t === type)) {
    isValidProp = false
    Object.entries(imports).forEach(([path, names]) => {
      if (names.some(name => name === type)) {
        isValidProp = resolve(filePath, '..', path) === resolve(__dirname, '../../types')
      }
    })
  }
  if (!isValidProp) {
    console.error(`Skipping prop type ${type} because it was not imported from the Studio's types.ts.`)
  }
  return isValidProp
}