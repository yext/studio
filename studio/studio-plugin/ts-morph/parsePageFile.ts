import { JsxElement, JsxOpeningElement, ts } from 'ts-morph'
import { PageState, ComponentState, PossibleModuleNames } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getComponentName, getComponentNodes, getPropName, getPropValue, getSourceFile } from './common'
import { v1 } from 'uuid'
import parseImports from './parseImports'

export default function parsePageFile(filePath): PageState {
  const file = getRootPath(filePath)
  const sourceFile = getSourceFile(file)
  const usedComponents = getComponentNodes(sourceFile)
  const imports = parseImports(sourceFile)

  let layoutState: ComponentState
  let layoutOpeningElement: JsxOpeningElement
  const topLevelJsxNode = sourceFile.getFirstDescendantByKind(ts.SyntaxKind.JsxElement)
    ?? sourceFile.getFirstDescendantByKind(ts.SyntaxKind.JsxFragment)
  if (topLevelJsxNode) {
    if (ts.isJsxElement(topLevelJsxNode.compilerNode)) {
      layoutOpeningElement = (topLevelJsxNode as JsxElement).getOpeningElement()
      const name = getComponentName(layoutOpeningElement)
      layoutState = {
        name,
        props: {},
        uuid: v1(),
      }
      if (!['Fragment', 'div'].includes(name)) {
        layoutState.moduleName = getComponentModuleName(name, imports)
      }
    } else {
      layoutState = {
        name: '',
        props: {},
        uuid: v1()
      }
    }
  } else {
    throw new Error('Unable to find top level JSX element or JsxFragment type from file.')
  }

  const componentsState: ComponentState[] = []
  usedComponents.forEach(n => {
    const name = getComponentName(n)
    if (n === layoutOpeningElement) {
      return
    }
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
