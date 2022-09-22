import { PropTypes } from '../../types'
import getRootPath from '../getRootPath'
import parseSiteSettingsFile from './parseSiteSettingsFile'

jest.spyOn(console, 'error')
jest.mock('../getRootPath')

it('updates correctly', () => {
  const propState = parseSiteSettingsFile(
    getRootPath('siteSettings.ts'),
    'SiteSettings',
    {
      apiKey: { type: PropTypes.string },
      businessId: { type: PropTypes.number }
    }
  )
  expect(propState).toEqual({
    apiKey: {
      type: PropTypes.string,
      value: 'old_key'
    },
    businessId: {
      type: PropTypes.number,
      value: 13323123
    }
  })
  expect(console.error).not.toBeCalled()
})
