import fs from 'fs'
import { ArrowFunction, FunctionDeclaration, Node, ts, VariableDeclaration } from 'ts-morph'
import { PageState, PropState } from '../../shared/models'
import { PropTypes } from '../../types'
import { getDefaultExport, getSourceFile, prettify } from '../common/common'

export default function updatePageFile(
  updatedState: PageState,
  pageFilePath: string
) {
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
    return prev + '\n' + createJsxSelfClosingElement(next.name, next.props)
  }, '')
  const layoutComponentName = updatedState.layoutState.name
  return `return (\n<${layoutComponentName}>\n${elements}\n</${layoutComponentName}>\n)`
}

function createJsxSelfClosingElement(
  elementName: string,
  props: PropState
) {
  let el = `<${elementName} `
  Object.keys(props).forEach(propName => {
    const propType = props[propName].type
    const val = props[propName].value
    if (propType === PropTypes.string || propType === PropTypes.HexColor) {
      el += `${propName}='${val}' `
    } else {
      el += `${propName}={${val}} `
    }
  })
  el += '/>'
  return el
}
