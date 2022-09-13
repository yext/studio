import { JsxAttributeLike, JsxElement, JsxExpression, JsxFragment, JsxSelfClosingElement, JsxText, SyntaxKind } from 'ts-morph'
import { v4 } from 'uuid'
import { ComponentState, PossibleModuleNames, PropState } from '../../shared/models'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import getComponentModuleName from './getComponentModuleName'
import parseJsxAttributes from './parseJsxAttributes'

export default function parseComponentState(
  c: JsxText | JsxExpression | JsxFragment | JsxElement | JsxSelfClosingElement,
  imports: Record<string, string[]>,
  parentUUIDsFromRoot?: string[]
): ComponentState | null {
  return deleteChildrenIfEmpty(undecoratedParseComponentState(c, imports, parentUUIDsFromRoot))
}

function undecoratedParseComponentState(
  c: JsxText | JsxExpression | JsxFragment | JsxElement | JsxSelfClosingElement,
  imports: Record<string, string[]>,
  parentUUIDsFromRoot?: string[]
): ComponentState | null {
  if (c.isKind(SyntaxKind.JsxText)) {
    if (c.getLiteralText().trim() !== '') {
      throw new Error(`Found JsxText with content "${c.getLiteralText()}". JsxText is not currently supported`)
    }
    return null
  }
  if (c.isKind(SyntaxKind.JsxExpression)) {
    throw new Error(
      `Jsx nodes of kind "${c.getKindName()}" are not supported for direct use in page files.`)
  }

  const uuid = v4()
  if (c.isKind(SyntaxKind.JsxSelfClosingElement)) {
    const name = c.getTagNameNode().getText()
    return {
      ...parseElement(c, name, imports),
      name,
      uuid,
      parentUUIDsFromRoot
    }
  }

  const nextParentUUIDs = (parentUUIDsFromRoot ?? []).concat([ uuid ])
  const children = parseChildren(c, imports, nextParentUUIDs)
  if (c.isKind(SyntaxKind.JsxFragment)) {
    return {
      name: '',
      isFragment: true,
      uuid,
      props: {},
      moduleName: 'builtIn',
      parentUUIDsFromRoot,
      children
    }
  }
  const name = c.getOpeningElement().getTagNameNode().getText()
  return {
    ...parseElement(c, name, imports),
    name,
    uuid,
    parentUUIDsFromRoot,
    children
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

function parseChildren(
  c: JsxFragment | JsxElement,
  imports: Record<string, string[]>,
  parentUUIDsFromRoot: string[]
): ComponentState[] {
  return c.getJsxChildren()
    .map(c => parseComponentState(c, imports, parentUUIDsFromRoot))
    .filter((c): c is ComponentState => !!c)
}

function deleteChildrenIfEmpty(data: ComponentState | null): ComponentState | null {
  if (data?.children?.length === 0) {
    delete data.children
  }
  return data
}