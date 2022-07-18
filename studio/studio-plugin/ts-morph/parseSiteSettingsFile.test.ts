import parseSiteSettingsFile from './parseSiteSettingsFile'

jest.spyOn(console, 'error')

it('updates correctly', () => {
  const propState = parseSiteSettingsFile('studio/studio-plugin/__fixtures__/siteSettings.ts', 'SiteSettings')
  expect(propState).toEqual({
    apiKey: '2d8c550071a64ea23e263118a2b0680b',
    experienceKey: 'slanswers-hier-facets',
    locale: 'en',
    experienceVersion: 'STAGING',
    businessId: 13323123
  })
  expect(console.error).not.toBeCalled()
})
