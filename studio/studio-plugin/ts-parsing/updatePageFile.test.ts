const fs = require('fs')
const updatePageFile = require('./updatePageFile')

// TODO there is currently a bug where we are not able to properly set props that are not yet set.
const expected = `import { Banner } from '../components/Banner';
// import Layout from '../layouts/layout';

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
  )
  expect(fs.writeFileSync).toHaveBeenCalledWith('/Users/oshi/studio-prototype/src/pages/index.tsx', expected)
})
