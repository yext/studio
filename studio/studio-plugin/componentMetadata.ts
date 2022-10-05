import { ComponentMetadata, ModuleMetadata, ModuleNameToComponentMetadata } from '../shared/models'
import fs from 'fs'
import getRootPath from './getRootPath'
import { getSourceFile } from './common'
import path from 'path'
import parseComponentMetadata, { pathToPagePreviewDir } from './ts-morph/parseComponentMetadata'
import parseNpmModule from './ts-morph/parseNpmModule'
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
    const importIdentifier = path.relative(pathToPagePreviewDir, getRootPath(`src/layouts/${curr}`))
    prev[componentName] = {
      acceptsChildren: true,
      global: false,
      editable: false,
      importIdentifier
    }
    return prev
  }, {} as Record<string, ComponentMetadata>)

const npmComponents: Record<string, ModuleMetadata> = {}
studioConfig.plugins?.forEach(npmModule => {
  npmComponents[npmModule.moduleName] = parseNpmModule(npmModule)
})

export const moduleNameToComponentMetadata: ModuleNameToComponentMetadata = {
  ...npmComponents,
  localComponents,
  localLayouts,
  builtIn: { components: {} }
}