import { ComponentMetadata, PropState } from '../../shared/models'
import { SourceFile } from 'ts-morph'
import { getPropShape, getExportedObjectLiteral, getPropsState } from '../common'
import path from 'path'

export const pathToPagePreview = path.resolve(__dirname, '../../client/components/PagePreview')

export default function parseComponentMetadata(
  sourceFile: SourceFile,
  filePath: string,
  interfaceName: string,
  importIdentifier?: string
): ComponentMetadata {
  const propShape = getPropShape(sourceFile, filePath, interfaceName)
  if (isGlobalComponent()) {
    return {
      propShape,
      global: true,
      editable: false,
      globalProps: parseComponentPropsValue('globalProps'),
      importIdentifier: getImportIdentifier(),
    }
  } else {
    return {
      propShape,
      global: false,
      editable: true,
      initialProps: parseComponentPropsValue('initialProps'),
      importIdentifier: getImportIdentifier()
    }
  }

  function getImportIdentifier(): string {
    if (importIdentifier) return importIdentifier
    return path.relative(pathToPagePreview, filePath)
  }

  function isGlobalComponent(): boolean {
    return filePath.endsWith('.global.tsx')
  }

  function parseComponentPropsValue(propsVariableName: string): PropState {
    const propsLiteralExp = getExportedObjectLiteral(sourceFile, propsVariableName)
    return propsLiteralExp ? getPropsState(propsLiteralExp, propShape) : {}
  }
}
