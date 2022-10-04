const path = require('path')

const mapping = {
  'test-module/index.css': path.resolve(__dirname, '../__fixtures__/mock_modules/test-module/index.css')
}

function resolver(path, options) {
  return mapping[path] || options.defaultResolver(path, options)
}

module.exports = resolver