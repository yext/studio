import { ComponentState } from '../../shared/models'
import { getDefaultExport, getSourceFile } from '../common'
import getTopLevelJsxNode from './getTopLevelJsxNode'
import parseImports from './parseImports'
import parseJsxChild from './parseJsxChild'

export default function parseSymbolContent(filePath: string): ComponentState[] {
  const sourceFile = getSourceFile(filePath)
  const imports = parseImports(sourceFile)
  const defaultExport = getDefaultExport(sourceFile)
  const topLevelJsxNode = getTopLevelJsxNode(defaultExport)
  return parseJsxChild(topLevelJsxNode, imports)
}
