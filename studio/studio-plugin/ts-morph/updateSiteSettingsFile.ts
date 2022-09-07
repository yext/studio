import fs from 'fs'
import { ts } from 'ts-morph'
import { PropState } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getSourceFile, prettify, updatePropsObjectLiteral } from '../common'

export default function updateSiteSettingsFile(updatedState: PropState, pageFilePath: string) {
  const file = getRootPath(pageFilePath)
  const sourceFile = getSourceFile(file)
  const siteSettingsNode = sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.ObjectLiteralExpression)
    .find(n => n.getContextualType()?.getSymbol()?.getName() === 'SiteSettings')
  if (!siteSettingsNode) {
    throw new Error(`No site settings object found at "${pageFilePath}"`)
  }
  updatePropsObjectLiteral(siteSettingsNode, updatedState)
  const updatedFileText = prettify(sourceFile.getFullText())
  fs.writeFileSync(pageFilePath, updatedFileText)
}
