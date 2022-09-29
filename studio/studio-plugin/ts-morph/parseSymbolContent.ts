import { JsxElementState } from '../../shared/models'
import { getDefaultExport, getSourceFile } from '../common'
import getTopLevelJsxNode from './getTopLevelJsxNode'
import parseImports from './parseImports'
import parseJsxChild from './parseJsxChild'

export default function parseSymbolContent(filePath: string): JsxElementState[] {
  const sourceFile = getSourceFile(filePath)
  const imports = parseImports(sourceFile)
  const defaultExport = getDefaultExport(sourceFile)
  const topLevelJsxNode = getTopLevelJsxNode(defaultExport)
  const elementStates: JsxElementState[] = parseJsxChild(topLevelJsxNode, imports)
  return elementStates
}
