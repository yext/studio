import { JsxAttributeLike, JsxElement, JsxExpression, JsxFragment, JsxSelfClosingElement, JsxText, SyntaxKind } from 'ts-morph'
import { v1 } from 'uuid'
import { ComponentState } from '../../shared/models'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import getComponentModuleName from './getComponentModuleName'
import parseJsxAttributes from './parseJsxAttributes'

export default function parseComponentState(
  c: JsxText | JsxExpression | JsxFragment | JsxElement | JsxSelfClosingElement,
  imports: Record<string, string[]>,
  parentUUID?: string
): ComponentState | null {
  const data = deleteChildrenIfEmpty(undecoratedParseComponentState(c, imports))
  if (!data) return data

  if (parentUUID) {
    if (!data.parentUUIDsFromRoot) {
      data.parentUUIDsFromRoot = []
    }
    data.parentUUIDsFromRoot.push(parentUUID)
  }
  return data
}

function undecoratedParseComponentState(
  c: JsxText | JsxExpression | JsxFragment | JsxElement | JsxSelfClosingElement,
  imports: Record<string, string[]>
): ComponentState | null {
  if (c.isKind(SyntaxKind.JsxText)) {
    return null
  }
  if (c.isKind(SyntaxKind.JsxExpression)) {
    throw new Error(
      `Jsx nodes of kind "${c.getKindName()}" are not supported for direct use in page files.`)
  }

  if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
    const name = c.getTagNameNode().getText()
    return parseElement(c, name, imports)
  }

  const uuid = v1()
  const children = parseChildren(c, imports, uuid)
  if (c.isKind(SyntaxKind.JsxFragment)) {
    return {
      name: '',
      isFragment: true,
      uuid: v1(),
      props: {},
      moduleName: 'builtIn',
      children
    }
  }
  const name = c.getOpeningElement().getTagNameNode().getText()
  return {
    ...parseElement(c, name, imports),
    children
  }
}

function parseElement(
  c: JsxElement | JsxSelfClosingElement,
  name: string,
  imports: Record<string, string[]>
) {
  const moduleName = getComponentModuleName(name, imports, false)
  if (moduleName === 'builtIn') {
    throw new Error('parseComponentState does not currently support builtIn elements.')
  }
  const attributes: JsxAttributeLike[] = c.isKind(SyntaxKind.JsxSelfClosingElement)
    ? c.getAttributes()
    : c.getOpeningElement().getAttributes()
  const componentMetaData = moduleNameToComponentMetadata[moduleName][name]
  const props = componentMetaData.global
    ? componentMetaData.globalProps ?? {}
    : parseJsxAttributes(attributes, componentMetaData)
  return { name, moduleName, uuid: v1(), props }
}

function parseChildren(
  c: JsxFragment | JsxElement,
  imports: Record<string, string[]>,
  parentUUID: string
): ComponentState[] {
  return c.getJsxChildren()
    .map(c => parseComponentState(c, imports, parentUUID))
    .filter((c): c is ComponentState => !!c)
}

function deleteChildrenIfEmpty(data: ComponentState | null): ComponentState | null {
  if (data?.children?.length === 0) {
    delete data.children
  }
  return data
}