import { ts } from 'ts-morph'
import { PropState } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getSourceFile } from '../common/common'
import parseObjectLiteralExpression from '../common/parseObjectLiteralExpression'

export default function parseSiteSettingsFile(filePath: string, interfaceName: string): PropState {
  const file = getRootPath(filePath)
  const sourceFile = getSourceFile(file)
  const siteSettingsNode = sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.ObjectLiteralExpression)
    .find(n => n.getContextualType()?.getSymbol()?.getName() === interfaceName)

  if (!siteSettingsNode) {
    throw new Error(`unable to find site settings object of type ${interfaceName} in filepath ${filePath}`)
  }

  return parseObjectLiteralExpression(siteSettingsNode)
}
