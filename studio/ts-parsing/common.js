const { Project, ts } = require('ts-morph')

exports.getComponentNodes = function(sourceFile) {
  return sourceFile.getDescendants().filter(n => [
    ts.SyntaxKind.JsxOpeningElement,
    ts.SyntaxKind.JsxSelfClosingElement
  ].includes(n.compilerNode.kind))
}