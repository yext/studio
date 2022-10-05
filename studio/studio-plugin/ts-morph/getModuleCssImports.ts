import { CssImport } from '../../shared/models'
import { pathToPagePreviewDir } from './parseComponentMetadata'
import path from 'path'

export default function getModuleCssImports(
  pluginCssImports: string[] | undefined,
  pathToNodeModulesDir: string
): CssImport[] | undefined {
  return pluginCssImports?.map(cssImportIdentifier => {
    return {
      moduleExportPath: cssImportIdentifier,
      relativePath: path.relative(
        pathToPagePreviewDir,
        path.resolve(pathToNodeModulesDir, require.resolve(cssImportIdentifier))
      )
    }
  })
}