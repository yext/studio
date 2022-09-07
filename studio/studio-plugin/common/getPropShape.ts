import { PropShape } from '../../shared/models'
import { ts, SourceFile, ImportSpecifier, InterfaceDeclaration, OptionalKind, PropertySignatureStructure } from 'ts-morph'
import path from 'path'
import { getSourceFile } from './getSourceFile'
import { parsePropertyStructures } from './parsePropertyStructures'

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
  // props interface defined in the same file
  if (propsInterface) {
    return {
      propsInterfaceNode: propsInterface,
      propsFilePath: filePath
    }
  }

  // props interface imported from another file
  let importSpecifier: ImportSpecifier | undefined
  sourceFile.getDescendantsOfKind(ts.SyntaxKind.NamedImports).some(n => {
    importSpecifier = n.getChildrenOfKind(ts.SyntaxKind.ImportSpecifier).find(importSpecifier => {
      return importSpecifier
        .getChildrenOfKind(ts.SyntaxKind.Identifier)
        .find(identifier => identifier.getText() === interfaceName)
    })
    return !!importSpecifier
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

/**
 * Returns the {@link PropShape} and also whether or not the component accepts React children.
 */
export function getPropShape(
  sourceFile: SourceFile,
  filePath: string,
  interfaceName: string
) {
  const {
    propsInterfaceNode,
    propsFilePath
  } = getPropsInterfaceDeclaration(sourceFile, filePath, interfaceName)
  const properties: OptionalKind<PropertySignatureStructure>[]
    = propsInterfaceNode.getStructure().properties ?? []
  return parsePropertyStructures(properties, propsFilePath)
}