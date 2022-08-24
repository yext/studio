import studioConfig from '../../src/studio'
import parseNpmComponents from './ts-morph/parseNpmComponents'
import { ModuleMetadata, ModuleNameToComponentMetadata } from '../shared/models'
import fs from 'fs'
import getRootPath from './getRootPath'
import { getSourceFile } from './common'
import path from 'path'
import parseComponentMetadata, { pathToPagePreview } from './ts-morph/parseComponentMetadata'

const npmComponentProps =
  Object.keys(studioConfig['npmComponents']).reduce((shapes, moduleName) => {
    const matchers = studioConfig.npmComponents[moduleName]
    shapes[moduleName] = parseNpmComponents(moduleName, matchers)
    return shapes
  }, {} as Record<keyof typeof studioConfig['npmComponents'], ModuleMetadata>)

const localComponents = fs.readdirSync(getRootPath('src/components'), 'utf-8').reduce((prev, curr) => {
  const componentName = curr.substring(0, curr.lastIndexOf('.'))
  prev[componentName] = parseComponentMetadata(
    getSourceFile(getRootPath(`src/components/${curr}`)),
    getRootPath(`src/components/${curr}`),
    `${componentName}Props`
  )
  return prev
}, {})

const localLayouts = fs.readdirSync(getRootPath('src/layouts'), 'utf-8').reduce((prev, curr) => {
  const componentName = curr.substring(0, curr.lastIndexOf('.'))
  prev[componentName] = {
    editable: false,
    importIdentifier: path.relative(pathToPagePreview, getRootPath(`src/layouts/${curr}`))
  }
  return prev
}, {} as ModuleMetadata)

export const moduleNameToComponentMetadata: ModuleNameToComponentMetadata = {
  localComponents,
  localLayouts,
  ...npmComponentProps
}