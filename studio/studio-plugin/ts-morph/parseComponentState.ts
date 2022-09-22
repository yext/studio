import { JsxAttributeLike, JsxElement, JsxFragment, JsxSelfClosingElement, SyntaxKind } from 'ts-morph'
import { v4 } from 'uuid'
import { ComponentState, PossibleModuleNames, PropState } from '../../shared/models'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import getComponentModuleName, { getImportPath } from './getComponentModuleName'
import parseJsxAttributes from './parseJsxAttributes'
import parseSymbol from './parseSymbol'

export default function parseComponentState(
  c: JsxFragment | JsxElement | JsxSelfClosingElement,
  imports: Record<string, string[]>
): ComponentState {
  const uuid = v4()
  if (c.isKind(SyntaxKind.JsxFragment)) {
    return {
      name: '',
      isFragment: true,
      uuid,
      props: {},
      moduleName: 'builtIn'
    }
  }
  const name = getName(c)
  const importPath = getImportPath(name, imports)
  if (importPath.endsWith('.symbol')) {
    if (!c.isKind(SyntaxKind.JsxSelfClosingElement)) {
      throw new Error(`Symbol component ${name} must be a JsxSelfClosingElement`)
    }
    return {
      uuid,
      symbolUUID
    }
  }

  if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
    return {
      ...parseElement(c, name, imports),
      name,
      uuid
    }
  } else {
    return {
      ...parseElement(c, name, imports),
      name,
      uuid
    }
  }
}

function getName(c: JsxElement | JsxSelfClosingElement) {
  if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
    return c.getTagNameNode().getText()
  } else {
    return c.getOpeningElement().getTagNameNode().getText()
  }
}

function parseElement(
  c: JsxElement | JsxSelfClosingElement,
  name: string,
  imports: Record<string, string[]>
): { moduleName: PossibleModuleNames, props: PropState } {
  const moduleName = getComponentModuleName(name, imports, false)
  if (moduleName === 'builtIn') {
    throw new Error('parseComponentState does not currently support builtIn elements.')
  }
  const attributes: JsxAttributeLike[] = c.isKind(SyntaxKind.JsxSelfClosingElement)
    ? c.getAttributes()
    : c.getOpeningElement().getAttributes()
  const componentMetadata = moduleNameToComponentMetadata[moduleName][name]
  const props = componentMetadata.global
    ? componentMetadata.globalProps ?? {}
    : parseJsxAttributes(attributes, componentMetadata)
  return { moduleName, props }
}
