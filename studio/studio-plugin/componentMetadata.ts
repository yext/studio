import { ComponentMetadata, ModuleMetadata, ModuleNameToComponentMetadata } from '../shared/models'
import fs from 'fs'
import getRootPath from './getRootPath'
import { getSourceFile, resolveNpmModule } from './common'
import path from 'path'
import parseComponentMetadata, { pathToPagePreview } from './ts-morph/parseComponentMetadata'
import studioConfig from '../../src/studio'

const localComponents: ModuleMetadata = { components: {} }
localComponents.components = fs
  .readdirSync(getRootPath('src/components'), 'utf-8')
  .reduce((prev, curr) => {
    const componentName = curr.substring(0, curr.indexOf('.'))
    prev[componentName] = parseComponentMetadata(
      getSourceFile(getRootPath(`src/components/${curr}`)),
      getRootPath(`src/components/${curr}`),
      `${componentName}Props`
    )
    return prev
  }, {} as Record<string, ComponentMetadata>)

const localLayouts: ModuleMetadata = { components: {} }
localLayouts.components = fs
  .readdirSync(getRootPath('src/layouts'), 'utf-8')
  .reduce((prev, curr) => {
    const componentName = curr.substring(0, curr.indexOf('.'))
    prev[componentName] = {
      acceptsChildren: true,
      global: false,
      editable: false,
      importIdentifier: path.relative(pathToPagePreview, getRootPath(`src/layouts/${curr}`))
    }
    return prev
  }, {} as Record<string, ComponentMetadata>)

const npmComponents: Record<string, ModuleMetadata> = {}
studioConfig.npmComponents?.forEach(npmModule => {
  const moduleName = npmModule.moduleName
  const npmModulePath = resolveNpmModule(moduleName).split(moduleName)[0] + moduleName
  const moduleMetadata: ModuleMetadata = {
    cssImports: npmModule.cssImports?.map(i => path.relative(pathToPagePreview, i)),
    components: {}
  }
  npmModule.exports.forEach(component => {
    //TODO: properly extract info from actual npm module (SLAP-2392)
    const componentIdentifier = typeof component === 'string' ? component : component.exportIdentifier
    moduleMetadata.components[componentIdentifier] = {
      editable: true,
      importIdentifier: path.relative(pathToPagePreview, npmModulePath),
      acceptsChildren: false
    }
  })
  npmComponents[npmModule.moduleName] = moduleMetadata
})

export const moduleNameToComponentMetadata: ModuleNameToComponentMetadata = {
  ...npmComponents,
  localComponents,
  localLayouts,
  builtIn: { components: {} }
}