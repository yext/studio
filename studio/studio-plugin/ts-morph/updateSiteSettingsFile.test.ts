import fs from 'fs'
import getRootPath from '../getRootPath'
import updateSiteSettingsFile from './updateSiteSettingsFile'

jest.mock('../getRootPath')

beforeEach(() => {
  jest.spyOn(fs, 'writeFileSync').mockImplementation()
  jest.clearAllMocks()
})

it('can update props and add additional props', () => {
  updateSiteSettingsFile(
    {
      apiKey: 'new key!',
      experienceKey: 'slanswers-hier-facets',
      locale: 'en',
      experienceVersion: 'new experience version!',
      businessId: 11111
    }, 'siteSettings.ts')
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    expect.stringContaining('siteSettings.ts'),
    fs.readFileSync(getRootPath('siteSettingsAfterUpdate.ts'), 'utf-8')
  )
})
