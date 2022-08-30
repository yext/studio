import { ts } from 'ts-morph'
import { PropShape, PropState } from '../../shared/models'
import { getSourceFile, getPropsState } from '../common'

export default function parseSiteSettingsFile(
  file: string,
  interfaceName: string,
  propShape: PropShape
): PropState {
  const sourceFile = getSourceFile(file)
  const siteSettingsNode = sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.ObjectLiteralExpression)
    .find(n => n.getContextualType()?.getSymbol()?.getName() === interfaceName)
  if (!siteSettingsNode) {
    throw new Error(`unable to find site settings object of type ${interfaceName} in file: ${file}`)
  }
  return getPropsState(siteSettingsNode, propShape)
}
