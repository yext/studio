const { parse } = require('@typescript-eslint/typescript-estree');
const fs = require('fs')
const path = require('path')

// TSStringKeyword TSNumberKeyword TSBooleanKeyword

module.exports = function parsePropInterface() {
  const file = fs.readFileSync(path.resolve(__dirname, '../../src/components/Banner.tsx'));
  const p = parse(file, { jsx: true });
  const exportInterface = p.body.find(n => n?.declaration?.id?.name === 'BannerProps')
  const props = exportInterface.declaration.body.body
  const propShape = {}
  for (const propSignature of props) {
    const name = propSignature.key.name
    const type = propSignature.typeAnnotation.typeAnnotation.type
    // console.log(name, type, propSignature.typeAnnotation.typeAnnotation)
    propShape[name] = type
  }
  return propShape
}