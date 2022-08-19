import { JSDocableNodeStructure, JsxOpeningElement, JsxSelfClosingElement, PropertyNamedNodeStructure, SourceFile, ts, TypedNodeStructure, Node, Project, JsxElement, JsxFragment, VariableDeclaration, FunctionDeclaration, JsxAttribute } from 'ts-morph'
import typescript, { ModuleResolutionHost } from 'typescript'
import prettier from 'prettier'
import fs from 'fs'
import { PropTypes } from '../../types'
import parseImports from '../ts-morph/parseImports'
import { resolve } from 'path'
import { PropShape } from '../../shared/models'

// 'typescript' is a CommonJS module, which may not support all module.exports as named exports
const { JsxEmit, resolveModuleName } = typescript

/** TODO(oshi): I will separate this file out into the common folder on the next PR */
export function getComponentNodes(
  parentNode: JsxElement | JsxFragment
): (JsxOpeningElement | JsxSelfClosingElement)[] {
  const nodes = parentNode
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
  return n.getTagNameNode().getText()
}

export function prettify(code: string) {
  return prettier.format(code, {
    parser: 'typescript',
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true
  })
}

export function getPropName(n: Node): string | undefined {
  return n.getFirstDescendantByKind(ts.SyntaxKind.Identifier)?.compilerNode.text
}

export function getJsxAttributeValue(n: JsxAttribute): string | number | boolean {
  const initializer = n.getInitializerOrThrow()
  if (initializer.isKind(ts.SyntaxKind.StringLiteral)) {
    return initializer.compilerNode.text
  }
  const expression = initializer.getExpressionOrThrow()
  if (
    expression.isKind(ts.SyntaxKind.PropertyAccessExpression) ||
    expression.isKind(ts.SyntaxKind.TemplateExpression) ||
    expression.isKind(ts.SyntaxKind.ElementAccessExpression)
  ) {
    return expression.getText()
  } else if (
    expression.isKind(ts.SyntaxKind.NumericLiteral) ||
    expression.isKind(ts.SyntaxKind.FalseKeyword) ||
    expression.isKind(ts.SyntaxKind.TrueKeyword)
  ) {
    return expression.getLiteralValue()
  } else {
    throw new Error('Unrecognized Expression kind: ' + expression.getKindName())
  }
}

export function getPropValue(n: Node): string | number | boolean {
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
  const templateExpression = n.getFirstDescendantByKind(ts.SyntaxKind.TemplateExpression)
  if (templateExpression) {
    const templateStringIncludingBacktiks = templateExpression.getFullText()
    // remove the backtiks which should be the first and last characters
    return templateStringIncludingBacktiks.substring(1, templateStringIncludingBacktiks.length - 1)
  }
  throw new Error('unhandled prop value for node: ' + n.getFullText() + ' with kind: ' + n.getKindName())
}

interface ParseablePropertyStructure extends
  JSDocableNodeStructure, TypedNodeStructure, PropertyNamedNodeStructure {}

export function parsePropertyStructures(properties: ParseablePropertyStructure[], filePath: string) {
  const props: PropShape = {}

  let imports: Record<string, string[]>
  properties.forEach(p => {
    const jsdoc = p.docs?.map(doc => typeof doc === 'string' ? doc : doc.description).join('\n')
    const propType = p.type
    if (!isPropType(propType) || !isRecognized(propType)) {
      console.error(`Prop type ${propType} is not one of the recognized PropTypes. Skipping.`)
      return
    }
    props[p.name] = {
      type: propType,
      ...(jsdoc && { doc: jsdoc })
    }
  })
  return props

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

export function resolveNpmModule(moduleName: string): string {
  const customModuleResolutionHost: ModuleResolutionHost = {
    fileExists(fileName) {
      return fs.existsSync(resolveTsFileName(fileName))
    },
    readFile(fileName) {
      return fs.readFileSync(resolveTsFileName(fileName), 'utf-8')
    }
  }

  const { resolvedModule } = resolveModuleName(moduleName, '', {}, customModuleResolutionHost)
  if (!resolvedModule) {
    throw new Error(`Could not resolve module: "${moduleName}"`)
  }
  const absPath = resolveTsFileName(resolvedModule.resolvedFileName)
  return absPath

  function resolveTsFileName(fileName: string) {
    return resolve(__dirname, '../../..', fileName)
  }
}

/** This is for development/testing purposes only */
export function writeNodeToFile(compilerNode: any, testFileName = 'test.json') {
  fs.writeFileSync(testFileName, JSON.stringify(compilerNode, (key, val) => {
    if (['parent', 'pos', 'end', 'flags', 'modifierFlagsCache', 'transformFlags'].includes(key) || key.startsWith('_')) {
      return undefined
    }
    if (key === 'kind') {
      return ts.SyntaxKind[val]
    }
    return val
  }, 2))
}

export function getSourceFile(file: string): SourceFile {
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(file)
  return p.getSourceFileOrThrow(file)
}

export function getDefaultExport(sourceFile: SourceFile): VariableDeclaration | FunctionDeclaration {
  const declarations = sourceFile.getDefaultExportSymbolOrThrow().getDeclarations()
  if (declarations.length === 0) {
    throw new Error('Error getting default export')
  }
  const node = declarations[0]
  if (node.isKind(ts.SyntaxKind.ExportAssignment)) {
    const identifierName = node.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier).getText()
    return sourceFile.getVariableDeclarationOrThrow(identifierName)
  } else if (node.isKind(ts.SyntaxKind.FunctionDeclaration)) {
    return node
  }
  throw new Error('Error getting default export, no ExportAssignment or FunctionDeclaration found')
}