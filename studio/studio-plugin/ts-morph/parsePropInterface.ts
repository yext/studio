import { ComponentMetadata } from '../../shared/models'
import { Project, ts } from 'ts-morph'
import { parsePropertyStructures, tsCompilerOptions } from './common'
import path from 'path'

const pathToPagePreview = path.resolve(__dirname, '../../client/components/PagePreview')

// TODO(oshi): rename to parseComponentMetadata
export default function parsePropInterface(
  filePath: string,
  interfaceName: string,
  importIdentifier?: string
): ComponentMetadata {
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
  return {
    propShape: parsePropertyStructures(properties, filePath),
    importIdentifier: getImportIdentifier()
  }

  function getImportIdentifier() {
    if (importIdentifier) return importIdentifier
    return path.relative(pathToPagePreview, filePath)
  }
}
