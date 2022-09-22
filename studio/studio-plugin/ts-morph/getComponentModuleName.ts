import { PossibleModuleNames } from '../../shared/models'

export default function getComponentModuleName(
  name: string,
  imports: Record<string, string[]>,
  isLayout: boolean
): PossibleModuleNames {
  let importPath = getImportPath(name, imports)
  if (!importPath) {
    return 'builtIn'
  }
  if (importPath.startsWith('.')) {
    return isLayout ? 'localLayouts' : 'localComponents'
  }
  throw new Error(`Unknown component import path ${importPath} for component ${name}`)
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