import { PropShape } from '../../shared/models'
import { ts, SourceFile, ImportSpecifier, InterfaceDeclaration } from 'ts-morph'
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

export function getPropShape(
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