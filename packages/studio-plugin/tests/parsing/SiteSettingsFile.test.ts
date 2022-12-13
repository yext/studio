import SiteSettingsFile from '../../src/parsing/SiteSettingsFile'
import { getSiteSettingsPath } from '../__utils__/getFixturePath'

it('can parse SiteSettings', () => {
  const siteSettingsFile = new SiteSettingsFile(getSiteSettingsPath())
  expect(siteSettingsFile.getSiteSettings()).toEqual({
    shape: { mySetting: { type: 'string' } },
    values: {
      mySetting: {
        valueType: 'string',
        kind: 'literal',
        value: 'just the two of us'
      }
    }
  })
})

it('errors out if the default export is missing', () => {
  const siteSettingsFile = new SiteSettingsFile(getSiteSettingsPath('blankFile.ts'))
  expect(() => siteSettingsFile.getSiteSettings()).toThrow('No default export found for site settings')
})