import { ComponentMetadata, PropShape, PropState } from '../../shared/models'
import { ts, SourceFile, ImportSpecifier, InterfaceDeclaration } from 'ts-morph'
import { getPropsState, getSourceFile, parsePropertyStructures } from '../common'
import path from 'path'

export const pathToPagePreview = path.resolve(__dirname, '../../client/components/PagePreview')

/**
 * Recursively find the props interface starting from the provided file path and its import declarations.
 *
 * @returns the interface declaration node and the file path where the node is found.
 */
function getPropsInterfaceDeclaration(
  sourceFile: SourceFile,
  filePath: string,
  interfaceName: string
): { propsInterfaceNode: InterfaceDeclaration, propsFilePath: string } {
  const propsInterface = sourceFile.getDescendantsOfKind(ts.SyntaxKind.InterfaceDeclaration).find(n => {
    return n.getName() === interfaceName
  })
  // props interface defined the same file
  if (propsInterface) {
    return {
      propsInterfaceNode: propsInterface,
      propsFilePath: filePath
    }
  }

  // props interface imported in another file
  let importSpecifier: ImportSpecifier | undefined
  sourceFile.getDescendantsOfKind(ts.SyntaxKind.NamedImports).forEach(n => {
    importSpecifier = n.getChildrenOfKind(ts.SyntaxKind.ImportSpecifier).find(importSpecifier => {
      return importSpecifier
        .getChildrenOfKind(ts.SyntaxKind.Identifier)
        .find(identifier => identifier.getText() === interfaceName)
    })
  })
  if (!importSpecifier) {
    throw new Error(`No interface found with name "${interfaceName}" in file "${filePath}"`)
  }
  const importedInterfaceName = importSpecifier.getFirstChild()?.getText()
  if (!importedInterfaceName) {
    throw new Error(`Error parsing original import specifier for interface "${interfaceName}"`)
  }
  const importRelativePathStr = importSpecifier
    .getFirstAncestorByKind(ts.SyntaxKind.ImportDeclaration)?.getModuleSpecifier().getText()
  if (!importRelativePathStr) {
    throw new Error(`Error parsing import path for for "${interfaceName}"`)
  }
  const importRelativePath = importRelativePathStr.substring(1, importRelativePathStr.length - 1) + '.tsx'
  filePath = path.resolve(path.dirname(filePath), importRelativePath)
  const importSourceFile = getSourceFile(filePath)
  return getPropsInterfaceDeclaration(importSourceFile, filePath, importedInterfaceName)
}

function getPropShape(
  sourceFile: SourceFile,
  filePath: string,
  interfaceName: string
): PropShape {
  const {
    propsInterfaceNode,
    propsFilePath
  } = getPropsInterfaceDeclaration(sourceFile, filePath, interfaceName)
  const properties = propsInterfaceNode.getStructure().properties ?? []
  return parsePropertyStructures(properties, propsFilePath)
}

export default function parseComponentMetadata(
  sourceFile: SourceFile,
  filePath: string,
  interfaceName: string,
  importIdentifier?: string
): ComponentMetadata {
  const propShape = getPropShape(sourceFile, filePath, interfaceName)
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
