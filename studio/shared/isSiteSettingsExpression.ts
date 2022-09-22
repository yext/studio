import { SiteSettingsExpression } from '../types'

export function isSiteSettingsExpression(
  value: unknown
): value is SiteSettingsExpression {
  return typeof value === 'string' && value.startsWith('siteSettings.')
}