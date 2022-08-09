import { Plugin } from 'vite'
import parseComponentMetadata, { pathToPagePreview } from './ts-morph/parseComponentMetadata'
import parseSiteSettingsFile from './ts-morph/parseSiteSettingsFile'
import parsePageFile from './ts-morph/parsePageFile'
import configureServer from './configureServer'
import { StudioProps } from '../client/components/Studio'
import studioConfig from '../../src/studio'
import getRootPath from './getRootPath'
import parseNpmComponents from './ts-morph/parseNpmComponents'
import { ModuleMetadata } from '../shared/models'
import { getSourceFile } from './ts-morph/common'
import fs from 'fs'
import path from 'path'
import openBrowser from 'react-dev-utils/openBrowser'

/**
 * Handles server-client communication.
 *
 * This inclues providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(args): Plugin {
  const virtualModuleId = 'virtual:yext-studio'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

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
  }, {} as ModuleMetadata)

  const localLayouts = fs.readdirSync(getRootPath('src/layouts'), 'utf-8').reduce((prev, curr) => {
    const componentName = curr.substring(0, curr.lastIndexOf('.'))
    prev[componentName] = {
      editable: false,
      importIdentifier: path.relative(pathToPagePreview, getRootPath(`src/layouts/${curr}`))
    }
    return prev
  }, {} as ModuleMetadata)

  const ctx: StudioProps = {
    siteSettings: {
      componentMetadata: parseComponentMetadata(
        getSourceFile(getRootPath('src/siteSettings.ts')),
        getRootPath('src/siteSettings.ts'),
        'SiteSettings'
      ),
      propState: parseSiteSettingsFile('src/siteSettings.ts', 'SiteSettings')
    },
    moduleNameToComponentMetadata: {
      localComponents: {
        ...localComponents,
        ...localLayouts
      },
      ...npmComponentProps
    },
    componentsOnPage: {
      index: parsePageFile('src/pages/index.tsx')
    }
  }

  return {
    name: 'yext-studio-vite-plugin',
    async buildStart() {
      if (args.mode === 'development' && args.command === 'serve') {
        openBrowser('http://localhost:3000/studio/client/')
      }
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(ctx)}`
      }
    },
    configureServer
  }
}
