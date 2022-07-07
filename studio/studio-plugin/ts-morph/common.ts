import { ts } from 'ts-morph'
import { JsxEmit } from 'typescript'
export function getComponentNodes(sourceFile) {
  return sourceFile.getDescendants().filter(n => [
    ts.SyntaxKind.JsxOpeningElement,
    ts.SyntaxKind.JsxSelfClosingElement
  ].includes(n.compilerNode.kind))
}

export const tsCompilerOptions = {
  compilerOptions: {
    jsx: JsxEmit.ReactJSX
  }
}