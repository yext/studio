import { PossibleModuleNames } from '../../shared/models'

export default function getComponentModuleName(
  name: string,
  imports: Record<string, string[]>,
  isLayout: boolean
): PossibleModuleNames {
  let moduleName = Object.keys(imports).find(importIdentifier => {
    const importedNames = imports[importIdentifier]
    return importedNames.includes(name)
  })
  if (!moduleName) {
    throw new Error(`Could not find import path/module for component "${name}"`)
  }
  if (moduleName.startsWith('.')) {
    moduleName = isLayout ? 'localLayouts' : 'localComponents'
  }
  return moduleName as PossibleModuleNames
}
