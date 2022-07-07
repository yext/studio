import { Plugin } from 'vite'
import parsePropInterface from './ts-parsing/parsePropInterface'
import parsePageFile from './ts-parsing/parsePageFile'
import configureServer from './configureServer'

/**
 * Handles server-client communication.
 *
 * This inclues providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default function createStudioPlugin(): Plugin {
  const virtualModuleId = 'virtual:yext-studio'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const ctx = {
    componentsToPropShapes: {
      Banner: parsePropInterface()
    },
    componentsOnPage: {
      index: parsePageFile()
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