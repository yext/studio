import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import createStudioPlugin from './studio-plugin/createStudioPlugin'

export default defineConfig(args => {
  return {
    plugins: [
      react(),
      createStudioPlugin(args)
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
