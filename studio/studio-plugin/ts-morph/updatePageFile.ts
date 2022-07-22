import fs from 'fs'
import { ts } from 'ts-morph'
import { PageComponentsState } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getSourceFile, prettify } from './common'

export default function updatePageFile(updatedState: PageComponentsState, pageFilePath) {
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
    return prev + '\n' + createJsxSelfClosingElement(next)
  }, '')
  return `return (\n<>\n${elements}\n</>\n)`
}

function createJsxSelfClosingElement({ name, props }: PageComponentsState[number]) {
  let el = `<${name} `
  Object.keys(props).forEach(p => {
    const val = props[p]
    if (typeof props[p] === 'string') {
      el += `${p}='${val}' `
    } else {
      el += `${p}={${val}} `
    }
  })
  el += '/>'
  return el
}