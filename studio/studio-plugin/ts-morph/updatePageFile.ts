import fs from 'fs'
import { ts } from 'ts-morph'
import { ModuleNameToComponentMetadata, PageComponentsState } from '../../shared/models'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import getRootPath from '../getRootPath'
import { getSourceFile, prettify } from './common'

export default function updatePageFile(
  updatedState: PageComponentsState,
  pageFilePath: string
) {
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

function createReturnStatement(updatedState: PageComponentsState) {
  const elements = updatedState.reduce((prev, next) => {
    return prev + '\n' + createJsxSelfClosingElement(next, moduleNameToComponentMetadata)
  }, '')
  return `return (\n<Layout>\n${elements}\n</Layout>\n)`
}

function createJsxSelfClosingElement(
  { name, props, moduleName }: PageComponentsState[number],
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata
) {
  const componentMetadata = moduleNameToComponentMetadata[moduleName][name]
  let el = `<${name} `
  Object.keys(props).forEach(propName => {
    console.log(propName)
    const propType = componentMetadata.propShape[propName].type
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