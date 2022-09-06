import fs from 'fs'
import { ArrowFunction, FunctionDeclaration, Node, ts, VariableDeclaration } from 'ts-morph'
import { PageState, PropState, ComponentMetadata } from '../../shared/models'
import { PropTypes } from '../../types'
import { getSourceFile, prettify, getDefaultExport, getPropsLiteralExpression, updatePropsValue } from '../common'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import getRootPath from '../getRootPath'

import updateStreamConfig from './updateStreamConfig'

interface UpdatePageFileOptions {
  updateStreamConfig?: boolean
}

export default function updatePageFile(
  updatedState: PageState,
  pageFilePath: string,
  options: UpdatePageFileOptions = {}
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
  const currentReturnStatement = pageComponent.getStatements()[returnStatementIndex]
  const newReturnStatement = createReturnStatement(updatedState, currentReturnStatement)
  pageComponent.removeStatement(returnStatementIndex)
  pageComponent.addStatements(newReturnStatement)

  if (options.updateStreamConfig) {
    updateStreamConfig(sourceFile, updatedState.componentsState)
  }

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

function createReturnStatement(updatedState: PageState, currentReturnStatement: Node) {
  const elements = updatedState.componentsState.reduce((prev, next) => {
    const componentMetadata: ComponentMetadata = moduleNameToComponentMetadata[next.moduleName][next.name]
    // Reuse the same attributes for global components set in the page,
    // and update globbalProps from the corresponding global component file.
    if (componentMetadata.global) {
      const globalNode = currentReturnStatement
        .getDescendantsOfKind(ts.SyntaxKind.JsxSelfClosingElement)
        .find(n => n.getTagNameNode().getText() === next.name)
      if (!globalNode) {
        throw new Error(`Unable to find corresponding global component node: ${next.name}`)
      }
      updateGlobalComponentProps(componentMetadata, next.props)
      return prev + '\n' + globalNode.getFullText()
    }
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

function updateGlobalComponentProps(componentMetadata: ComponentMetadata, updatedState: PropState) {
  const partialFilePath = componentMetadata.importIdentifier.split('src/components').at(-1)
  const relativeFilePath = getRootPath(`src/components/${partialFilePath}`)
  const sourceFile = getSourceFile(relativeFilePath)
  const propsLiteralExp = getPropsLiteralExpression(sourceFile, 'globalProps')
  if (!propsLiteralExp) {
    throw new Error(`Unable to find "globalProps" variable for file path: ${relativeFilePath}`)
  }
  updatePropsValue(propsLiteralExp, updatedState)
  const updatedFileText = prettify(sourceFile.getFullText())
  fs.writeFileSync(relativeFilePath, updatedFileText)
}
