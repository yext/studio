import { PropertyAssignment, ts } from 'ts-morph'
import { PropShape, PropState } from '../../shared/models'
import { getPropValue, getSourceFile } from '../common/common'

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
  const propState = {}
  // only support type PropertyAssignment
  siteSettingsNode
    .getProperties()
    .filter((p): p is PropertyAssignment => p.isKind(ts.SyntaxKind.PropertyAssignment))
    .forEach(p => {
      const value = getPropValue(p)
      const type = propShape[p.getName()].type
      propState[p.getName()] = { type, value }
    })
  return propState
}
