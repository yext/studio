import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import openBrowser from 'react-dev-utils/openBrowser.js'
import createStudioPlugin from './studio-plugin/createStudioPlugin'

export default defineConfig(args => {
  if (args.mode === 'development' && args.command === 'serve') {
    openBrowser('http://localhost:3000/studio/client/')
  }

  return {
    plugins: [
      react(),
      createStudioPlugin()
    ],
    root: path.resolve(__dirname, '..'),
    server: {
      port: 3000
    },
    build: {
      rollupOptions: {
        input: '/studio/client/index.html',
      },
    }
  }
})
