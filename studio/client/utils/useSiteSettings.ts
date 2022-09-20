import { useStudioContext } from '../components/useStudioContext'

export function useSiteSettings(): Record<string, unknown> {
  const { siteSettingsState } = useStudioContext()
  const siteSettingsObj = {}
  Object.entries(siteSettingsState).forEach(([propName, propData]) => {
    siteSettingsObj[propName] = propData.value
  })
  return siteSettingsObj
}
