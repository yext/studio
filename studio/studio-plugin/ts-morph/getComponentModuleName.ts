import { InternalModuleNames } from '../../shared/models'

export default function getComponentModuleName(
  name: string,
  imports: Record<string, string[]>,
  isLayout: boolean
): string {
  let moduleName = Object.keys(imports).find(importIdentifier => {
    const importedNames = imports[importIdentifier]
    return importedNames.includes(name)
  })
  if (!moduleName) {
    return InternalModuleNames.LocalComponents
  }
  if (moduleName.startsWith('.')) {
    moduleName = isLayout ? InternalModuleNames.LocalLayouts : InternalModuleNames.LocalComponents
  }
  return moduleName
}

export function getImportPath(name: string, imports: Record<string, string[]>): string {
  const importPath = Object.keys(imports).find(importIdentifier => {
    const importedNames = imports[importIdentifier]
    return importedNames.includes(name)
  })
  if (!importPath) {
    throw new Error(`No import path found for component ${name}`)
  }
  return importPath
}
