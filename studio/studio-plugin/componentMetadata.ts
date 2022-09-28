import { ModuleMetadata, ModuleNameToComponentMetadata, SymbolMetadata } from '../shared/models'
import fs from 'fs'
import getRootPath from './getRootPath'
import { getSourceFile } from './common'
import path from 'path'
import parseComponentMetadata, { pathToPagePreview } from './ts-morph/parseComponentMetadata'
import parseSymbolContent from './ts-morph/parseSymbolContent'

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
  localLayouts,
  builtIn: {}
}

// TODO: the creation of symbolNameToMetadata is dependant on moduleNameToComponentMetadata existing first.
// We should either manually pass moduleNameToComponentMetadata through every single method that needs it
// (which currently is the vast majority of them) or find a better way to organize things.
export const symbolNameToMetadata: Record<string, SymbolMetadata> = fs
  .readdirSync(getRootPath('src/symbols'), 'utf-8')
  .reduce((prev, curr) => {
    const symbolMetadata: SymbolMetadata = {
      content: parseSymbolContent(path.join(getRootPath('src/symbols'), curr))
    }
    prev[curr] = symbolMetadata
    return prev
  }, {} as Record<string, SymbolMetadata>)