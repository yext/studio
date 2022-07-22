import { PropertyAssignment, ts } from 'ts-morph'
import { PropState } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getPropValue, getSourceFile } from './common'

export default function parseSiteSettingsFile(filePath: string, interfaceName: string): PropState {
  const file = getRootPath(filePath)
  const sourceFile = getSourceFile(file)
  const siteSettingsNode = sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.ObjectLiteralExpression)
    .find(n => n.getContextualType()?.getSymbol()?.getName() === interfaceName)

  if (!siteSettingsNode) {
    throw new Error(`unable to find site settings object of type ${interfaceName} in filepath ${filePath}`)
  }

  const propState = {}
  // only support type PropertyAssignment
  siteSettingsNode
    .getProperties()
    .filter((p): p is PropertyAssignment => p.isKind(ts.SyntaxKind.PropertyAssignment))
    .forEach(p => propState[p.getName()] = getPropValue(p))
  return propState
}
