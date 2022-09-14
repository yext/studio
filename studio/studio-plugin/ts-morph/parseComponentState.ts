import { JsxAttributeLike, JsxElement, JsxExpression, JsxFragment, JsxSelfClosingElement, JsxText, SyntaxKind } from 'ts-morph'
import { v4 } from 'uuid'
import { ComponentState, PossibleModuleNames, PropState } from '../../shared/models'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import getComponentModuleName from './getComponentModuleName'
import parseJsxAttributes from './parseJsxAttributes'

export default function parseComponentState(
  c: JsxFragment | JsxElement | JsxSelfClosingElement,
  imports: Record<string, string[]>
): Omit<ComponentState, 'depth' | 'parentUUID'> {
  const uuid = v4()

  if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
    const name = c.getTagNameNode().getText()
    return {
      ...parseElement(c, name, imports),
      name,
      uuid
    }
  } else if (c.isKind(SyntaxKind.JsxFragment)) {
    return {
      name: '',
      isFragment: true,
      uuid,
      props: {},
      moduleName: 'builtIn'
    }
  } else {
    const name = c.getOpeningElement().getTagNameNode().getText()
    return {
      ...parseElement(c, name, imports),
      name,
      uuid
    }
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
