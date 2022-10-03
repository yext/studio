import fs from 'fs'
import { ArrowFunction, FunctionDeclaration, Node, ts, VariableDeclaration } from 'ts-morph'
import mapComponentStates from '../../shared/mapComponentStates'
import { PageState, PropState, ComponentMetadata, ComponentState } from '../../shared/models'
import { ExpressionSourceType, PropTypes } from '../../types'
import { getSourceFile, prettify, getDefaultExport, getExportedObjectLiteral, updatePropsObjectLiteral } from '../common'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import getRootPath from '../getRootPath'
import { updateFileImports } from './updateFileImports'

import updateStreamConfig from './updateStreamConfig'

const expressionSourcePaths = {
  [ExpressionSourceType.SiteSettings]: 'src/siteSettings'
}

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
  updateGlobalComponentProps(updatedState.componentsState)
  pageComponent.removeStatement(returnStatementIndex)
  pageComponent.addStatements(newReturnStatement)

  updateFileImports(sourceFile, updatedState.componentsState, expressionSourcePaths)
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

function createReturnStatement(
  { componentsState, layoutState }: PageState,
  currentReturnStatement: Node
): string {
  const elements = mapComponentStates<string>(componentsState, (c, children) => {
    const componentMetadata = moduleNameToComponentMetadata[c.moduleName].components[c.name]
    const isGlobal = componentMetadata.global
    if (isGlobal) {
      if (children.length > 0) {
        throw new Error('Global components cannot have children')
      }
      const globalNode = currentReturnStatement
        .getDescendantsOfKind(ts.SyntaxKind.JsxSelfClosingElement)
        .find(n => n.getTagNameNode().getText() === c.name)
      if (!globalNode) {
        throw new Error(`Unable to find corresponding global component node: ${c.name}`)
      }
      return globalNode.getFullText()
    }
    if (children.length === 0) {
      return `<${c.name} ` + createProps(c.props) + '/>'
    } else {
      return `<${c.name} ` + createProps(c.props) + '>\n' + children.join('\n') + `</${c.name}>`
    }
  }).join('\n')

  const layoutComponentName = layoutState.name
  return `return (\n<${layoutComponentName}>\n${elements}\n</${layoutComponentName}>\n)`
}

function createProps(propState: PropState): string {
  let propsString = ''
  Object.keys(propState).forEach(propName => {
    const propType = propState[propName].type
    const val = propState[propName].value
    if (!propState[propName].isExpression
        && (propType === PropTypes.string || propType === PropTypes.HexColor)) {
      propsString += `${propName}='${val}' `
    } else {
      propsString += `${propName}={${val}} `
    }
  })
  return propsString
}

function updateGlobalComponentProps(updatedComponentState: ComponentState[]) {
  updatedComponentState.forEach(c => {
    const componentMetadata: ComponentMetadata =
      moduleNameToComponentMetadata[c.moduleName].components[c.name]
    if (componentMetadata.global) {
      const partialFilePath = componentMetadata.importIdentifier.split('src/components').at(-1)
      const relativeFilePath = getRootPath(`src/components/${partialFilePath}`)
      const sourceFile = getSourceFile(relativeFilePath)
      const propsLiteralExp = getExportedObjectLiteral(sourceFile, 'globalProps')
      if (!propsLiteralExp) {
        throw new Error(`Unable to find "globalProps" variable for file path: ${relativeFilePath}`)
      }
      updatePropsObjectLiteral(propsLiteralExp, c.props)
      updateFileImports(sourceFile, [c], expressionSourcePaths)
      const updatedFileText = prettify(sourceFile.getFullText())
      fs.writeFileSync(relativeFilePath, updatedFileText)
    }
  })
}
