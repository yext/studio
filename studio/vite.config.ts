import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import parsePropInterface from './ts-parsing/parsePropInterface'
import parsePageFile from './ts-parsing/parsePageFile'
import path from 'path'
import openBrowser from 'react-dev-utils/openBrowser'

openBrowser('http://localhost:3000/studio')

export default defineConfig({
  plugins: [react(), yextStudio()],
  root: path.resolve(__dirname, '..'),
  preview: {
    port: 3000
  },
  build: {
    rollupOptions: {
      input: '/studio/index.html'
    }
  }
})

/**
 * Provides a vite virtual module so that server side data can be passed to the front end
 * for the initial load.
 */
function yextStudio() {
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
    }
  }
}