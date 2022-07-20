import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import openBrowser from 'react-dev-utils/openBrowser'
import createStudioPlugin from './studio-plugin/createStudioPlugin'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
// import viteCommonjs from 'vite-plugin-commonjs'

export default defineConfig(args => {
  if (args.mode === 'development' && args.command === 'serve') {
    openBrowser('http://localhost:3000/studio/client/')
  }

  return {
    plugins: [
      viteCommonjs(),
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
      // commonjsOptions: {
      //   include: /node_modules/,
      //   transformMixedEsModules: true
      //   include: [/src/]
      // }
    },
    optimizeDeps: {
      include: [
        '@yext/answers-react-components',
        '@yext/answers-headless-react',
        'react-collapsed',
        'lodash'
      ],
      force: true
    }
  }
})
