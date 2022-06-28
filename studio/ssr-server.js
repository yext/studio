const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')
const react = require('@vitejs/plugin-react');
const { createElement } = require('react')

const ReactDOMServer = require( "react-dom/server");
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
      const { Main } = await vite.ssrLoadModule(path.resolve(__dirname, "./preview/main.tsx"));
      const appHtml = ReactDOMServer.renderToString(createElement(Main));
      const html = template.replace(`<!--ssr-outlet-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })

  app.listen(3000)
}

createServer()