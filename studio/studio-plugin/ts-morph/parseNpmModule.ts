import { resolveNpmModule } from '../common'
import { ModuleMetadata } from '../../shared/models'
import { pathToPagePreviewDir } from './parseComponentMetadata'
import path from 'path'
import { StudioNpmModulePlugin } from '../../shared/StudioNpmModulePlugin'
import getModuleCssImports from './getModuleCssImports'
import getModuleComponentMetadata from './getModuleComponentMetadata'

/**
 * Parses out the prop structures of all listed exported components for a particular npm module.
 * Also process any css imports defined in the module plugin for the components to display properly.
 *
 * Currently only supports functional react components and prop types defined in "PropTypes" enum.
 */
export default function parseNpmModule(
  plugin: StudioNpmModulePlugin
): ModuleMetadata {
  const moduleName = plugin.moduleName
  const absPath = resolveNpmModule(moduleName)
  const pathToNodeModulesDir = absPath.split(moduleName)[0]
  const importIdentifier = path.relative(pathToPagePreviewDir, pathToNodeModulesDir + moduleName)

  const moduleMetadata: ModuleMetadata = {
    cssImports: getModuleCssImports(plugin.cssImports, pathToNodeModulesDir),
    components: getModuleComponentMetadata(absPath, importIdentifier, plugin.exports)
  }
  return moduleMetadata
}
