import fs from 'fs'
import { ts, PropertyAssignment } from 'ts-morph'
import { PropState } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getSourceFile, prettify } from './common'

export default function updateSiteSettingsFile(updatedState: PropState, pageFilePath: string) {
  const file = getRootPath(pageFilePath)
  const sourceFile = getSourceFile(file)
  const siteSettingsNode = sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.ObjectLiteralExpression)
    .find(n => n.getContextualType()?.getSymbol()?.getName() === 'SiteSettings')
  if (!siteSettingsNode) {
    throw new Error(`No site settings object found at "${pageFilePath}"`)
  }

  siteSettingsNode
    .getProperties()
    .filter((p): p is PropertyAssignment => p.isKind(ts.SyntaxKind.PropertyAssignment))
    .forEach(p => {
      const propName = p.getName()
      const propNewValue = updatedState[propName]
      siteSettingsNode.addPropertyAssignment({
        name: propName,
        initializer: typeof propNewValue === 'string' ? `'${propNewValue}'` : JSON.stringify(propNewValue)
      })
      p.remove()
    })

  const updatedFileText = prettify(sourceFile.getFullText())
  fs.writeFileSync(pageFilePath, updatedFileText)
}
