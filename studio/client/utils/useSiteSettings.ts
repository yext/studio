// import { useSiteSettingsStore } from '../components/Studio'
import { useStudioStore } from '../components/Studio'
import { useStudioContext } from '../components/useStudioContext'

export function useSiteSettings(): Record<string, unknown> {
  // const { siteSettingsState } = useStudioContext()
  const siteSettingsState = useStudioStore(state => state.siteSettings.state) ?? {}
  const siteSettingsObj = {}
  Object.entries(siteSettingsState).forEach(([propName, propData]) => {
    siteSettingsObj[propName] = propData.value
  })
  return siteSettingsObj
}
