import { Plugin } from 'vite'
import parseComponentMetadata from './ts-morph/parseComponentMetadata'
import parseSiteSettingsFile from './ts-morph/parseSiteSettingsFile'
import parsePageFile from './ts-morph/parsePageFile'
import configureServer from './configureServer'
import { StudioProps } from '../client/components/Studio'
import getRootPath from './getRootPath'
import { getSourceFile } from './common'
import { moduleNameToComponentMetadata, symbolNameToMetadata } from './componentMetadata'
import getPagePath from './getPagePath'
import openBrowser from 'react-dev-utils/openBrowser.js'
import { ComponentMetadata } from '../shared/models'
import path from 'path'

/**
 * Handles server-client communication.
 *
 * This includes providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(args): Plugin {
  const virtualModuleId = 'virtual:yext-studio'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  const studioCtxFilePaths = {
    siteSettings: getRootPath('src/siteSettings.ts'),
    pages: {
      index: getPagePath('index.tsx')
    }
  }
  const siteSettingsMetadata: ComponentMetadata = parseComponentMetadata(
    getSourceFile(studioCtxFilePaths.siteSettings),
    studioCtxFilePaths.siteSettings,
    'SiteSettings'
  )
  const getStudioProps = (): StudioProps => {
    const indexPageState = parsePageFile(studioCtxFilePaths.pages.index)

    return {
      siteSettings: {
        componentMetadata: siteSettingsMetadata,
        propState: parseSiteSettingsFile(studioCtxFilePaths.siteSettings, 'SiteSettings', siteSettingsMetadata.propShape ?? {})
      },
      moduleNameToComponentMetadata,
      componentsOnPage: {
        index: indexPageState,
      },
      symbolNameToMetadata
    }
  }

  const updateComponentMetadata = (file: string) => {
    const fileName = path.basename(file)
    const componentName = fileName.substring(0, fileName.indexOf('.'))
    moduleNameToComponentMetadata.localComponents[componentName] = parseComponentMetadata(
      getSourceFile(getRootPath(`src/components/${fileName}`)),
      getRootPath(`src/components/${fileName}`),
      `${componentName}Props`
    )
  }

  let ctx: StudioProps = getStudioProps()

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
    configureServer,
    handleHotUpdate({ file, server }) {
      const { moduleGraph, ws } = server
      const module = moduleGraph.getModuleById(resolvedVirtualModuleId)
      if (!module) {
        console.error(`Unable to find vite virtual module: "${resolvedVirtualModuleId}".`)
        return
      }
      const studioCtxFilePathsArray = [
        studioCtxFilePaths.siteSettings,
        ...Object.values(studioCtxFilePaths.pages)
      ]
      const isGlobalComponentFile = file.endsWith('global.tsx')
      if (studioCtxFilePathsArray.includes(file) || isGlobalComponentFile) {
        console.log('Updating data export by "virtual:yext-studio".')
        if (isGlobalComponentFile) {
          updateComponentMetadata(file)
        }
        ctx = getStudioProps()
        moduleGraph.invalidateModule(module)
      } else if (file.startsWith(getRootPath('./src/'))) {
        ws.send({
          type: 'full-reload',
          path: '*'
        })
      }
    },
  }
}
