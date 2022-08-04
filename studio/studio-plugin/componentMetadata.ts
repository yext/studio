import studioConfig from '../../src/studio'
import parseNpmComponents from './ts-morph/parseNpmComponents'
import { ModuleMetadata, ModuleNameToComponentMetadata } from '../shared/models'
import fs from 'fs'
import getRootPath from './getRootPath'
import parsePropInterface from './ts-morph/parsePropInterface'
import { getSourceFile } from './ts-morph/common'

const npmComponentProps =
  Object.keys(studioConfig['npmComponents']).reduce((shapes, moduleName) => {
    const matchers = studioConfig.npmComponents[moduleName]
    shapes[moduleName] = parseNpmComponents(moduleName, matchers)
    return shapes
  }, {} as Record<keyof typeof studioConfig['npmComponents'], ModuleMetadata>)

const localComponents = fs.readdirSync(getRootPath('src/components'), 'utf-8').reduce((prev, curr) => {
  const componentName = curr.substring(0, curr.lastIndexOf('.'))
  prev[componentName] = parsePropInterface(
    getSourceFile(getRootPath(`src/components/${curr}`)),
    getRootPath(`src/components/${curr}`),
    `${componentName}Props`
  )
  return prev
}, {})

export const moduleNameToComponentMetadata: ModuleNameToComponentMetadata = {
  localComponents,
  ...npmComponentProps
}