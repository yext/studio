import { Project, ts, JsxAttribute } from 'ts-morph'
import { PageComponentsState } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getComponentName, getComponentNodes, tsCompilerOptions } from './common'
import { v1 } from 'uuid'

export default function parsePageFile(filePath): PageComponentsState {
  const file = getRootPath(filePath)
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  const usedComponents = getComponentNodes(sourceFile)
  return usedComponents.map(n => {
    const componentData = {
      name: getComponentName(n),
      props: {},
      uuid: v1()
    }
    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach(a => {
      const propName = a.getFirstDescendantByKind(ts.SyntaxKind.Identifier)?.compilerNode.text
      if (!propName) {
        throw new Error('Could not parse page file')
      }
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