import fs from 'fs'
import { PropTypes } from '../../types'
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
      apiKey: {
        type: PropTypes.string,
        value: 'new key!'
      },
      businessId: {
        type: PropTypes.number,
        value: 11111
      }
    }, 'siteSettings.ts')
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    expect.stringContaining('siteSettings.ts'),
    fs.readFileSync(getRootPath('siteSettingsAfterUpdate.ts'), 'utf-8')
  )
})
