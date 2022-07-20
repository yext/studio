import { JSDocableNodeStructure, JsxOpeningElement, JsxSelfClosingElement, PropertyNamedNodeStructure, SourceFile, ts, TypedNodeStructure, Node } from 'ts-morph'
import { JsxEmit } from 'typescript'
import prettier from 'prettier'
import fs from 'fs'
import { resolveModuleName, ModuleResolutionHost } from 'typescript'
import { specialTypesArray } from '../../types'
import parseImports from './parseImports'
import { resolve } from 'path'
import { ComponentMetadata, PropMetadata, PropShape, PropType } from '../../shared/models'

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

interface ParseablePropertyStructure extends
  JSDocableNodeStructure, TypedNodeStructure, PropertyNamedNodeStructure {}

export function parsePropertyStructures(properties: ParseablePropertyStructure[], filePath: string) {
  const props: PropShape = {}

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

  function validateProp(type: PropType): boolean {
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

  function isPropType(type: unknown): type is PropType {
    const types = ['string', 'number', 'boolean'].concat(specialTypesArray)
    return types.some(t => t === type)
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
