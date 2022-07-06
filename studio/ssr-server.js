const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')
const react = require('@vitejs/plugin-react');
const openBrowser = require('react-dev-utils/openBrowser');
const parsePageFile = require('./ts-parsing/parsePageFile')
const parsePropInterface = require('./ts-parsing/parsePropInterface')

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
    plugins: [react()],
    optimizeDeps: {
      include: ['react/jsx-runtime'],
    },
  })

  app.use(vite.middlewares)
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl
    try {
      const template = await vite.transformIndexHtml(url, fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      ))
      const render = (await vite.ssrLoadModule('/studio/preview/entry-server.tsx')).render;
      const ctx = {
        componentsToPropShapes: {
          Banner: parsePropInterface()
        },
        componentsOnPage: {
          index: parsePageFile()
        }
      }
      const appHtml = render(url, ctx)
      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace('// ssr-context', `window.__ssrContext = ${JSON.stringify(ctx)}`)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })

  app.listen(3000)

  openBrowser('http://localhost:3000/');
}

createServer()