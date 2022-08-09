import fs from 'fs'
import { ts } from 'ts-morph'
import { PageState, PropState, PropShape } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getSourceFile, prettify } from './common'
import { moduleNameToComponentMetadata } from '../componentMetadata'

export default function updatePageFile(updatedState: PageState, pageFilePath: string) {
  const file = getRootPath(pageFilePath)
  const sourceFile = getSourceFile(file)
  const pageComponent = sourceFile.getDescendantsOfKind(ts.SyntaxKind.FunctionDeclaration).find(n => {
    return n.isDefaultExport
  })
  if (!pageComponent) {
    throw new Error(`No page component found at "${pageFilePath}"`)
  }

  const returnStatementIndex = pageComponent.getDescendantStatements().findIndex(n => {
    return n.isKind(ts.SyntaxKind.ReturnStatement)
  })

  if (returnStatementIndex < 0) {
    throw new Error(`No return statement found at page: "${pageFilePath}"`)
  }
  pageComponent.removeStatement(returnStatementIndex)
  pageComponent.addStatements(createReturnStatement(updatedState))

  const updatedFileText = prettify(sourceFile.getFullText())
  fs.writeFileSync(file, updatedFileText)
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
    if (propType === 'StreamsDataPath') {
      el += `${propName}={\`${val}\`}`
    } else if (propType === 'string' || propType === 'HexColor') {
      el += `${propName}='${val}' `
    } else {
      el += `${propName}={${val}} `
    }
  })
  el += '/>'
  return el
}
