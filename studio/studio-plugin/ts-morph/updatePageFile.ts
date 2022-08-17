import fs from 'fs'
import { ArrowFunction, FunctionDeclaration, Node, ts, VariableDeclaration } from 'ts-morph'
import { PageState, PropState, PropShape } from '../../shared/models'
import { getDefaultExport, getSourceFile, prettify } from './common'
import { moduleNameToComponentMetadata } from '../componentMetadata'

export default function updatePageFile(updatedState: PageState, pageFilePath: string) {
  const sourceFile = getSourceFile(pageFilePath)
  const defaultExport = getDefaultExport(sourceFile)
  const pageComponent = getPageComponentFunction(defaultExport)
  const returnStatementIndex = pageComponent.getDescendantStatements().findIndex(n => {
    return n.isKind(ts.SyntaxKind.ReturnStatement)
  })

  if (returnStatementIndex < 0) {
    throw new Error(`No return statement found at page: "${pageFilePath}"`)
  }
  pageComponent.removeStatement(returnStatementIndex)
  pageComponent.addStatements(createReturnStatement(updatedState))

  const updatedFileText = prettify(sourceFile.getFullText())
  fs.writeFileSync(pageFilePath, updatedFileText)
}

function getPageComponentFunction(
  defaultExport: VariableDeclaration | FunctionDeclaration
): FunctionDeclaration | ArrowFunction {
  if (defaultExport.isKind(ts.SyntaxKind.VariableDeclaration)) {
    const arrowFunction = defaultExport.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ArrowFunction)
    return arrowFunction
  } else if (defaultExport.isKind(ts.SyntaxKind.FunctionDeclaration)) {
    return defaultExport
  }
  throw new Error('Unhandled page component type: ' + (defaultExport as Node).getKindName())
}

function createReturnStatement(updatedState: PageState) {
  const elements = updatedState.componentsState.reduce((prev, next) => {
    if (!next.moduleName) {
      return prev
    }
    const componentMetadata = moduleNameToComponentMetadata[next.moduleName][next.name]
    if (!componentMetadata.propShape) {
      return prev
    }
    return prev + '\n' + createJsxSelfClosingElement(next.name, componentMetadata.propShape, next.props)
  }, '')
  const layoutComponentName = updatedState.layoutState.name
  return `return (\n<${layoutComponentName}>\n${elements}\n</${layoutComponentName}>\n)`
}

function createJsxSelfClosingElement(
  elementName: string,
  propShape: PropShape,
  props: PropState
) {
  let el = `<${elementName} `
  Object.keys(props).forEach(propName => {
    const propType = propShape[propName].type
    const val = props[propName]
    if (propType === 'string' || propType === 'HexColor') {
      el += `${propName}='${val}' `
    } else {
      el += `${propName}={${val}} `
    }
  })
  el += '/>'
  return el
}
