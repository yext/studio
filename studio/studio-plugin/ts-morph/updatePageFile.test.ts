import fs from 'fs'
import updatePageFile from './updatePageFile'

jest.mock('../getRootPath')

// TODO there is currently a bug where we are not able to properly set props that are not yet set.
const expected = `import Banner, { BannerProps, defaultClassNames as RenamedImportedClassNames } from './components/Banner';
import { ColorProp } from './components/SpecialProps'
export default function() {
  return (
    <>
      <Banner title='first!' randomNum={1}/>
      <Banner/>
      <Banner title='three' randomNum={3} someBool={false}></Banner>
    </>
  );
}`

it('updates correctly', () => {
  jest.spyOn(fs, 'writeFileSync')
  updatePageFile(
    [
      {
        'name': 'Banner',
        'props': {
          'title': 'first!',
          'randomNum': 1,
        }
      },
      {
        'name': 'Banner',
        'props': {
          'title': 'two',
          'randomNum': 2,
          'someBool': false
        }
      },
      {
        'name': 'Banner',
        'props': {
          'title': 'three',
          'randomNum': 3,
          'someBool': false
        }
      }
    ]
  , 'testPage.tsx')
  expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('testPage.tsx'), expected)
})
