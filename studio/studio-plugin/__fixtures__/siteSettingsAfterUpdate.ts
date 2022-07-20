export interface SiteSettings {
  apiKey: string
  experienceKey: string
  locale: string
  experienceVersion: string
  businessId: number
}

export default {
  apiKey: 'new key!',
  experienceKey: 'slanswers-hier-facets',
  locale: 'en',
  experienceVersion: 'new experience version!',
  businessId: 11111,
} as SiteSettings
