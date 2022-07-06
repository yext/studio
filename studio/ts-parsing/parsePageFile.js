const path = require('path');
const { Project, ts } = require('ts-morph');
const { getComponentNodes, tsCompilerOptions } = require('./common');

module.exports = function parsePageFile() {
  const file = path.resolve(__dirname, '../../src/pages/index.tsx');
  const p = new Project(tsCompilerOptions);
  p.addSourceFilesAtPaths(file);
  const sourceFile = p.getSourceFileOrThrow(file);
  const usedComponents = getComponentNodes(sourceFile);
  return usedComponents.map(n => {
    const componentData = {
      name: n.compilerNode.tagName.escapedText,
      props: {}
    };
    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach(a => {
      const propName = a.getFirstDescendantByKind(ts.SyntaxKind.Identifier).compilerNode.text;
      const propValue = getPropValue(a);
      componentData.props[propName] = propValue;
    });
    return componentData;
  });
};

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
  const numberNode = n.getFirstDescendantByKind(ts.SyntaxKind.NumericLiteral);
  if (numberNode) {
    return parseFloat(numberNode.compilerNode.text);
  }
  throw new Error('unhandled prop value for node: ' + n.compilerNode);
}