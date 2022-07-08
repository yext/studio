import Banner, { BannerProps, defaultClassNames as RenamedImportedClassNames } from './components/Banner';
import { ColorProp } from './components/SpecialProps'

export default function() {
  return (
    <>
      <Banner title='first!' randomNum={1}/>
      <Banner/>
      <Banner title='three' randomNum={3} someBool={false}></Banner>
    </>
  );
}