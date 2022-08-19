import { ComponentMetadata } from '../../shared/models'
import { ts, SourceFile } from 'ts-morph'
import { parsePropertyStructures } from '../common/common'
import path from 'path'
import parseInitialProps from './parseInitialProps'

export const pathToPagePreview = path.resolve(__dirname, '../../client/components/PagePreview')

export default function parseComponentMetadata(
  sourceFile: SourceFile,
  filePath: string,
  interfaceName: string,
  importIdentifier?: string
): ComponentMetadata {
  const propsInterface = sourceFile.getDescendantsOfKind(ts.SyntaxKind.InterfaceDeclaration).find(n => {
    return n.getName() === interfaceName
  })
  if (!propsInterface) {
    throw new Error(`No interface found with name "${interfaceName}" in file "${filePath}"`)
  }
  const properties = propsInterface.getStructure().properties ?? []
  return {
    propShape: parsePropertyStructures(properties, filePath),
    initialProps: parseInitialProps(sourceFile),
    editable: true,
    importIdentifier: getImportIdentifier()
  }

  function getImportIdentifier() {
    if (importIdentifier) return importIdentifier
    return path.relative(pathToPagePreview, filePath)
  }
}
