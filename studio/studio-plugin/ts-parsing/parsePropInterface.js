const { parse } = require('@typescript-eslint/typescript-estree');
const fs = require('fs');
const getRootPath = require('../getRootPath');

// TODO Currently only supports TSStringKeyword TSNumberKeyword TSBooleanKeyword and is hardcoded to Banner.tsx
module.exports = function parsePropInterface() {
  const file = fs.readFileSync(getRootPath('src/components/Banner.tsx'));
  const p = parse(file, { jsx: true });
  const exportInterface = p.body.find(n => n?.declaration?.id?.name === 'BannerProps');
  const props = exportInterface.declaration.body.body;
  const propShape = {};
  for (const propSignature of props) {
    const name = propSignature.key.name;
    const type = propSignature.typeAnnotation.typeAnnotation.type;
    propShape[name] = type;
  }
  console.log(propShape);
  return propShape;
};