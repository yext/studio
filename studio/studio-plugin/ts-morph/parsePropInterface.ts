import { TSPropShape } from '../../shared/models'
import { Project, ts } from 'ts-morph'
import { parsePropertyStructures, tsCompilerOptions } from './common'

export default function parsePropInterface(filePath: string, interfaceName: string): TSPropShape {
  console.log('parsing', filePath, interfaceName)
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(filePath)
  const sourceFile = p.getSourceFileOrThrow(filePath)
  const propsInterface = sourceFile.getDescendantsOfKind(ts.SyntaxKind.InterfaceDeclaration).find(n => {
    return n.getName() === interfaceName
  })
  if (!propsInterface) {
    throw new Error(`No interface found with name "${interfaceName}" in file "${filePath}"`)
  }
  const properties = propsInterface.getStructure().properties ?? []
  return parsePropertyStructures(properties, filePath)
}
