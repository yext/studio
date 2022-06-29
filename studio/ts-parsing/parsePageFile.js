const { parse } = require('@typescript-eslint/typescript-estree');
const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const { Project } = require('ts-morph')

module.exports = parsePageFile;
function parsePageFile() {
  // const file = fs.readFileSync(path.resolve(__dirname, '../../src/pages/index.tsx'));
  // const p = parse(file, { jsx: true });
  // const pageDeclaration = p.body.find(n => n.type === 'ExportDefaultDeclaration').declaration;
  // const components = pageDeclaration.body.body.find(n => n.type === 'ReturnStatement').argument.children;
  // const componentData = components.filter(n => n.type === 'JSXElement').map(n => ({
  //   name: n.openingElement.name.name,
  //   props: convertAttributesToProps(n.openingElement.attributes)
  // }));
  // console.log(componentData);
  // fs.writeFileSync('bob.json', JSON.stringify(components, null, 2))
  // return componentData;
  const file = path.resolve(__dirname, '../../src/pages/index.tsx')
  // const p = ts.createProgram([file], {
  //   jsx: true
  // })
  // const sourceFile = p.getSourceFile(file);
  // /** @type {JsxOpeningElement[]} */
  // const openingJsxElements = []
  // // ts.SyntaxKind
  // ts.forEachChild(sourceFile, node => {
  //   console.log(node.kind)
  //   if (ts.isJsxAttribute(node)) {
  //     console.log(node)
  //     openingJsxElements.push(node)
  //   }
  // })
  // console.log(openingJsxElements[1].attributes)
  // console.log(sourceFile)

  const p = new Project()
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  sourceFile.
  sourceFile.forEachChild(n => {
    console.log('b')
    // console.log(n)
  })
}
parsePageFile();

function convertAttributesToProps(attributes) {
  return attributes.reduce((prev, curr) => {
    prev[curr.name.name] = curr.value?.value ?? curr.value?.expression?.value
    return prev;
  }, {})
}

/**
 * 
 * @param {ts.Node} node 
 * @returns 
 */
function visit(node) {
  if (!isNodeExported(node)) {
    return;
  }

  if (ts.isClassDeclaration(node) && node.name) {
    let symbol = checker.getSymbolAtLocation(node.name);
    if (symbol) {
      output.push(serializeClass(symbol));
    }
  } else if (ts.isModuleDeclaration(node)) {
    ts.forEachChild(node, visit);
  }
}