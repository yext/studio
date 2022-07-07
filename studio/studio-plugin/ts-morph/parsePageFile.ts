import path from 'path'
import { Project, ts, JsxAttribute } from 'ts-morph'
import getRootPath from '../getRootPath'
import { getComponentNodes, tsCompilerOptions } from './common'

export default function parsePageFile() {
  const file = path.resolve(getRootPath('src/pages/index.tsx'))
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  const usedComponents = getComponentNodes(sourceFile)
  return usedComponents.map(n => {
    const componentData = {
      name: n.compilerNode.tagName.escapedText,
      props: {}
    }
    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach(a => {
      const propName = a.getFirstDescendantByKind(ts.SyntaxKind.Identifier).compilerNode.text
      const propValue = getPropValue(a)
      componentData.props[propName] = propValue
    })
    return componentData
  })
}

function getPropValue(n: JsxAttribute) {
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