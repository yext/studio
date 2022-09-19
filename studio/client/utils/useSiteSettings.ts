import { PropState } from '../../shared/models'

export function useSiteSettings(siteSettingsProp: PropState): Record<string, any> {
  const siteSettingsObj = {}
  Object.entries(siteSettingsProp).forEach(([propName, propData]) => {
    siteSettingsObj[propName] = propData.value
  })
  return siteSettingsObj
}
