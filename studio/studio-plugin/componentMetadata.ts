import { ModuleMetadata, ModuleNameToComponentMetadata } from '../shared/models'
import fs from 'fs'
import getRootPath from './getRootPath'
import { getSourceFile } from './common'
import path from 'path'
import parseComponentMetadata, { pathToPagePreview } from './ts-morph/parseComponentMetadata'

const localComponents: ModuleMetadata = fs
  .readdirSync(getRootPath('src/components'), 'utf-8')
  .reduce((prev, curr) => {
    const componentName = curr.substring(0, curr.indexOf('.'))
    prev[componentName] = parseComponentMetadata(
      getSourceFile(getRootPath(`src/components/${curr}`)),
      getRootPath(`src/components/${curr}`),
      `${componentName}Props`
    )
    return prev
  }, {})

const localLayouts: ModuleMetadata = fs
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
  }, {} as ModuleMetadata)

export const moduleNameToComponentMetadata: ModuleNameToComponentMetadata = {
  localComponents,
  localLayouts
}