import { ComponentMetadata, PropState } from '../../shared/models'
import { SourceFile } from 'ts-morph'
import { getPropShapeByInterfaceName, getExportedObjectLiteral, getPropsState, ParseablePropertyStructure, getPropShapeByPropStructures } from '../common'
import path from 'path'

export const pathToPagePreviewDir = path.resolve(__dirname, '../../client/components')

export default function parseComponentMetadata(
  sourceFile: SourceFile,
  filePath: string,
  dataToParsePropsBy: string | ParseablePropertyStructure[],
  componentMetadataOverrides?: {
    initialProps?: PropState,
    importIdentifier?: string
  },
): ComponentMetadata {
  const { propShape, acceptsChildren } = typeof dataToParsePropsBy == 'string'
    ? getPropShapeByInterfaceName(sourceFile, filePath, dataToParsePropsBy)
    : getPropShapeByPropStructures(dataToParsePropsBy, filePath)

  if (isGlobalComponent()) {
    return {
      propShape,
      acceptsChildren,
      global: true,
      editable: false,
      globalProps: parseComponentPropsValue('globalProps'),
      importIdentifier: getImportIdentifier(),
    }
  } else {
    return {
      propShape,
      acceptsChildren,
      global: false,
      editable: true,
      initialProps: componentMetadataOverrides?.initialProps ?? parseComponentPropsValue('initialProps'),
      importIdentifier: getImportIdentifier()
    }
  }

  function getImportIdentifier(): string {
    if (componentMetadataOverrides?.importIdentifier) return componentMetadataOverrides.importIdentifier
    return path.relative(pathToPagePreviewDir, filePath)
  }

  function isGlobalComponent(): boolean {
    return filePath.endsWith('.global.tsx')
  }

  function parseComponentPropsValue(propsVariableName: string): PropState {
    const propsLiteralExp = getExportedObjectLiteral(sourceFile, propsVariableName)
    return propsLiteralExp ? getPropsState(propsLiteralExp, propShape) : {}
  }
}
