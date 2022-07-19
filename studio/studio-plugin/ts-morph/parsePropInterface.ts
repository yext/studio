import { TSPropShape, TSPropType } from '../../shared/models'
import getRootPath from '../getRootPath'
import { Project, ts } from 'ts-morph'
import { parseInterfaceDeclaration, tsCompilerOptions } from './common'

export default function parsePropInterface(filePath: string, interfaceName: string): TSPropShape {
  const file = getRootPath(filePath)
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  const propsInterface = sourceFile.getDescendantsOfKind(ts.SyntaxKind.InterfaceDeclaration).find(n => {
    return n.getName() === interfaceName
  })
  if (!propsInterface) {
    throw new Error(`No interface found with name "${interfaceName}" in file "${filePath}"`)
  }
  return parseInterfaceDeclaration(propsInterface, filePath)
}
