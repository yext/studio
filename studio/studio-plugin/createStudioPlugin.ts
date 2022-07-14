import { Plugin } from 'vite'
import parsePropInterface from './ts-morph/parsePropInterface'
import parsePageFile from './ts-morph/parsePageFile'
import configureServer from './configureServer'
import { StudioProps } from '../client/components/Studio'

/**
 * Handles server-client communication.
 *
 * This inclues providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(): Plugin {
  const virtualModuleId = 'virtual:yext-studio'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const ctx: StudioProps = {
    siteSettings: {
      propShape: parsePropInterface('src/siteSettings.ts', 'SiteSettings'),
      propState: {}
    },
    componentsToPropShapes: {
      Banner: parsePropInterface('src/components/Banner.tsx', 'BannerProps')
    },
    componentsOnPage: {
      index: parsePageFile('src/pages/index.tsx')
    }
  }

  return {
    name: 'yext-studio-vite-plugin',
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