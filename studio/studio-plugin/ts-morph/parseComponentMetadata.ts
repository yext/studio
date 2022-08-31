import { ComponentMetadata, PropShape, PropState } from '../../shared/models'
import { ts, SourceFile } from 'ts-morph'
import { getPropsState, parsePropertyStructures } from '../common'
import path from 'path'

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
  const propShape = parsePropertyStructures(properties, filePath)
  const componentMetaData: ComponentMetadata = {
    propShape,
    editable: true,
    initialProps: parseInitialProps(sourceFile, propShape),
    importIdentifier: getImportIdentifier()
  }
  const isGlobalComponent = !!sourceFile.getExportSymbols().find(s => s.getEscapedName() === 'globalProps')
  if (isGlobalComponent) {
    componentMetaData.editable = false
    componentMetaData.global = true
  }
  return componentMetaData

  function getImportIdentifier() {
    if (importIdentifier) return importIdentifier
    return path.relative(pathToPagePreview, filePath)
  }
}

export function parseInitialProps(sourceFile: SourceFile, propShape: PropShape): PropState {
  const exportSymbols = sourceFile.getExportSymbols()
  const propSymbol = exportSymbols.find(s => s.getEscapedName() === 'globalProps')
    ?? exportSymbols.find(s => s.getEscapedName() === 'initialProps')
  if (!propSymbol) {
    return {}
  }
  const initialPropsLiteralExp = propSymbol
    .getValueDeclaration()
    ?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
  return initialPropsLiteralExp ? getPropsState(initialPropsLiteralExp, propShape) : {}
}
