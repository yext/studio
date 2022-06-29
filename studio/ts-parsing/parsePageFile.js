const fs = require('fs')
const path = require('path')
const { Project, ts } = require('ts-morph')

module.exports = parsePageFile;
function parsePageFile() {
  const file = path.resolve(__dirname, '../../src/pages/index.tsx')
  const p = new Project({
    compilerOptions: {
      jsx: true
    }
  })
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  const usedComponents = [
    ...sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxOpeningElement),
    ...sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxSelfClosingElement)
  ]
  usedComponents.forEach(n => {
    const componentData = {
      name: n.compilerNode.tagName.escapedText,
      props: {}
    }
    fs.writeFileSync('bob.json', JSON.stringify(n.compilerNode, (k, v) => ['parent', 'pos', 'end', 'flags', 'modifierFlagsCache', 'transformFlags'].includes(k) ? undefined : v, 2))
    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach(a => {
      const propName = a.getFirstDescendantByKind(ts.SyntaxKind.Identifier).compilerNode.text;
      const propValue = getPropValue(a);
      componentData.props[propName] = propValue;
    })
    console.log(componentData)
    return componentData
  })
}
parsePageFile();

/**
 * @param {import('ts-morph').JsxAttribute} n 
 */
function getPropValue(n) {
  const stringNode = n.getFirstDescendantByKind(ts.SyntaxKind.StringLiteral);
  if (stringNode) {
    return stringNode.compilerNode.text;
  }
  if (n.getFirstDescendantByKind(ts.SyntaxKind.TrueKeyword)) return true;
  if (n.getFirstDescendantByKind(ts.SyntaxKind.FalseKeyword)) return false;
  const numberNode = n.getFirstDescendantByKind(ts.SyntaxKind.NumericLiteral)
  if (numberNode) {
    return parseFloat(numberNode.compilerNode.text)
  }
  throw new Error('unhandled prop value for node: ' + n.compilerNode)
}