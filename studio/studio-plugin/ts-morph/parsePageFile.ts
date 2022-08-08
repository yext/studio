import { JsxElement, JsxFragment, SourceFile, ts } from 'ts-morph'
import { PageState, ComponentState, PossibleModuleNames } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getComponentName, getComponentNodes, getPropName, getPropValue, getSourceFile } from './common'
import { v1 } from 'uuid'
import parseImports from './parseImports'

function parseLayoutState(
  sourceFile: SourceFile,
  imports: Record<string, string[]>
): { layoutState: ComponentState, layoutNode: JsxElement | JsxFragment } {
  let layoutState: ComponentState
  const returnStatement = sourceFile.getFirstDescendantByKind(ts.SyntaxKind.ReturnStatement)
  if (returnStatement) {
    const JsxNodeWrapper = returnStatement.getFirstChildByKind(ts.SyntaxKind.ParenthesizedExpression)
      ?? returnStatement
    const topLevelJsxNode = JsxNodeWrapper.getChildren()
      .find(n => n.getKind() === ts.SyntaxKind.JsxElement || n.getKind() === ts.SyntaxKind.JsxFragment)
    if (topLevelJsxNode) {
      if (topLevelJsxNode.getKind() === ts.SyntaxKind.JsxElement) {
        const name = getComponentName((topLevelJsxNode as JsxElement).getOpeningElement())
        layoutState = {
          name,
          props: {},
          uuid: v1(),
        }
        const isBuiltinJsxElement = name.charAt(0) === name.charAt(0).toLowerCase()
        if (!isBuiltinJsxElement && name !== 'Fragment') {
          layoutState.moduleName = getComponentModuleName(name, imports)
        }
      } else {
        layoutState = {
          name: '',
          props: {},
          uuid: v1(),
        }
      }
      return {
        layoutState,
        layoutNode: topLevelJsxNode as JsxElement | JsxFragment
      }
    }
  }
  throw new Error('Unable to find top level JSX element or JsxFragment type from file.')
}

export default function parsePageFile(filePath: string): PageState {
  const file = getRootPath(filePath)
  const sourceFile = getSourceFile(file)
  const imports = parseImports(sourceFile)

  const { layoutState, layoutNode } = parseLayoutState(sourceFile, imports)
  const usedComponents = getComponentNodes(layoutNode)

  const layoutJsxOpeningElement = layoutNode.getKind() === ts.SyntaxKind.JsxElement
    ? (layoutNode as JsxElement).getOpeningElement()
    : (layoutNode as JsxFragment).getOpeningFragment()

  const componentsState: ComponentState[] = []
  usedComponents.forEach(n => {
    if (n === layoutJsxOpeningElement) {
      return
    }
    const name = getComponentName(n)
    const componentData: ComponentState = {
      name,
      props: {},
      uuid: v1(),
      moduleName: getComponentModuleName(name, imports)
    }
    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach(a => {
      const propName = getPropName(a)
      if (!propName) {
        throw new Error('Could not parse page file')
      }
      const propValue = getPropValue(a)
      componentData.props[propName] = propValue
    })
    componentsState.push(componentData)
  })

  return {
    layoutState,
    componentsState
  }
}

function getComponentModuleName(name: string, imports: Record<string, string[]>): PossibleModuleNames {
  let moduleName = Object.keys(imports).find(importIdentifier => {
    const importedNames = imports[importIdentifier]
    return importedNames.includes(name)
  })
  if (!moduleName) {
    throw new Error(`Could not find import path/module for component "${name}"`)
  }
  if (moduleName.startsWith('.')) {
    moduleName = 'localComponents'
  }
  return moduleName as PossibleModuleNames
}
