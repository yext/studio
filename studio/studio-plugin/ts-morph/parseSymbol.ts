import { JsxChild, JsxElement, JsxSelfClosingElement } from 'ts-morph';
import { ComponentState } from '../../shared/models';
import { getDefaultExport, getSourceFile } from '../common';
import getTopLevelJsxNode from './getTopLevelJsxNode';
import parseComponentState from './parseComponentState';
import parseImports from './parseImports';
import parseJsxChild from './parseJsxChild';

export default function parseSymbol(element: JsxSelfClosingElement, filePath: string): ComponentState {
  const sourceFile = getSourceFile(filePath)
  const imports = parseImports(sourceFile)
  const defaultExport = getDefaultExport(sourceFile)
  const topLevelJsxNode = getTopLevelJsxNode(defaultExport)

  const componentStates: ComponentState[] = [ parseComponentState(topLevelJsxNode, imports) ]

  topLevelJsxNode.getJsxChildren().forEach((c: JsxChild) => {
    const componentState = parseJsxChild(c, imports)

    if (componentState) {
      componentsState.push(...componentState)
    }
  })

  return {
    layoutState,
    componentsState
  }
}