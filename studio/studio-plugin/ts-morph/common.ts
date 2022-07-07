import { Identifier, JsxOpeningElement, JsxSelfClosingElement, SourceFile, ts } from 'ts-morph'
import { JsxEmit } from 'typescript'

export function getComponentNodes(sourceFile: SourceFile): (JsxOpeningElement | JsxSelfClosingElement)[] {
  const nodes = sourceFile
    .getDescendants()
    .filter(n => {
      return n.isKind(ts.SyntaxKind.JsxOpeningElement) || n.isKind(ts.SyntaxKind.JsxSelfClosingElement)
    }) as (JsxOpeningElement | JsxSelfClosingElement)[];
  return nodes;
}

export const tsCompilerOptions = {
  compilerOptions: {
    jsx: JsxEmit.ReactJSX
  }
}

export function getComponentName(n: JsxOpeningElement | JsxSelfClosingElement): string {
  const componentName =  n.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier).getText()
  return componentName;
}