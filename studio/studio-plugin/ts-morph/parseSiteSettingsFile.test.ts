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
      value: '2d8c550071a64ea23e263118a2b0680b'
    },
    businessId: {
      type: PropTypes.number,
      value: 13323123
    }
  })
  expect(console.error).not.toBeCalled()
})
