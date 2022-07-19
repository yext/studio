import { InterfaceDeclaration, JsxOpeningElement, JsxSelfClosingElement, SourceFile, Node, ts } from 'ts-morph'
import { JsxEmit } from 'typescript'
import prettier from 'prettier'
import { TSPropShape, TSPropType } from '../../shared/models'
import { specialTypesArray } from '../../types'
import parseImports from './parseImports'
import { resolve } from 'path'

export function getComponentNodes(sourceFile: SourceFile): (JsxOpeningElement | JsxSelfClosingElement)[] {
  const nodes = sourceFile
    .getDescendants()
    .filter(n => {
      return n.isKind(ts.SyntaxKind.JsxOpeningElement) || n.isKind(ts.SyntaxKind.JsxSelfClosingElement)
    }) as (JsxOpeningElement | JsxSelfClosingElement)[]
  return nodes
}

export const tsCompilerOptions = {
  compilerOptions: {
    jsx: JsxEmit.ReactJSX
  }
}

export function getComponentName(n: JsxOpeningElement | JsxSelfClosingElement): string {
  const componentName = n.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier).getText()
  return componentName
}

export function prettify(code: string) {
  return prettier.format(code, {
    parser: 'typescript',
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true
  })
}

export function getPropValue(n: Node) {
  const stringNode = n.getFirstDescendantByKind(ts.SyntaxKind.StringLiteral)
  if (stringNode) {
    return stringNode.compilerNode.text
  }
  if (n.getFirstDescendantByKind(ts.SyntaxKind.TrueKeyword)) return true
  if (n.getFirstDescendantByKind(ts.SyntaxKind.FalseKeyword)) return false
  const numberNode = n.getFirstDescendantByKind(ts.SyntaxKind.NumericLiteral)
  if (numberNode) {
    return parseFloat(numberNode.compilerNode.text)
  }
  throw new Error('unhandled prop value for node: ' + n.compilerNode)
}

export function parseInterfaceDeclaration(propsInterface: InterfaceDeclaration, filePath: string) {
  const structure = propsInterface.getStructure()
  const properties = structure.properties ?? []
  const props: TSPropShape = {}

  let imports: Record<string, string[]>
  properties.forEach(p => {
    const jsdoc = p.docs?.map(doc => typeof doc === 'string' ? doc : doc.description).join('\n')

    if (isPropType(p.type)) {
      if (['string', 'number', 'boolean'].includes(p.type) || validateProp(p.type)) {
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

  function validateProp(type: TSPropType): boolean {
    if (!imports) {
      imports = parseImports(filePath)
    }

    if (['string', 'boolean', 'number'].includes(type)) {
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

  function isPropType(type: unknown): type is TSPropType {
    const types = ['string', 'number', 'boolean'].concat(specialTypesArray)
    return types.some(t => t === type)
  }
}
